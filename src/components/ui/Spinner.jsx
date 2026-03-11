export function Spinner({ s = 18 }) {
  return (
    <div
      style={{
        width: s,
        height: s,
        border: `${Math.max(2, Math.round(s / 7))}px solid rgba(0,229,255,.18)`,
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "sp .65s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}
