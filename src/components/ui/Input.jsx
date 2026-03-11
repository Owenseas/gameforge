export function Input({ v, onChange, ph, lb, type = "text", mono, s }) {
  return (
    <div style={s}>
      {lb && (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "var(--t3)",
            marginBottom: 5,
          }}
        >
          {lb}
        </label>
      )}
      <input
        type={type}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ph}
        className="gf-input"
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--bd2)",
          background: "var(--b1)",
          color: "var(--t1)",
          fontSize: 13,
          fontFamily: mono ? "var(--fm)" : "var(--f)",
          outline: "none",
          transition: "border-color .15s, box-shadow .15s",
        }}
      />
    </div>
  );
}
