export function Card({ ch, s, onClick, gl }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "gf-card-i" : undefined}
      style={{
        background: "var(--b2)",
        border: "1px solid " + (gl || "var(--bd)"),
        borderRadius: 12,
        padding: 16,
        ...s,
        ...(onClick ? { cursor: "pointer" } : {}),
      }}
    >
      {ch}
    </div>
  );
}
