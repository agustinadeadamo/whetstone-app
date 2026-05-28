"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

/* Helper: tabs with local selected state. */
function Tabs({
  variant,
  items,
}: {
  variant: "pill" | "line";
  items: readonly string[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div className={variant === "pill" ? "tabs" : "tabs-line"} role="tablist">
      {items.map((label, i) => (
        <button
          key={label}
          role="tab"
          aria-selected={active === i}
          onClick={() => setActive(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* CSS custom-property style helper to satisfy TS. */
const cssVars = (vars: Record<string, string | number>): CSSProperties =>
  vars as CSSProperties;

const C = ({ children }: { children: string }) => (
  <span className="tok-cmt">{`/* ${children} */`}</span>
);
const P = ({ children }: { children: ReactNode }) => (
  <span className="tok-prop">{children}</span>
);
const V = ({ children }: { children: ReactNode }) => (
  <span className="tok-val">{children}</span>
);
const N = ({ children }: { children: ReactNode }) => (
  <span className="tok-num">{children}</span>
);
const S = ({ children }: { children: ReactNode }) => (
  <span className="tok-str">{children}</span>
);

function CodeBlock() {
  const preRef = useRef<HTMLPreElement>(null);
  const [label, setLabel] = useState("Copy ↗");

  function copy() {
    const text = preRef.current?.innerText ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setLabel("Copied ✓");
      window.setTimeout(() => setLabel("Copy ↗"), 1400);
    });
  }

  return (
    <div className="code">
      <button className="copy" onClick={copy}>
        {label}
      </button>
      <pre ref={preRef}>
        <C>{"STDY_SYS · SOFT MODERN · v2.0"}</C>
        {"\n:root {\n  "}
        <C>{"NEUTRALS · warm"}</C>
        {"\n  "}<P>--c-bg</P>:           <V>#F6F4F1</V>;
        {"\n  "}<P>--c-surface</P>:      <V>#FFFFFF</V>;
        {"\n  "}<P>--c-surface-2</P>:    <V>#FAF8F5</V>;
        {"\n  "}<P>--c-line</P>:         <V>#ECE9E3</V>;
        {"\n  "}<P>--c-line-strong</P>:  <V>#DAD5CC</V>;
        {"\n  "}<P>--c-ink</P>:          <V>#1A1A2E</V>;  <C>{"headings · soft black"}</C>
        {"\n  "}<P>--c-ink-2</P>:        <V>#4B4B5C</V>;  <C>{"body"}</C>
        {"\n  "}<P>--c-ink-3</P>:        <V>#8A8A9A</V>;  <C>{"caption"}</C>
        {"\n  "}<P>--c-ink-4</P>:        <V>#B8B8C4</V>;  <C>{"placeholder"}</C>
        {"\n\n  "}<C>{"PASTEL ACCENTS · soft / base / deep"}</C>
        {"\n  "}<P>--c-lav-soft</P>:  <V>#ECE6FF</V>;   <P>--c-lav</P>:  <V>#B5A7F0</V>;   <P>--c-lav-deep</P>:  <V>#6B5BD6</V>;
        {"\n  "}<P>--c-peach-soft</P>:<V>#FFE9D6</V>;   <P>--c-peach</P>:<V>#FFCFA8</V>;   <P>--c-peach-deep</P>:<V>#E89254</V>;
        {"\n  "}<P>--c-sage-soft</P>: <V>#E4EDDE</V>;   <P>--c-sage</P>: <V>#A8C39B</V>;   <P>--c-sage-deep</P>: <V>#6E9A5E</V>;
        {"\n  "}<P>--c-sky-soft</P>:  <V>#DEEBF4</V>;   <P>--c-sky</P>:  <V>#A8D0E6</V>;   <P>--c-sky-deep</P>:  <V>#4E92BD</V>;
        {"\n  "}<P>--c-blush-soft</P>:<V>#FBE1EA</V>;   <P>--c-blush</P>:<V>#F5C6D6</V>;   <P>--c-blush-deep</P>:<V>#D26B91</V>;
        {"\n\n  "}<C>{"SEMANTIC ROLES"}</C>
        {"\n  "}<P>--c-primary</P>:      <V>var(--c-lav-deep)</V>;
        {"\n  "}<P>--c-primary-h</P>:    <V>#5544B8</V>;
        {"\n  "}<P>--c-success</P>:      <V>var(--c-sage-deep)</V>;
        {"\n  "}<P>--c-warn</P>:         <V>#E8A33C</V>;
        {"\n  "}<P>--c-error</P>:        <V>#D9534F</V>;
        {"\n  "}<P>--c-info</P>:         <V>var(--c-sky-deep)</V>;
        {"\n\n  "}<C>{"TYPOGRAPHY"}</C>
        {"\n  "}<P>--f-display</P>: <S>{'"Plus Jakarta Sans"'}</S>, system-ui, sans-serif;
        {"\n  "}<P>--f-body</P>:    <S>{'"Plus Jakarta Sans"'}</S>, system-ui, sans-serif;
        {"\n  "}<P>--f-mono</P>:    <S>{'"JetBrains Mono"'}</S>, ui-monospace, monospace;
        {"\n\n  "}<P>--t-xs</P>:<N>12px</N>; <P>--t-sm</P>:<N>14px</N>; <P>--t-base</P>:<N>16px</N>;
        {"\n  "}<P>--t-md</P>:<N>18px</N>; <P>--t-lg</P>:<N>22px</N>; <P>--t-xl</P>:<N>28px</N>;
        {"\n  "}<P>--t-2xl</P>:<N>36px</N>; <P>--t-3xl</P>:<N>48px</N>; <P>--t-4xl</P>:<N>64px</N>;
        {"\n  "}<P>--t-display</P>: <V>clamp(56px, 8vw, 88px)</V>;
        {"\n\n  "}<P>--w-reg</P>:<N>400</N>; <P>--w-med</P>:<N>500</N>; <P>--w-sem</P>:<N>600</N>;
        {"\n  "}<P>--w-bold</P>:<N>700</N>; <P>--w-xbold</P>:<N>800</N>;
        {"\n  "}<P>--lh-tight</P>:<N>1.05</N>; <P>--lh-snug</P>:<N>1.15</N>;
        {"\n  "}<P>--lh-norm</P>:<N>1.5</N>; <P>--lh-loose</P>:<N>1.65</N>;
        {"\n  "}<P>--tr-tight</P>:<N>-0.02em</N>; <P>--tr-norm</P>:<N>-0.005em</N>;
        {"\n\n  "}<C>{"RADIUS — generous by default"}</C>
        {"\n  "}<P>--r-xs</P>:<N>6px</N>; <P>--r-sm</P>:<N>10px</N>; <P>--r-md</P>:<N>16px</N>;
        {"\n  "}<P>--r-lg</P>:<N>24px</N>; <P>--r-xl</P>:<N>32px</N>;
        {"\n  "}<P>--r-2xl</P>:<N>48px</N>; <P>--r-pill</P>:<N>999px</N>;
        {"\n\n  "}<C>{"SHADOWS — always with blur"}</C>
        {"\n  "}<P>--sh-xs</P>: <V>0 1px 2px rgba(26,26,46,0.04)</V>;
        {"\n  "}<P>--sh-sm</P>: <V>0 2px 8px rgba(26,26,46,0.05)</V>;
        {"\n  "}<P>--sh-md</P>: <V>0 8px 24px rgba(26,26,46,0.06)</V>;  <C>{"default"}</C>
        {"\n  "}<P>--sh-lg</P>: <V>0 16px 40px rgba(26,26,46,0.08)</V>;
        {"\n  "}<P>--sh-xl</P>: <V>0 24px 60px rgba(26,26,46,0.10)</V>;  <C>{"modals"}</C>
        {"\n  "}<P>--sh-focus</P>: <V>0 0 0 4px rgba(107,91,214,0.18)</V>;
        {"\n\n  "}<C>{"GRADIENTS — hero/featured surfaces only"}</C>
        {"\n  "}<P>--gr-aurora</P>: <V>linear-gradient(135deg, #FFE9D6 0%, #ECE6FF 40%, #DEEBF4 80%, #FBE1EA 100%)</V>;
        {"\n  "}<P>--gr-lav</P>:    <V>linear-gradient(135deg, #ECE6FF 0%, #C5B5FF 100%)</V>;
        {"\n  "}<P>--gr-warm</P>:   <V>linear-gradient(135deg, #FFE9D6 0%, #FBE1EA 100%)</V>;
        {"\n  "}<P>--gr-cool</P>:   <V>linear-gradient(135deg, #DEEBF4 0%, #ECE6FF 100%)</V>;
        {"\n  "}<P>--gr-fresh</P>:  <V>linear-gradient(135deg, #E4EDDE 0%, #DEEBF4 100%)</V>;
        {"\n\n  "}<C>{"SPACING (scale of 4)"}</C>
        {"\n  "}<P>--s-1</P>:<N>4</N>; <P>--s-2</P>:<N>8</N>; <P>--s-3</P>:<N>12</N>; <P>--s-4</P>:<N>16</N>;
        {"\n  "}<P>--s-5</P>:<N>20</N>; <P>--s-6</P>:<N>24</N>; <P>--s-7</P>:<N>32</N>; <P>--s-8</P>:<N>40</N>;
        {"\n  "}<P>--s-9</P>:<N>56</N>; <P>--s-10</P>:<N>80</N>; <P>--s-11</P>:<N>120</N>;
        {"\n\n  "}<C>{"MOTION"}</C>
        {"\n  "}<P>--ease-out</P>:  <V>cubic-bezier(.16,1,.3,1)</V>;
        {"\n  "}<P>--ease-soft</P>: <V>cubic-bezier(.4,.0,.2,1)</V>;
        {"\n  "}<P>--dur-fast</P>: <N>150ms</N>; <P>--dur-norm</P>: <N>240ms</N>; <P>--dur-slow</P>: <N>400ms</N>;
        {"\n}"}
      </pre>
    </div>
  );
}

type Swatch = { name: string; role: string; hex: string; varName: string };
function SwatchGroup({
  title,
  tag,
  swatches,
}: {
  title: string;
  tag: string;
  swatches: readonly Swatch[];
}) {
  return (
    <div className="swatch-group">
      <h4>
        {title} <span className="badge">{tag}</span>
      </h4>
      {swatches.map((s) => (
        <div className="swatch-row" key={s.name}>
          <div className="chip" style={{ background: `var(${s.varName})` }} />
          <div className="label">
            <span className="name">{s.name}</span>
            <span className="role">{s.role}</span>
          </div>
          <span className="hex">{s.hex}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="shell">
      {/* ============================ TOP NAV ============================ */}
      <header className="nav">
        <div className="brand">
          <div className="mark">S</div>
          Stdy<span style={{ color: "var(--c-ink-3)" }}>.sys</span>
        </div>
        <nav>
          <ul>
            <li>
              <a className="active" href="#colors">
                Color
              </a>
            </li>
            <li>
              <a href="#typography">Type</a>
            </li>
            <li>
              <a href="#tokens">Tokens</a>
            </li>
            <li>
              <a href="#components">Components</a>
            </li>
            <li>
              <a href="#usage">Usage</a>
            </li>
          </ul>
        </nav>
        <div className="right">
          <button className="btn btn--ghost">Docs</button>
          <button className="btn btn--dark">
            Get started <span className="arr">↗</span>
          </button>
        </div>
      </header>

      {/* ============================ HERO ============================ */}
      <section className="hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="badge badge--lav dot" style={{ marginBottom: "var(--s-5)" }}>
            Design System · v2.0
          </span>
          <h1>
            A soft, modern <em>study</em> system.
          </h1>
          <p className="lede">
            Tokens, type and components for an interview-training app.
            Friendly corners, soft shadows, a pastel palette that breathes — without losing clarity.
          </p>
          <div className="actions">
            <button className="btn btn--primary">
              Explore tokens <span className="arr">→</span>
            </button>
            <button className="btn btn--outline">View on GitHub</button>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="n">5</div>
              <div className="l">Pastel accents</div>
            </div>
            <div className="sep" />
            <div className="stat">
              <div className="n">12</div>
              <div className="l">Components</div>
            </div>
            <div className="sep" />
            <div className="stat">
              <div className="n">48</div>
              <div className="l">CSS tokens</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 01 · COLOR ============================ */}
      <section className="block" id="colors">
        <div className="sec-head">
          <div>
            <div className="eyebrow">/ 01 · Color</div>
            <h2>A calm pastel palette</h2>
          </div>
          <p className="kicker">
            5 pastel accents with 3 tones each · 6 warm neutrals · semantic roles for states.
          </p>
        </div>

        <div className="grid g-5">
          <SwatchGroup
            title="Lavender"
            tag="Primary"
            swatches={[
              { name: "Soft", role: "fills / chips", hex: "#ECE6FF", varName: "--c-lav-soft" },
              { name: "Base", role: "accent / brand", hex: "#B5A7F0", varName: "--c-lav" },
              { name: "Deep", role: "CTA / text", hex: "#6B5BD6", varName: "--c-lav-deep" },
            ]}
          />
          <SwatchGroup
            title="Peach"
            tag="Warmth"
            swatches={[
              { name: "Soft", role: "surfaces", hex: "#FFE9D6", varName: "--c-peach-soft" },
              { name: "Base", role: "illustration", hex: "#FFCFA8", varName: "--c-peach" },
              { name: "Deep", role: "on-surface text", hex: "#E89254", varName: "--c-peach-deep" },
            ]}
          />
          <SwatchGroup
            title="Sage"
            tag="Success"
            swatches={[
              { name: "Soft", role: "success bg", hex: "#E4EDDE", varName: "--c-sage-soft" },
              { name: "Base", role: "illustration", hex: "#A8C39B", varName: "--c-sage" },
              { name: "Deep", role: "success text", hex: "#6E9A5E", varName: "--c-sage-deep" },
            ]}
          />
          <SwatchGroup
            title="Sky"
            tag="Info"
            swatches={[
              { name: "Soft", role: "info bg", hex: "#DEEBF4", varName: "--c-sky-soft" },
              { name: "Base", role: "illustration", hex: "#A8D0E6", varName: "--c-sky" },
              { name: "Deep", role: "info / link", hex: "#4E92BD", varName: "--c-sky-deep" },
            ]}
          />
          <SwatchGroup
            title="Blush"
            tag="Detail"
            swatches={[
              { name: "Soft", role: "tags / notes", hex: "#FBE1EA", varName: "--c-blush-soft" },
              { name: "Base", role: "illustration", hex: "#F5C6D6", varName: "--c-blush" },
              { name: "Deep", role: "on-surface text", hex: "#D26B91", varName: "--c-blush-deep" },
            ]}
          />
        </div>

        {/* Neutrals + gradients */}
        <div className="grid g-2" style={{ marginTop: "var(--s-6)" }}>
          <div className="swatch-group">
            <h4>
              Neutrals <span className="badge">Warm</span>
            </h4>
            {[
              { name: "--c-bg", role: "page background", hex: "#F6F4F1", v: "--c-bg" },
              { name: "--c-surface", role: "cards / surfaces", hex: "#FFFFFF", v: "--c-surface" },
              { name: "--c-line-strong", role: "soft borders", hex: "#DAD5CC", v: "--c-line-strong" },
              { name: "--c-ink-3", role: "captions", hex: "#8A8A9A", v: "--c-ink-3" },
              { name: "--c-ink-2", role: "body text", hex: "#4B4B5C", v: "--c-ink-2" },
              { name: "--c-ink", role: "headings · soft black", hex: "#1A1A2E", v: "--c-ink" },
            ].map((s) => (
              <div className="swatch-row" key={s.name}>
                <div
                  className="chip"
                  style={{
                    background: `var(${s.v})`,
                    boxShadow: "inset 0 0 0 1px var(--c-line)",
                  }}
                />
                <div className="label">
                  <span className="name">{s.name}</span>
                  <span className="role">{s.role}</span>
                </div>
                <span className="hex">{s.hex}</span>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gap: "var(--s-5)" }}>
            <div className="grad-card" style={{ background: "var(--gr-aurora)" }}>
              <span className="name">Aurora</span>
              <span className="var">--gr-aurora</span>
            </div>
            <div className="grid g-2">
              <div
                className="grad-card"
                style={{ background: "var(--gr-warm)", minHeight: 110 }}
              >
                <span className="name">Warm</span>
                <span className="var">--gr-warm</span>
              </div>
              <div
                className="grad-card"
                style={{ background: "var(--gr-cool)", minHeight: 110 }}
              >
                <span className="name">Cool</span>
                <span className="var">--gr-cool</span>
              </div>
              <div
                className="grad-card"
                style={{ background: "var(--gr-fresh)", minHeight: 110 }}
              >
                <span className="name">Fresh</span>
                <span className="var">--gr-fresh</span>
              </div>
              <div
                className="grad-card"
                style={{ background: "var(--gr-lav)", minHeight: 110, color: "white" }}
              >
                <span className="name">Lav</span>
                <span
                  className="var"
                  style={{ background: "rgba(255,255,255,0.85)", color: "var(--c-ink-2)" }}
                >
                  --gr-lav
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* State roles */}
        <div className="grid g-4" style={{ marginTop: "var(--s-6)" }}>
          <div className="card" style={{ background: "var(--c-success-soft)", boxShadow: "none" }}>
            <div className="badge badge--sage dot">Success</div>
            <div
              style={{
                marginTop: 12,
                fontWeight: "var(--w-bold)",
                color: "var(--c-sage-deep)",
              }}
            >
              All set — answer recorded
            </div>
          </div>
          <div className="card" style={{ background: "var(--c-warn-soft)", boxShadow: "none" }}>
            <div
              className="badge dot"
              style={{ background: "var(--c-warn-soft)", color: "var(--c-warn)" }}
            >
              Warning
            </div>
            <div style={{ marginTop: 12, fontWeight: "var(--w-bold)", color: "#B07517" }}>
              Mic level is a bit low
            </div>
          </div>
          <div className="card" style={{ background: "var(--c-error-soft)", boxShadow: "none" }}>
            <div
              className="badge dot"
              style={{ background: "var(--c-error-soft)", color: "var(--c-error)" }}
            >
              Error
            </div>
            <div style={{ marginTop: 12, fontWeight: "var(--w-bold)", color: "var(--c-error)" }}>
              Couldn&apos;t reach the API
            </div>
          </div>
          <div className="card" style={{ background: "var(--c-info-soft)", boxShadow: "none" }}>
            <div className="badge badge--sky dot">Info</div>
            <div
              style={{
                marginTop: 12,
                fontWeight: "var(--w-bold)",
                color: "var(--c-sky-deep)",
              }}
            >
              New question set available
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 02 · TYPOGRAPHY ============================ */}
      <section className="block" id="typography">
        <div className="sec-head">
          <div>
            <div className="eyebrow">/ 02 · Typography</div>
            <h2>Friendly and confident.</h2>
          </div>
          <p className="kicker">
            A single family — Plus Jakarta Sans — with a generous scale. Mono for occasional details.
          </p>
        </div>

        <div className="grid g-2">
          <div className="type-card">
            <div className="lbl">Display · Body</div>
            <div className="specimen">Aa Gg</div>
            <div className="family-name">Plus Jakarta Sans</div>
            <div className="info">
              Weights: 400 · 500 · 600 · 700 · 800 — soft geometry, open terminals, excellent
              legibility on mobile and desktop.
            </div>
          </div>
          <div className="type-card">
            <div className="lbl">Mono · Detail</div>
            <div
              className="specimen"
              style={{ fontFamily: "var(--f-mono)", fontWeight: 500 }}
            >
              {"{ } </>"}
            </div>
            <div className="family-name" style={{ fontFamily: "var(--f-mono)" }}>
              JetBrains Mono
            </div>
            <div className="info">
              Only for code, tokens and technical numbers. Never for body or headings.
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "var(--s-6)" }}>
          <div style={{ padding: 0 }}>
            <div className="type-row">
              <span className="tag">Display</span>
              <span
                style={{
                  fontFamily: "var(--f-display)",
                  fontWeight: 800,
                  fontSize: 72,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                Build with confidence.
              </span>
              <span className="spec">72px · 800 · 1.05 · -2% tr</span>
            </div>
            <div className="type-row">
              <span className="tag">H1</span>
              <span
                style={{
                  fontFamily: "var(--f-display)",
                  fontWeight: 800,
                  fontSize: 48,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                A new way to learn
              </span>
              <span className="spec">48px · 800 · 1.10</span>
            </div>
            <div className="type-row">
              <span className="tag">H2</span>
              <span
                style={{
                  fontFamily: "var(--f-display)",
                  fontWeight: 700,
                  fontSize: 36,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                See tangible outcomes
              </span>
              <span className="spec">36px · 700 · 1.15</span>
            </div>
            <div className="type-row">
              <span className="tag">H3</span>
              <span
                style={{
                  fontFamily: "var(--f-display)",
                  fontWeight: 700,
                  fontSize: 28,
                  lineHeight: 1.2,
                }}
              >
                Section heading
              </span>
              <span className="spec">28px · 700 · 1.20</span>
            </div>
            <div className="type-row">
              <span className="tag">H4</span>
              <span style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.3 }}>Card heading</span>
              <span className="spec">22px · 700 · 1.30</span>
            </div>
            <div className="type-row">
              <span className="tag">Body · MD</span>
              <span style={{ fontSize: 18, lineHeight: 1.5 }}>
                Intro paragraphs and product descriptions read smoothly here.
              </span>
              <span className="spec">18px · 500 · 1.50</span>
            </div>
            <div className="type-row">
              <span className="tag">Body · base</span>
              <span style={{ fontSize: 16, lineHeight: 1.5 }}>
                Default UI text. Comfortable in long sessions.
              </span>
              <span className="spec">16px · 400 · 1.50</span>
            </div>
            <div className="type-row">
              <span className="tag">Body · SM</span>
              <span style={{ fontSize: 14 }}>Microcopy, helper text, metadata under cards.</span>
              <span className="spec">14px · 400 · 1.50</span>
            </div>
            <div className="type-row">
              <span className="tag">Caption</span>
              <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>
                Secondary labels, timestamps, hints.
              </span>
              <span className="spec">12px · 500 · 1.45</span>
            </div>
            <div className="type-row">
              <span className="tag">Mono</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 13 }}>
                --c-lav-deep: #6B5BD6;
              </span>
              <span className="spec">13px · 500 · 1.5</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 03 · SHAPE · ELEVATION ============================ */}
      <section className="block">
        <div className="sec-head">
          <div>
            <div className="eyebrow">/ 03 · Shape · Elevation</div>
            <h2>Soft corners, gentle lift.</h2>
          </div>
          <p className="kicker">Generous radii by default. Shadows with blur, never harsh.</p>
        </div>

        <div className="grid g-2">
          {/* Radius */}
          <div className="card flush">
            <div className="hd">
              <h3>Radius</h3>
              <span className="badge">7 steps</span>
            </div>
            <div className="bd grid g-4" style={{ gap: "var(--s-4)" }}>
              <div
                className="demo-tile"
                style={{ background: "var(--c-lav-soft)", borderRadius: "var(--r-xs)" }}
              >
                <span className="name">XS</span>
                <span className="var">--r-xs · 6px</span>
              </div>
              <div
                className="demo-tile"
                style={{ background: "var(--c-peach-soft)", borderRadius: "var(--r-sm)" }}
              >
                <span className="name">SM</span>
                <span className="var">--r-sm · 10px</span>
              </div>
              <div
                className="demo-tile"
                style={{ background: "var(--c-sage-soft)", borderRadius: "var(--r-md)" }}
              >
                <span className="name">MD</span>
                <span className="var">--r-md · 16px</span>
              </div>
              <div
                className="demo-tile"
                style={{ background: "var(--c-sky-soft)", borderRadius: "var(--r-lg)" }}
              >
                <span className="name">LG</span>
                <span className="var">--r-lg · 24px · default</span>
              </div>
              <div
                className="demo-tile"
                style={{ background: "var(--c-blush-soft)", borderRadius: "var(--r-xl)" }}
              >
                <span className="name">XL</span>
                <span className="var">--r-xl · 32px</span>
              </div>
              <div
                className="demo-tile"
                style={{ background: "var(--c-lav-soft)", borderRadius: "var(--r-2xl)" }}
              >
                <span className="name">2XL</span>
                <span className="var">--r-2xl · 48px</span>
              </div>
              <div
                className="demo-tile"
                style={{
                  background: "var(--c-peach-soft)",
                  borderRadius: "var(--r-pill)",
                  gridColumn: "span 2",
                  minHeight: 80,
                }}
              >
                <span className="name">Pill</span>
                <span className="var">--r-pill · 999px · buttons</span>
              </div>
            </div>
          </div>

          {/* Shadows */}
          <div className="card flush">
            <div className="hd">
              <h3>Elevation</h3>
              <span className="badge">soft · blur</span>
            </div>
            <div className="bd grid g-2" style={{ gap: "var(--s-5)" }}>
              {[
                ["XS", "--sh-xs"],
                ["SM", "--sh-sm"],
                ["MD · default", "--sh-md"],
                ["LG", "--sh-lg"],
                ["XL · modal", "--sh-xl"],
                ["Focus ring", "--sh-focus"],
              ].map(([name, v]) => (
                <div
                  key={v}
                  className="demo-tile"
                  style={{
                    background: "var(--c-surface)",
                    borderRadius: "var(--r-md)",
                    boxShadow: `var(${v})`,
                  }}
                >
                  <span className="name">{name}</span>
                  <span className="var">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 04 · COMPONENTS ============================ */}
      <section className="block" id="components">
        <div className="sec-head">
          <div>
            <div className="eyebrow">/ 04 · Components</div>
            <h2>Building blocks.</h2>
          </div>
          <p className="kicker">
            Buttons, inputs, badges, progress, tabs and a full session preview.
          </p>
        </div>

        {/* BUTTONS */}
        <div className="card flush" style={{ marginBottom: "var(--s-5)" }}>
          <div className="hd">
            <h3>Buttons</h3>
            <span className="badge badge--lav">pill · 999px</span>
          </div>
          <div className="bd cluster" style={{ gap: 14, rowGap: 18 }}>
            <button className="btn btn--primary">
              Get started <span className="arr">→</span>
            </button>
            <button className="btn btn--soft">Tickets sichern</button>
            <button className="btn btn--dark">
              Get in touch <span className="arr">↗</span>
            </button>
            <button className="btn btn--outline">Learn more</button>
            <button className="btn btn--ghost">Skip for now</button>
            <button className="btn" disabled>
              Disabled
            </button>
            <button className="btn-circle" aria-label="Next">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* INPUTS / SELECT / TOGGLE */}
        <div className="grid g-2" style={{ marginBottom: "var(--s-5)" }}>
          <div className="card flush">
            <div className="hd">
              <h3>Inputs</h3>
              <span className="badge">radius 16px</span>
            </div>
            <div className="bd grid" style={{ gap: "var(--s-4)" }}>
              <div className="field">
                <label htmlFor="i1">Full name</label>
                <input id="i1" className="input" placeholder="Roberto N." defaultValue="Roberto N." />
              </div>
              <div className="field">
                <label htmlFor="i2">Email</label>
                <input
                  id="i2"
                  className="input"
                  aria-invalid={true}
                  defaultValue="not-an-email"
                />
                <span className="hint" style={{ color: "var(--c-error)" }}>
                  Please enter a valid email.
                </span>
              </div>
              <div className="field">
                <label>Search</label>
                <div className="search">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--c-ink-3)"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input placeholder="Search questions, topics…" />
                  <button className="btn btn--primary" style={{ padding: "8px 16px" }}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card flush">
            <div className="hd">
              <h3>Select · Toggle · Check</h3>
              <span className="badge">soft borders</span>
            </div>
            <div className="bd grid" style={{ gap: "var(--s-4)" }}>
              <div className="field">
                <label htmlFor="s1">Role target</label>
                <select id="s1" className="select" defaultValue="Frontend Engineer">
                  <option>Frontend Engineer</option>
                  <option>Product Manager</option>
                  <option>Data Scientist</option>
                </select>
              </div>
              <div className="field">
                <label>Session options</label>
                <label className="check">
                  <input type="checkbox" defaultChecked /> Include behavioral questions
                </label>
                <label className="check">
                  <input type="checkbox" /> Strict timer (90s per answer)
                </label>
                <label className="check">
                  <input type="checkbox" defaultChecked /> Live transcription
                </label>
              </div>
              <div className="field">
                <label>Preferences</label>
                <label className="toggle">
                  <input type="checkbox" defaultChecked /> Practice mode
                </label>
                <label className="toggle">
                  <input type="checkbox" /> AI follow-up questions
                </label>
                <label className="toggle">
                  <input type="checkbox" defaultChecked /> Show hints after 60s
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* BADGES + PROGRESS */}
        <div className="grid g-2" style={{ marginBottom: "var(--s-5)" }}>
          <div className="card flush">
            <div className="hd">
              <h3>Badges &amp; chips</h3>
              <span className="badge">pastel fills</span>
            </div>
            <div className="bd cluster" style={{ gap: 10, rowGap: 14 }}>
              <span className="badge">Default</span>
              <span className="badge badge--lav">Primary</span>
              <span className="badge badge--peach">Warmth</span>
              <span className="badge badge--sage dot">Active</span>
              <span className="badge badge--sky">New</span>
              <span className="badge badge--blush">Beta</span>
              <span className="badge badge--ink">Featured</span>
              <span
                className="badge badge--lav"
                style={{ padding: "8px 14px", fontSize: "var(--t-sm)" }}
              >
                <span className="spark" /> AI assisted
              </span>
            </div>
          </div>
          <div className="card flush">
            <div className="hd">
              <h3>Progress</h3>
              <span className="badge">pill bars · ring</span>
            </div>
            <div
              className="bd"
              style={{
                display: "grid",
                gap: "var(--s-5)",
                gridTemplateColumns: "1fr 80px",
                alignItems: "center",
              }}
            >
              <div>
                <div className="bar-row">
                  <span className="name">Fluency</span>
                  <div className="bar">
                    <i style={{ width: "72%" }} />
                  </div>
                  <span className="val">72%</span>
                </div>
                <div className="bar-row">
                  <span className="name">Clarity</span>
                  <div className="bar bar--sage">
                    <i style={{ width: "58%" }} />
                  </div>
                  <span className="val">58%</span>
                </div>
                <div className="bar-row">
                  <span className="name">Structure</span>
                  <div className="bar bar--peach">
                    <i style={{ width: "34%" }} />
                  </div>
                  <span className="val">34%</span>
                </div>
                <div className="bar-row">
                  <span className="name">Confidence</span>
                  <div className="bar bar--sky">
                    <i style={{ width: "90%" }} />
                  </div>
                  <span className="val">90%</span>
                </div>
              </div>
              <div className="ring" style={cssVars({ "--p": 72 })}>
                <span>72%</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="card flush" style={{ marginBottom: "var(--s-5)" }}>
          <div className="hd">
            <h3>Tabs · Segmented</h3>
            <span className="badge">pill · underline</span>
          </div>
          <div className="bd grid" style={{ gap: "var(--s-6)" }}>
            <Tabs variant="pill" items={["Overview", "Sessions", "Feedback", "Settings"]} />
            <Tabs
              variant="line"
              items={["All questions", "Behavioral", "Technical", "System design", "Saved"]}
            />
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="grid g-2">
          <div
            className="preview-card"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(255,207,168,0.35), transparent 60%)," +
                "radial-gradient(ellipse 70% 60% at 0% 100%, rgba(168,208,230,0.30), transparent 60%)," +
                "var(--c-surface)",
            }}
          >
            <div className="quiz-head">
              <div>
                <span className="badge badge--lav dot">Live · Behavioral</span>
                <h3 style={{ marginTop: 12 }}>Tell me about a conflict you resolved.</h3>
                <p>Use the STAR framework · 90 seconds.</p>
              </div>
              <div className="ring" style={cssVars({ "--p": 42, "--size": "56px", "--w": "6px" })}>
                <span style={{ fontSize: 12 }}>38s</span>
              </div>
            </div>
            <div className="bar" style={{ height: 6 }}>
              <i style={{ width: "42%", background: "var(--c-primary)" }} />
            </div>
            <div
              className="cluster"
              style={{ marginTop: "var(--s-5)", justifyContent: "space-between" }}
            >
              <div className="avatar-stack" style={{ alignItems: "center" }}>
                <div
                  className="avatar"
                  style={{ background: "var(--gr-warm)", color: "var(--c-peach-deep)" }}
                >
                  R
                </div>
                <div
                  className="avatar"
                  style={{ background: "var(--gr-fresh)", color: "var(--c-sage-deep)" }}
                >
                  A
                </div>
                <div
                  className="avatar"
                  style={{ background: "var(--gr-cool)", color: "var(--c-sky-deep)" }}
                >
                  M
                </div>
              </div>
              <div className="cluster">
                <button className="btn btn--outline">Skip</button>
                <button className="btn btn--primary">
                  Start <span className="arr">→</span>
                </button>
              </div>
            </div>
          </div>

          <div className="preview-card" style={{ background: "var(--c-surface)" }}>
            <div className="quiz-head">
              <div>
                <span className="badge badge--sage dot">Result</span>
                <h3 style={{ marginTop: 12 }}>Session #042 — well done.</h3>
                <p>4 of 5 questions answered above target.</p>
              </div>
              <div className="ring" style={cssVars({ "--p": 84, "--size": "64px" })}>
                <span>84</span>
              </div>
            </div>
            <div
              className="bar-row"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                padding: 0,
                marginTop: "var(--s-3)",
              }}
            >
              <div
                className="card"
                style={{
                  padding: 14,
                  boxShadow: "none",
                  background: "var(--c-lav-soft)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div style={{ fontSize: "var(--t-xs)", color: "var(--c-ink-3)" }}>
                  Avg / answer
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--c-lav-deep)",
                  }}
                >
                  68s
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: 14,
                  boxShadow: "none",
                  background: "var(--c-peach-soft)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div style={{ fontSize: "var(--t-xs)", color: "var(--c-ink-3)" }}>Filler words</div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--c-peach-deep)",
                  }}
                >
                  12
                </div>
              </div>
              <div
                className="card"
                style={{
                  padding: 14,
                  boxShadow: "none",
                  background: "var(--c-sage-soft)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div style={{ fontSize: "var(--t-xs)", color: "var(--c-ink-3)" }}>Streak</div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--c-sage-deep)",
                  }}
                >
                  7d
                </div>
              </div>
            </div>
            <div
              className="cluster"
              style={{ marginTop: "var(--s-5)", justifyContent: "space-between" }}
            >
              <button className="btn btn--ghost">See transcript</button>
              <button className="btn btn--primary">
                Next session <span className="arr">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ 05 · TOKENS ============================ */}
      <section className="block" id="tokens">
        <div className="sec-head">
          <div>
            <div className="eyebrow">/ 05 · CSS Tokens</div>
            <h2>Copy. Paste. Ship.</h2>
          </div>
          <p className="kicker">
            Paste the <code>:root</code> block at the top of your global CSS and import Plus Jakarta Sans
            from Google Fonts.
          </p>
        </div>

        <CodeBlock />
      </section>

      {/* ============================ 06 · USAGE ============================ */}
      <section className="block" id="usage">
        <div className="sec-head">
          <div>
            <div className="eyebrow">/ 06 · Usage</div>
            <h2>How to combine it.</h2>
          </div>
          <p className="kicker">Minimal rules to keep the system feeling coherent and breathing.</p>
        </div>

        <div className="card" style={{ marginBottom: "var(--s-5)" }}>
          <h3
            style={{
              margin: "0 0 var(--s-3)",
              fontSize: "var(--t-lg)",
              fontWeight: "var(--w-bold)",
            }}
          >
            Recipe · a typical surface
          </h3>
          <ol
            style={{
              margin: 0,
              paddingLeft: "var(--s-5)",
              color: "var(--c-ink-2)",
              fontSize: "var(--t-sm)",
              lineHeight: 1.8,
            }}
          >
            <li>
              <b>Background</b> → <code>--c-bg</code> on the page, <code>--c-surface</code> (pure
              white) for cards.
            </li>
            <li>
              <b>Radius</b> → <code>--r-lg (24px)</code> on cards · <code>--r-md (16px)</code> on
              inputs · <code>--r-pill</code> on buttons, badges and stats.
            </li>
            <li>
              <b>Shadow</b> → <code>--sh-sm</code> at rest, <code>--sh-md</code> elevated,{" "}
              <code>--sh-lg/xl</code> only for modals and popovers.
            </li>
            <li>
              <b>Dominant accent</b> → 1 per view. The primary is lavender; use peach/sage/sky/blush
              as secondaries with their <i>soft</i> tone.
            </li>
            <li>
              <b>Text</b> → <code>--c-ink</code> for headings, <code>--c-ink-2</code> for body,{" "}
              <code>--c-ink-3</code> for captions.
            </li>
            <li>
              <b>Primary button</b> → <code>.btn--primary</code> (lavender deep) — only one per
              view.
            </li>
          </ol>
        </div>

        <div className="do-dont">
          <div className="panel do">
            <span className="tag">Do</span>
            <h4>Do</h4>
            <ul>
              <li>
                Combine a <i>soft</i> pastel accent in the background with its <i>deep</i> tone for
                text in chips/badges.
              </li>
              <li>Generous corners everywhere: cards (24px), inputs (16px), buttons (pill).</li>
              <li>Soft shadows with blur — always subtle, never heavy.</li>
              <li>Radial/diagonal gradients only in the hero and featured surfaces.</li>
              <li>Use weights 700/800 for headings; 400/500 for body.</li>
              <li>Keep plenty of white space. Density kills the tone.</li>
            </ul>
          </div>
          <div className="panel dont">
            <span className="tag">Don&apos;t</span>
            <h4>Avoid</h4>
            <ul>
              <li>Thick black borders, harsh shadows without blur, 0px corners.</li>
              <li>More than 2 saturated accents in the same card.</li>
              <li>Uppercase in body or microcopy — only in small eyebrows.</li>
              <li>Combining mono with headings: mono is only for tokens and code.</li>
              <li>100% saturated colors (bright reds/blues) that break the system&apos;s calm.</li>
              <li>
                Pure black backgrounds — use <code>--c-ink</code> (#1A1A2E) instead.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <div className="footstrip">
        <span>Stdy.sys · Design System v2.0</span>
        <span>Plus Jakarta Sans + JetBrains Mono</span>
        <span>2026-05-28</span>
      </div>
    </div>
  );
}
