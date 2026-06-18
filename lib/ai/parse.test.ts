import { describe, expect, it } from 'vitest';
import { extractAndParseJSON, repairTruncatedJSON } from './parse';

describe('extractAndParseJSON', () => {
  it('parses clean JSON (1)', () => {
    expect(extractAndParseJSON('{"score":5,"feedback":"ok"}')).toEqual({
      score: 5,
      feedback: 'ok',
    });
  });

  it('strips ```json code fences (2)', () => {
    const text = '```json\n{"score":5}\n```';
    expect(extractAndParseJSON(text)).toEqual({ score: 5 });
  });

  it('ignores prose before and after the object (3)', () => {
    const text = 'Here is the grade: {"score":5}. Hope it helps!';
    expect(extractAndParseJSON(text)).toEqual({ score: 5 });
  });

  it('repairs a trailing/dangling comma (4)', () => {
    expect(extractAndParseJSON('{"score":5,}')).toEqual({ score: 5 });
  });

  it('does not split on braces inside a string (5)', () => {
    const text = '{"note":"use {} and } carefully","score":5}';
    expect(extractAndParseJSON(text)).toEqual({
      note: 'use {} and } carefully',
      score: 5,
    });
  });

  it('respects escaped quotes inside a string (5b)', () => {
    const text = '{"q":"say \\"hi\\" }","ok":true}';
    expect(extractAndParseJSON(text)).toEqual({ q: 'say "hi" }', ok: true });
  });

  it('repairs truncation mid-string, keeping earlier fields (6)', () => {
    expect(extractAndParseJSON('{"score":5,"feedback":"good ans')).toEqual({
      score: 5,
      feedback: 'good ans',
    });
  });

  it('repairs truncation mid-array (7)', () => {
    expect(extractAndParseJSON('{"tags":["a","b"')).toEqual({
      tags: ['a', 'b'],
    });
  });

  it('repairs truncation at a dangling comma (8)', () => {
    expect(extractAndParseJSON('{"score":5,')).toEqual({ score: 5 });
  });

  it('discards a truncated partial key (9)', () => {
    expect(extractAndParseJSON('{"score":5,"fee')).toEqual({ score: 5 });
  });

  it('discards a dangling colon with no value — no fabricated data (10)', () => {
    expect(extractAndParseJSON('{"score":5,"feedback":')).toEqual({ score: 5 });
  });

  it('closes nested truncation in reverse order (11)', () => {
    expect(extractAndParseJSON('{"a":{"b":[1,2')).toEqual({
      a: { b: [1, 2] },
    });
  });

  describe('returns null on unrecoverable input without throwing (12)', () => {
    const cases = ['', '   ', 'not json', '<html></html>', '{{{'];
    for (const input of cases) {
      it(`-> null for ${JSON.stringify(input)}`, () => {
        expect(() => extractAndParseJSON(input)).not.toThrow();
        expect(extractAndParseJSON(input)).toBeNull();
      });
    }
  });
});

describe('repairTruncatedJSON', () => {
  const parseRepaired = (s: string): unknown => JSON.parse(repairTruncatedJSON(s));

  it('leaves already-valid JSON intact (13)', () => {
    expect(repairTruncatedJSON('{"a":1}')).toBe('{"a":1}');
    expect(parseRepaired('{"a":1}')).toEqual({ a: 1 });
  });

  it('closes an open string (14)', () => {
    expect(parseRepaired('{"a":"x')).toEqual({ a: 'x' });
  });

  it('removes a dangling comma (15)', () => {
    expect(parseRepaired('[1,2,')).toEqual([1, 2]);
  });

  it('discards a dangling colon with no value (16)', () => {
    expect(parseRepaired('{"a":')).toEqual({});
  });

  it('closes nested containers in LIFO order (17)', () => {
    expect(parseRepaired('{"a":[{"b":1')).toEqual({ a: [{ b: 1 }] });
  });
});
