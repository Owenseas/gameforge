export function Toggle({ v, onChange, lb }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 12,
        color: "var(--t2)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        onClick={() => onChange(!v)}
        style={{
          width: 34,
          height: 19,
          borderRadius: 10,
          background: v ? "var(--accent)" : "var(--b5)",
          border: "1px solid " + (v ? "rgba(0,229,255,.4)" : "var(--bd)"),
          position: "relative",
          cursor: "pointer",
          transition: "background .2s, border-color .2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: v ? "#07080B" : "var(--t3)",
            position: "absolute",
            top: 2,
            left: v ? 17 : 2,
            transition: "left .2s ease, background .2s",
            boxShadow: "0 1px 3px rgba(0,0,0,.3)",
          }}
        />
      </div>
      {lb}
    </label>
  );
}
