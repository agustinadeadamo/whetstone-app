/**
 * Pure JSON extraction and repair for (possibly malformed) LLM output.
 *
 * This module is intentionally only the *pure* parse/extract/repair logic. The
 * production grading pipeline — Zod schema validation, the safe `failed`
 * fallback, reliability metadata, and any LLM-based repair — belongs to the
 * grader (step 5) and is specified in ADR 0014. Nothing here trusts the parsed
 * shape: callers must validate it.
 */

type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false };

function tryParse(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

/** Strip a surrounding ```json … ``` (or bare ``` … ```) fence, if present. */
function stripCodeFences(text: string): string {
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i;
  const match = text.match(fence);
  return match ? match[1].trim() : text;
}

/**
 * Return the first balanced `{…}` object substring, walking the text while
 * tracking string state and escapes so braces inside strings never miscount.
 * If the object never closes (truncated input), returns the fragment from the
 * first `{` to the end so the caller can attempt a repair. Returns null only
 * when there is no `{` at all.
 */
function extractFirstObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      if (inString) escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  // Reached the end still open — hand back the truncated fragment for repair.
  return text.slice(start);
}

interface ScanState {
  open: string[];
  inString: boolean;
  lastStringStart: number;
}

/** Scan a fragment for its open-container stack and trailing string state. */
function scan(text: string): ScanState {
  const open: string[] = [];
  let inString = false;
  let escape = false;
  let lastStringStart = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      if (inString) escape = true;
      continue;
    }
    if (ch === '"') {
      if (!inString) {
        inString = true;
        lastStringStart = i;
      } else {
        inString = false;
      }
      continue;
    }
    if (inString) continue;

    if (ch === '{' || ch === '[') {
      open.push(ch);
    } else if (ch === '}' || ch === ']') {
      open.pop();
    }
  }

  return { open, inString, lastStringStart };
}

/**
 * Best-effort repair of a truncated or dangling JSON fragment into a parseable
 * string. Pure `string → string`; never throws. The caller decides whether the
 * result is usable by attempting to parse it.
 *
 * Handles: an unterminated string (closed if it is a value, discarded if it is
 * a key still being typed), trailing/dangling commas, a dangling `key:` with no
 * value, and unclosed objects/arrays (closed in reverse, LIFO, order).
 *
 * A field that was cut off before its value is *discarded*, never given a
 * fabricated value — the missing field is then caught downstream by schema
 * validation (step 5) rather than silently invented here.
 */
export function repairTruncatedJSON(input: string): string {
  const state = scan(input);
  let text = input;

  // 1. An unterminated string at the very end.
  if (state.inString && state.lastStringStart >= 0) {
    const before = text.slice(0, state.lastStringStart).replace(/\s+$/, '');
    const prevChar = before[before.length - 1];
    if (prevChar === ':') {
      // It is a value being typed — close it and keep the field.
      text = `${text}"`;
    } else {
      // It is a key (or element) being typed with no value — discard it.
      text = before;
    }
  }

  // 2. Drop any comma that directly precedes a closing brace/bracket. Not
  //    string-aware (a literal ",}" inside a value could be touched); acceptable
  //    as a last resort whose output is re-validated downstream before use.
  text = text.replace(/,(\s*[}\]])/g, '$1');

  // 3. Trailing cleanup, looped until stable: drop a dangling comma, or a
  //    dangling `"key":` with no value (the incomplete field is discarded).
  const danglingField = /,?\s*"(?:[^"\\]|\\.)*"\s*:\s*$/;
  let previous: string;
  do {
    previous = text;
    text = text.replace(/\s+$/, '');
    if (/,$/.test(text)) {
      text = text.replace(/,$/, '');
    } else if (danglingField.test(text)) {
      text = text.replace(danglingField, '');
    }
  } while (text !== previous);

  // 4. Close any still-open containers in reverse (LIFO) order.
  const closers = state.open
    .slice()
    .reverse()
    .map((ch) => (ch === '{' ? '}' : ']'))
    .join('');

  return text + closers;
}

/**
 * Extract and parse a JSON object from arbitrary, possibly LLM-produced, text.
 *
 * Pipeline, each step a fallback for the previous: direct parse → strip code
 * fences → extract the first balanced `{…}` (string/escape aware) → repair a
 * truncated fragment → give up. Returns the parsed value, or `null` if the
 * input is unrecoverable. Never throws.
 *
 * The returned value is typed `unknown`: its shape is not known here and must
 * be validated by the caller (Golden Rule 3). `null` is the sentinel for
 * unrecoverable input — distinct from any field within a parsed object.
 *
 * Deliberate boundary: this only extracts a top-level **object** (`{…}`), not a
 * top-level array (`[…]`). Grading output is always an object, so an array at
 * the top level is treated as no match rather than a bug.
 */
export function extractAndParseJSON(text: string): unknown | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  // 1. Direct parse.
  const direct = tryParse(trimmed);
  if (direct.ok) return direct.value;

  // 2. Strip a surrounding code fence and retry.
  const unfenced = stripCodeFences(trimmed);
  if (unfenced !== trimmed) {
    const fenced = tryParse(unfenced);
    if (fenced.ok) return fenced.value;
  }

  // 3. Extract the first balanced object (discards surrounding prose).
  const candidate = extractFirstObject(unfenced);
  if (candidate === null) return null;

  const extracted = tryParse(candidate);
  if (extracted.ok) return extracted.value;

  // 4. Repair a truncated fragment and retry.
  const repaired = tryParse(repairTruncatedJSON(candidate));
  if (repaired.ok) return repaired.value;

  // 5. Unrecoverable.
  return null;
}
