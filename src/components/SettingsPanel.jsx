import { useState, useCallback } from "react";
import { G } from "../constants/generators";
import { proxyFetch } from "../utils/proxyFetch";
import { Icon } from "./ui/Icon";

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

const PRESETS = [
  {
    name: "智谱 AI",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    hint: "GLM-4.7-Flash 免费模型 · 扫描推荐",
    defaultModel: "glm-4.7-flash",
    icon: "brain",
    // 智谱 BigModel 全系列已知模型（/models 接口不一定全部返回，手动补全）
    // 数据来源：https://open.bigmodel.cn/dev/api
    knownModels: [
      // ── GLM-4.7 系列 ──
      "glm-4.7",
      "glm-4.7-flash", // 免费
      // ── GLM-4.5 系列 ──
      "glm-4.5",
      "glm-4.5-air",
      // ── GLM-4 系列 ──
      "glm-4-plus",
      "glm-4",
      "glm-4-0520",
      "glm-4-airx",
      "glm-4-air",
      "glm-4-long", // 128K 长文本
      "glm-4-flash", // 免费
      "glm-4-flashx",
      // ── GLM-Z1 推理系列 ──
      "glm-z1-preview",
      "glm-z1-air",
      "glm-z1-flash",
      "glm-z1-rumination", // 深度思考
      // ── 代码 ──
      "codegeex-4",
      // ── 语音 ──
      "glm-4-voice",
      // ── 图像生成 ──
      "cogview-3",
      "cogview-3-plus",
      "cogview-3-flash",
      // ── 视频生成 ──
      "cogvideox-flash",
      "cogvideox-pro",
      // ── Embedding ──
      "embedding-2",
      "embedding-3",
    ],
  },
  {
    name: "火山方舟",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    hint: "豆包系列模型 · 需填推理接入点 ID",
    defaultModel: "",
    icon: "volcano",
    knownModels: [],
  },
  {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    hint: "GPT-4o / o3 系列",
    defaultModel: "gpt-4o-mini",
    icon: "lightning",
    knownModels: [],
  },
];

const S = {
  input: {
    width: "100%",
    background: "var(--b2)",
    border: "1px solid var(--bd)",
    borderRadius: 6,
    color: "var(--t1)",
    fontSize: 12,
    fontFamily: "monospace",
    padding: "7px 10px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: "var(--b2)",
    border: "1px solid var(--bd)",
    borderRadius: 6,
    color: "var(--t1)",
    fontSize: 12,
    fontFamily: "var(--f)",
    padding: "7px 10px",
    outline: "none",
    cursor: "pointer",
  },
  btn: {
    background: "var(--b3)",
    border: "1px solid var(--bd)",
    borderRadius: 6,
    color: "var(--t2)",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 9px",
    cursor: "pointer",
    fontFamily: "var(--f)",
    whiteSpace: "nowrap",
    lineHeight: 1.4,
  },
  danger: {
    background: "transparent",
    border: "1px solid var(--bd)",
    borderRadius: 6,
    color: "var(--danger)",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 9px",
    cursor: "pointer",
    fontFamily: "var(--f)",
    whiteSpace: "nowrap",
  },
  primary: {
    background: "var(--accent)",
    border: "1px solid var(--accent)",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "7px 14px",
    cursor: "pointer",
    fontFamily: "var(--f)",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--t3)",
    marginBottom: 4,
    display: "block",
  },
};

