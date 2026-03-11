export function Badge({ c, t = "var(--t3)" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: 0.3,
        color: t,
        background: t.startsWith("#") ? t + "1A" : t.replace(")", ",0.12)"),
      }}
    >
      {c}
    </span>
  );
}
