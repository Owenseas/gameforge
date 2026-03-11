const VARIANTS = {
  primary: { b: "#FF375F", c: "#fff", sh: "rgba(255,55,95,.25)" },
  gold: { b: "#FFD60A", c: "#0D0D0D", sh: "rgba(255,214,10,.2)" },
  cyan: { b: "#00E5FF", c: "#07080B", sh: "rgba(0,229,255,.2)" },
  ghost: { b: "var(--b4)", c: "var(--t2)", sh: "none" },
  default: { b: "var(--b4)", c: "var(--t1)", sh: "none" },
};

const SIZES = {
  sm: { pad: "6px 12px", fs: 12, gap: 5 },
  md: { pad: "8px 16px", fs: 13, gap: 6 },
  lg: { pad: "11px 22px", fs: 14, gap: 7 },
};

export function Button({ c, v = "default", onClick, dis, ic, sz = "md" }) {
  const vs = VARIANTS[v] || VARIANTS.default;
  const si = SIZES[sz] || SIZES.md;
  return (
    <button
      disabled={dis}
      onClick={onClick}
      className="gf-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: si.gap,
        border: "1px solid transparent",
        borderRadius: 8,
        padding: si.pad,
        fontSize: si.fs,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: 0.2,
        fontFamily: "var(--f)",
        background: dis ? "var(--b3)" : vs.b,
        color: dis ? "var(--t4)" : vs.c,
        cursor: dis ? "not-allowed" : "pointer",
        opacity: dis ? 0.45 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {ic && <span style={{ fontSize: si.fs + 1 }}>{ic}</span>}
      {c}
    </button>
  );
}
