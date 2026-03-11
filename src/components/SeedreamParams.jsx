import { G } from "../constants/generators";
import { Select } from "./ui/Select";
import { Input } from "./ui/Input";
import { Toggle } from "./ui/Toggle";

function detectFamily(modelId) {
  if (!modelId) return "5.0";
  const exact = {
    "doubao-seedream-5-0-260128": "5.0",
    "doubao-seedream-4-5-251128": "4.5",
    "doubao-seedream-4-0-250828": "4.0",
  };
  if (exact[modelId]) return exact[modelId];
  if (/seedream-5|5-0/.test(modelId)) return "5.0";
  if (/seedream-4-5|4-5/.test(modelId)) return "4.5";
  if (/seedream-4-0|4-0/.test(modelId)) return "4.0";
  return "5.0";
}

export default function SeedreamParams({ p, set }) {
  const fm = detectFamily(p.model);
  const cap = G.seedream.caps[fm] || {};
  const pre = G.seedream.sz[fm] || {};
  const ars = pre[p.size] ? Object.keys(pre[p.size]) : [];
  const rv = p.ar && p.ar !== "auto" && pre[p.size] ? pre[p.size][p.ar] : null;

  const modelMeta = G.seedream.models.find((m) => m.id === p.model);
  const modelLabel = modelMeta
    ? modelMeta.label + (modelMeta.badge ? " · " + modelMeta.badge : "")
    : p.model || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* 当前模型（只读，在全局设置中更改） */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderRadius: 7,
          background: "var(--b2)",
          border: "1px solid var(--bd)",
          fontSize: 11,
        }}
      >
        <span style={{ color: "var(--t3)", fontWeight: 600 }}>当前模型</span>
        <span
          style={{
            color: "var(--accent)",
            fontFamily: "monospace",
            fontSize: 11,
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={p.model}
        >
          {modelLabel}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Select
          lb="分辨率"
          v={p.size}
          onChange={(v) => set({ ...p, size: v })}
          opts={(cap.res || ["2K"]).map((r) => ({ v: r, l: r }))}
        />
        <Select
          lb="宽高比"
          v={p.ar}
          onChange={(v) => set({ ...p, ar: v })}
          opts={[
            { v: "auto", l: "自动（按资源）" },
            ...ars.map((a) => ({ v: a, l: a })),
          ]}
        />
      </div>
      {rv && (
        <div
          style={{
            fontSize: 11,
            color: "var(--accent)",
            fontFamily: "var(--fm)",
            padding: "5px 10px",
            background: "var(--accent-dim)",
            borderRadius: 6,
            border: "1px solid rgba(0,229,255,.2)",
          }}
        >
          → 输出 {rv}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Select
          lb="输出格式"
          v={p.fmt}
          onChange={(v) => set({ ...p, fmt: v })}
          opts={(cap.fmts || ["jpeg"]).map((f) => ({
            v: f,
            l: f.toUpperCase() + (f === "png" ? " (透明)" : ""),
          }))}
        />
        <Select
          lb="优化模式"
          v={p.opt}
          onChange={(v) => set({ ...p, opt: v })}
          opts={(cap.opt || ["standard"]).map((m) => ({
            v: m,
            l: m === "fast" ? "极速" : "标准",
          }))}
        />
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "4px 0" }}
      >
        <Toggle lb="水印" v={p.wm} onChange={(v) => set({ ...p, wm: v })} />
        <Toggle lb="流式" v={p.strm} onChange={(v) => set({ ...p, strm: v })} />
        {cap.web && (
          <Toggle
            lb="联网搜索"
            v={p.ws}
            onChange={(v) => set({ ...p, ws: v })}
          />
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Select
          lb="组图模式"
          v={p.seq}
          onChange={(v) => set({ ...p, seq: v })}
          opts={[
            { v: "disabled", l: "单图" },
            { v: "auto", l: "组图" },
          ]}
        />
        {p.seq === "auto" && (
          <Input
            lb="数量 (≤15)"
            type="number"
            v={p.mx}
            onChange={(v) =>
              set({ ...p, mx: Math.min(15, Math.max(1, +v || 1)) })
            }
          />
        )}
      </div>
      <Select
        lb="返回方式"
        v={p.rfmt}
        onChange={(v) => set({ ...p, rfmt: v })}
        opts={[
          { v: "url", l: "URL" },
          { v: "b64_json", l: "Base64" },
        ]}
      />
      <div
        style={{
          fontSize: 11,
          color: "var(--t3)",
          lineHeight: 1.6,
          paddingTop: 8,
          borderTop: "1px solid var(--bd)",
        }}
      >
        {fm === "5.0"
          ? "5.0: PNG透明 + 联网搜索"
          : fm === "4.0"
            ? "4.0: 极速模式"
            : "4.5: 支持 2K/4K"}
        {" · 500张/分 · "}
        <a
          href={G.seedream.docs}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--accent)" }}
        >
          查看文档 ↗
        </a>
      </div>
    </div>
  );
}
