export function Select({ v, onChange, opts, lb }) {
  return (
    <div>
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
      <select
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="gf-select"
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--bd2)",
          background: "var(--b1)",
          color: "var(--t1)",
          fontSize: 13,
          fontFamily: "var(--f)",
          outline: "none",
          cursor: "pointer",
          transition: "border-color .15s, box-shadow .15s",
          appearance: "auto",
        }}
      >
        {opts.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}