function StatusDot({ status }) {
  const color =
    {
      ok: "var(--success)",
      fail: "var(--danger)",
      cors: "#f59e0b",
      untested: "var(--t4)",
    }[status] || "var(--t4)";
  const label =
    { ok: "连通", fail: "Key无效", cors: "CORS受限", untested: "未测试" }[
      status
    ] || "未测试";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "var(--t4)",
        marginBottom: 10,
        paddingBottom: 7,
        borderBottom: "1px solid var(--bd)",
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      {label && <span style={S.label}>{label}</span>}
      {children}
      {hint && (
        <div
          style={{
            fontSize: 10,
            color: "var(--t4)",
            marginTop: 3,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  provider,
  onTest,
  onSync,
  onDelete,
  onSave,
  testing,
  syncing,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: provider.name,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
  });
  const syncedAt = provider.lastSync
    ? new Date(provider.lastSync).toLocaleDateString("zh-CN")
    : null;

  const handleSave = () => {
    if (!draft.name.trim() || !draft.baseUrl.trim()) return;
    onSave({
      ...provider,
      name: draft.name.trim(),
      baseUrl: draft.baseUrl.trim().replace(/\/+$/, ""),
      apiKey: draft.apiKey.trim(),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({
      name: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        style={{
          background: "var(--b2)",
          border: "1px solid var(--accent)44",
          borderRadius: 8,
          padding: "13px",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Field label="供应商名称">
            <input
              type="text"
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              style={{ ...S.input, fontFamily: "var(--f)" }}
            />
          </Field>
          <Field label="Base URL">
            <input
              type="text"
              value={draft.baseUrl}
              onChange={(e) =>
                setDraft((d) => ({ ...d, baseUrl: e.target.value }))
              }
              style={S.input}
            />
          </Field>
          <Field label="API Key">
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) =>
                setDraft((d) => ({ ...d, apiKey: e.target.value }))
              }
              placeholder="不修改则留空"
              style={S.input}
            />
          </Field>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleSave} style={S.primary}>
              保存
            </button>
            <button onClick={handleCancel} style={S.btn}>
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--b2)",
        border: "1px solid var(--bd)",
        borderRadius: 8,
        padding: "11px 13px",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--t1)" }}>
          {provider.name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 5,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <StatusDot status={provider.status} />
          <button onClick={onTest} disabled={testing} style={S.btn}>
            {testing ? <Icon name="refresh" size={11} /> : "测试"}
          </button>
          <button onClick={onSync} disabled={syncing} style={S.btn}>
            {syncing ? <Icon name="refresh" size={11} /> : "↻ 同步"}
          </button>
          <button
            onClick={() => setEditing(true)}
            style={S.btn}
            title="编辑供应商"
          >
            <Icon name="pencil" size={12} />
          </button>
          <button onClick={onDelete} style={S.danger} title="删除供应商">
            <Icon name="x" size={12} />
          </button>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--t4)",
          fontFamily: "monospace",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {provider.baseUrl}
      </div>
      {provider.models?.length > 0 && (
        <div
          style={{
            marginTop: 5,
            fontSize: 11,
            color: "var(--t3)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Icon name="folder-tabs" size={11} /> {provider.models.length} 个模型
          {syncedAt ? (
            <span style={{ color: "var(--t4)" }}> · {syncedAt} 同步</span>
          ) : null}
        </div>
      )}
      {provider.status === "cors" && (
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: "#f59e0b",
            lineHeight: 1.5,
            background: "#f59e0b18",
            borderRadius: 5,
            padding: "4px 8px",
            display: "flex",
            alignItems: "flex-start",
            gap: 4,
          }}
        >
          <Icon
            name="warning"
            size={12}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <span>
            浏览器同源策略限制了直连测试，但不影响实际 API
            调用。扫描/生图功能可正常使用。
          </span>
        </div>
      )}
    </div>
  );
}

function ModelPicker({ models, value, onChange, placeholder }) {
  const inList = models.includes(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {models.length > 0 ? (
        <select
          value={inList ? value : ""}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          style={S.select}
        >
          <option value="">-- 从列表选择 --</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ fontSize: 11, color: "var(--t4)", lineHeight: 1.5 }}>
          ⓘ 该供应商暂无模型数据，请点击「↻ 同步」拉取列表
        </div>
      )}
      <Field hint="也可手动粘贴模型 ID 或推理接入点 ID（ep-xxxxxxxx）">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={S.input}
        />
      </Field>
    </div>
  );
}

export default function SettingsPanel({
  open,
  onClose,
  providers,
  onSaveProviders,
  ag,
  onSwitchGenerator,
  scanProviderId,
  onScanProviderChange,
  scanModel,
  onScanModelChange,
  imgProviderId,
  onImgProviderChange,
  imgModel,
  onImgModelChange,
  styleProviderId,
  onStyleProviderChange,
  styleModel,
  onStyleModelChange,
  g,
}) {
  const [tab, setTab] = useState("providers");
  const [form, setForm] = useState({ name: "", baseUrl: "", apiKey: "" });
  const [formErr, setFormErr] = useState("");
  const [testingId, setTestingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);

  const handleAdd = useCallback(() => {
    if (!form.name.trim()) {
      setFormErr("请填写供应商名称");
      return;
    }
    if (!form.baseUrl.trim()) {
      setFormErr("请填写 Base URL");
      return;
    }
    const cleanUrl = form.baseUrl.trim().replace(/\/+$/, "");
    const matchedPreset = PRESETS.find((pr) => pr.baseUrl === cleanUrl);
    const p = {
      id: uid(),
      name: form.name.trim(),
      baseUrl: cleanUrl,
      apiKey: form.apiKey.trim(),
      models: matchedPreset?.knownModels ?? [],
      status: "untested",
      lastSync: null,
    };
    onSaveProviders([...providers, p]);
    setForm({ name: "", baseUrl: "", apiKey: "" });
    setFormErr("");
  }, [form, providers, onSaveProviders]);

  const handleTest = useCallback(
    async (p) => {
      setTestingId(p.id);
      let newStatus = "fail";
      try {
        // 部分供应商（如火山方舟）的 /models 端点不支持普通 API key，
        // 改用 /chat/completions 探测：故意传一个无效模型名触发 4xx，
        // 再解析响应体区分"认证失败"与"模型不存在"。
        const r = await proxyFetch(
          p.baseUrl.replace(/\/+$/, "") + "/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + p.apiKey,
            },
            body: JSON.stringify({
              model: "__probe_model__",
              messages: [{ role: "user", content: "hi" }],
              max_tokens: 1,
            }),
          },
        );

        if (r.status === 200) {
          newStatus = "ok";
        } else if (r.status === 401 || r.status === 403) {
          // 解析 body：有些供应商对不存在的模型也返回 401/403
          // 若错误类型/消息包含 model/endpoint 关键词说明 key 其实有效
          const body = await r.json().catch(() => ({}));
          const code = (
            body?.error?.code ||
            body?.error?.type ||
            ""
          ).toLowerCase();
          const msg = (body?.error?.message || "").toLowerCase();
          const isModelErr =
            code.includes("model") ||
            msg.includes("model") ||
            msg.includes("endpoint") ||
            msg.includes("not found") ||
            msg.includes("invalid model");
          newStatus = isModelErr ? "ok" : "fail";
        } else {
          // 400 / 404 / 422 等：请求到达推理层，key 有效
          newStatus = "ok";
        }
      } catch {
        newStatus = "fail";
      }
      onSaveProviders(
        providers.map((x) => (x.id === p.id ? { ...x, status: newStatus } : x)),
      );
      setTestingId(null);
    },
    [providers, onSaveProviders],
  );

  const handleSync = useCallback(
    async (p) => {
      setSyncingId(p.id);
      const matchedPreset = PRESETS.find((pr) => pr.baseUrl === p.baseUrl);
      const known = matchedPreset?.knownModels ?? [];
      try {
        const r = await proxyFetch(p.baseUrl + "/models", {
          headers: { Authorization: "Bearer " + p.apiKey },
        });
        if (r.ok) {
          const d = await r.json();
          const fromApi = (d.data || [])
            .map((m) => (typeof m === "string" ? m : m.id))
            .filter(Boolean);
          // 合并预设已知模型，保证 /models 接口未收录的模型（如 glm-4.7-flash）也出现在列表中
          const merged = [...new Set([...known, ...fromApi])].sort();
          onSaveProviders(
            providers.map((x) =>
              x.id === p.id
                ? { ...x, models: merged, status: "ok", lastSync: Date.now() }
                : x,
            ),
          );
        } else {
          onSaveProviders(
            providers.map((x) =>
              x.id === p.id ? { ...x, status: "fail" } : x,
            ),
          );
        }
      } catch {
        // 网络/CORS 错误：/models 端点受浏览器同源策略限制
        // 仍然应用预设已知模型，状态标注为 cors（非 fail）
        if (known.length > 0) {
          const merged = [...new Set([...known, ...p.models])].sort();
          onSaveProviders(
            providers.map((x) =>
              x.id === p.id
                ? { ...x, models: merged, status: "cors", lastSync: Date.now() }
                : x,
            ),
          );
        } else {
          onSaveProviders(
            providers.map((x) =>
              x.id === p.id ? { ...x, status: "cors" } : x,
            ),
          );
        }
      }
      setSyncingId(null);
    },
    [providers, onSaveProviders],
  );

  const handleDelete = useCallback(
    (id) => {
      onSaveProviders(providers.filter((p) => p.id !== id));
    },
    [providers, onSaveProviders],
  );

  const handleSaveProvider = useCallback(
    (updated) => {
      onSaveProviders(
        providers.map((p) =>
          p.id === updated.id ? { ...updated, status: "untested" } : p,
        ),
      );
    },
    [providers, onSaveProviders],
  );

  if (!open) return null;

  const scanProvider = providers.find((p) => p.id === scanProviderId);
  const imgProvider = providers.find((p) => p.id === imgProviderId);
  const styleProvider = providers.find((p) => p.id === styleProviderId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: 420,
          maxWidth: "100vw",
          height: "100%",
          background: "var(--b1)",
          borderLeft: "1px solid var(--bd)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid var(--bd)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: -0.2,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="settings" size={14} />
            模型设置
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--b3)",
              border: "none",
              borderRadius: 6,
              color: "var(--t2)",
              fontSize: 16,
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--f)",
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--bd)",
            flexShrink: 0,
          }}
        >
          {[
            [
              "providers",
              <>
                <Icon name="plug" size={12} style={{ marginRight: 4 }} />
                供应商管理
              </>,
            ],
            [
              "models",
              <>
                <Icon name="robot" size={12} style={{ marginRight: 4 }} />
                模型配置
              </>,
            ],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "11px 0",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${tab === id ? "var(--accent)" : "transparent"}`,
                color: tab === id ? "var(--accent)" : "var(--t3)",
                fontSize: 12,
                fontWeight: tab === id ? 700 : 400,
                cursor: "pointer",
                fontFamily: "var(--f)",
                transition: "all .15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {/* ── Tab 1: 供应商管理 ── */}
          {tab === "providers" && (
            <>
              {providers.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--t4)",
                    fontSize: 12,
                    padding: "20px 0 24px",
                  }}
                >
                  暂无供应商配置，请在下方添加
                </div>
              )}

              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onTest={() => handleTest(p)}
                  onSync={() => handleSync(p)}
                  onDelete={() => handleDelete(p.id)}
                  onSave={handleSaveProvider}
                  testing={testingId === p.id}
                  syncing={syncingId === p.id}
                />
              ))}

              <SectionTitle>快速添加预设</SectionTitle>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 18,
                }}
              >
                {PRESETS.map((preset) => {
                  const alreadyAdded = providers.some(
                    (p) => p.baseUrl === preset.baseUrl,
                  );
                  return (
                    <button
                      key={preset.name}
                      onClick={() =>
                        !alreadyAdded &&
                        setForm({
                          name: preset.name,
                          baseUrl: preset.baseUrl,
                          apiKey: "",
                        })
                      }
                      disabled={alreadyAdded}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        textAlign: "left",
                        background: alreadyAdded ? "var(--b2)" : "var(--b3)",
                        border: `1px solid ${alreadyAdded ? "var(--success)55" : "var(--bd)"}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        cursor: alreadyAdded ? "default" : "pointer",
                        fontFamily: "var(--f)",
                        width: "100%",
                        opacity: alreadyAdded ? 0.6 : 1,
                        transition: "border-color .15s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          lineHeight: 1,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Icon name={preset.icon} size={18} />
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--t1)",
                            marginBottom: 2,
                          }}
                        >
                          {preset.name}
                          {alreadyAdded && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                color: "var(--success)",
                                fontWeight: 400,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Icon name="check" size={10} />
                              已添加
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--t4)",
                            lineHeight: 1.5,
                          }}
                        >
                          {preset.hint}
                        </div>
                        {preset.defaultModel && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--t3)",
                              fontFamily: "monospace",
                              marginTop: 2,
                            }}
                          >
                            推荐模型: {preset.defaultModel}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <SectionTitle>手动添加供应商</SectionTitle>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Field label="供应商名称">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="如：火山方舟、OpenAI"
                    style={{ ...S.input, fontFamily: "var(--f)" }}
                  />
                </Field>
                <Field
                  label="Base URL"
                  hint="填写 API 根路径，不含末尾斜杠。系统自动拼接 /models、/chat/completions、/images/generations"
                >
                  <input
                    type="text"
                    value={form.baseUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, baseUrl: e.target.value }))
                    }
                    placeholder="https://ark.cn-beijing.volces.com/api/v3"
                    style={S.input}
                  />
                </Field>
                <Field label="API Key">
                  <input
                    type="password"
                    value={form.apiKey}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, apiKey: e.target.value }))
                    }
                    placeholder="Bearer token..."
                    style={S.input}
                  />
                </Field>
                {formErr && (
                  <div style={{ fontSize: 11, color: "var(--danger)" }}>
                    {formErr}
                  </div>
                )}
                <button onClick={handleAdd} style={S.primary}>
                  + 添加供应商
                </button>
                <div
                  style={{ fontSize: 11, color: "var(--t4)", lineHeight: 1.6 }}
                >
                  添加后，点击卡片「测试」验证连通性，点击「↻ 同步」从 /models
                  拉取可用模型列表。
                </div>
              </div>
            </>
          )}

          {/* ── Tab 2: 模型配置 ── */}
          {tab === "models" && (
            <>
              <SectionTitle>代码解析模型</SectionTitle>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <Field label="供应商">
                  <select
                    value={scanProviderId}
                    onChange={(e) => onScanProviderChange(e.target.value)}
                    style={S.select}
                  >
                    <option value="">-- 选择供应商 --</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {scanProvider && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--t4)",
                        fontFamily: "monospace",
                        marginTop: 3,
                      }}
                    >
                      → {scanProvider.baseUrl}/chat/completions
                    </div>
                  )}
                </Field>

                {scanProviderId ? (
                  <>
                    <Field label="解析模型">
                      <ModelPicker
                        models={scanProvider?.models || []}
                        value={scanModel}
                        onChange={onScanModelChange}
                        placeholder="doubao-1-5-pro-32k-250115 或接入点 ID..."
                      />
                    </Field>
                    {scanProvider && !scanProvider.models.length && (
                      <button
                        onClick={() => handleSync(scanProvider)}
                        disabled={syncingId === scanProviderId}
                        style={{ ...S.btn, alignSelf: "flex-start" }}
                      >
                        {syncingId === scanProviderId
                          ? "同步中..."
                          : "↻ 立即同步模型列表"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--t4)" }}>
                    请先选择供应商
                  </div>
                )}

                <div
                  style={{ fontSize: 11, color: "var(--t4)", lineHeight: 1.6 }}
                >
                  使用选定供应商的 chat/completions
                  接口解析游戏代码，提取美术资源清单。
                </div>
              </div>

              <SectionTitle>图像生成模型</SectionTitle>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Field label="供应商">
                  <select
                    value={imgProviderId}
                    onChange={(e) => onImgProviderChange(e.target.value)}
                    style={S.select}
                  >
                    <option value="">-- 选择供应商 --</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {imgProvider && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--t4)",
                        fontFamily: "monospace",
                        marginTop: 3,
                      }}
                    >
                      → {imgProvider.baseUrl}/images/generations
                    </div>
                  )}
                </Field>

                <Field label="请求格式">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.entries(G).map(([k, g2]) => (
                      <button
                        key={k}
                        onClick={() => onSwitchGenerator(k)}
                        style={{
                          padding: "5px 11px",
                          borderRadius: 7,
                          fontFamily: "var(--f)",
                          border: `1.5px solid ${ag === k ? g2.color + "88" : "var(--bd)"}`,
                          background: ag === k ? g2.color + "14" : "var(--b2)",
                          color: ag === k ? g2.color : "var(--t3)",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all .15s",
                        }}
                      >
                        <Icon
                          name={g2.icon}
                          size={12}
                          style={{ marginRight: 3 }}
                        />
                        {g2.name}
                      </button>
                    ))}
                  </div>
                </Field>

                {imgProviderId ? (
                  <>
                    <Field label="生成模型">
                      <ModelPicker
                        models={imgProvider?.models || []}
                        value={imgModel}
                        onChange={onImgModelChange}
                        placeholder="doubao-seedream-5-0-260128 或接入点 ID..."
                      />
                    </Field>
                    {imgProvider && !imgProvider.models.length && (
                      <button
                        onClick={() => handleSync(imgProvider)}
                        disabled={syncingId === imgProviderId}
                        style={{ ...S.btn, alignSelf: "flex-start" }}
                      >
                        {syncingId === imgProviderId
                          ? "同步中..."
                          : "↻ 立即同步模型列表"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--t4)" }}>
                    请先选择供应商
                  </div>
                )}

                {g.docs && (
                  <a
                    href={g.docs}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 11, color: "var(--accent)" }}
                  >
                    查看 {g.name} 文档 ↗
                  </a>
                )}
              </div>

              <SectionTitle style={{ marginTop: 24 }}>
                风格提示词模型
              </SectionTitle>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                <Field label="供应商">
                  <select
                    value={styleProviderId}
                    onChange={(e) => onStyleProviderChange(e.target.value)}
                    style={S.select}
                  >
                    <option value="">—— 选择供应商 ——</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {styleProvider && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--t4)",
                        fontFamily: "monospace",
                        marginTop: 3,
                      }}
                    >
                      → {styleProvider.baseUrl}/chat/completions
                    </div>
                  )}
                </Field>

                {styleProviderId ? (
                  <>
                    <Field label="风格模型">
                      <ModelPicker
                        models={styleProvider?.models || []}
                        value={styleModel}
                        onChange={onStyleModelChange}
                        placeholder="输入模型 ID..."
                      />
                    </Field>
                    {styleProvider && !styleProvider.models.length && (
                      <button
                        onClick={() => handleSync(styleProvider)}
                        disabled={syncingId === styleProviderId}
                        style={{ ...S.btn, alignSelf: "flex-start" }}
                      >
                        {syncingId === styleProviderId
                          ? "同步中..."
                          : "↻ 立即同步模型列表"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--t4)" }}>
                    请先选择供应商
                  </div>
                )}

                <div
                  style={{ fontSize: 11, color: "var(--t4)", lineHeight: 1.6 }}
                >
                  在配置页自定义风格时，点击《
                  <Icon name="sparkle" size={10} style={{ margin: "0 2px" }} />
                  AI 生成》可根据游戏风格描述自动生成英文提示词。
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--bd)",
            fontSize: 11,
            color: "var(--t4)",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          所有配置自动保存至本地浏览器，刷新后依然有效
        </div>
      </div>
    </div>
  );
}
