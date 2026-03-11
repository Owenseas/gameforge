import { useState } from "react";
import { ST } from "../constants/config";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import SeedreamParams from "../components/SeedreamParams";
import { Icon } from "../components/ui/Icon";

export default function ConfigStep({
  ag,
  gp,
  setGp,
  sty,
  setSty,
  csty,
  setCsty,
  dly,
  setDly,
  sel,
  mani,
  g,
  apiReady,
  onOpenSettings,
  onBack,
  onStart,
  styleReady,
  onGenStylePrompt,
}) {
  const [gameStyleDesc, setGameStyleDesc] = useState("");
  const [styGenerating, setStyGenerating] = useState(false);

  const handleGenStyle = async () => {
    if (!gameStyleDesc.trim()) return;
    setStyGenerating(true);
    try {
      const result = await onGenStylePrompt(gameStyleDesc.trim());
      if (result) setCsty(result);
    } catch (e) {
      alert("风格提示词生成失败：" + (e.message || "请检查风格模型配置"));
    }
    setStyGenerating(false);
  };
  return (
    <div className="fd" style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3 }}>
          配置生成参数
        </h2>
        <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>
          调整模型参数与生图风格
        </div>
      </div>

      <div
        className="md-col1"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        {/* Model params Card */}
        <Card
          ch={
            <>
              {/* API status row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: apiReady
                    ? "rgba(48,209,88,.08)"
                    : "rgba(255,55,95,.08)",
                  border:
                    "1px solid " +
                    (apiReady ? "rgba(48,209,88,.25)" : "rgba(255,55,95,.25)"),
                  marginBottom: 12,
                  fontSize: 12,
                  color: apiReady ? "var(--success)" : "var(--danger)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>
                    <Icon name={g.icon} size={12} style={{ marginRight: 3 }} />
                  </span>
                  <span>
                    {apiReady ? (
                      <>
                        {g.name} API 已配置 <Icon name="check" size={11} />
                      </>
                    ) : (
                      "图像 API 未配置"
                    )}
                  </span>
                </span>
                <button
                  onClick={onOpenSettings}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "var(--f)",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  <>
                    <Icon
                      name="settings"
                      size={11}
                      style={{ marginRight: 3 }}
                    />
                    去设置
                  </>
                </button>
              </div>

              {/* Generator params */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--b1)",
                  borderRadius: 10,
                  border: "1px solid var(--bd)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: g.color,
                    marginBottom: 10,
                  }}
                >
                  {g.icon} {g.name} 参数
                </div>
                {ag === "seedream" ? (
                  <SeedreamParams p={gp} set={setGp} />
                ) : ag === "nanobanana" ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <Input
                      lb="Steps"
                      type="number"
                      v={gp.steps}
                      onChange={(v) => setGp({ ...gp, steps: +v || 30 })}
                    />
                    <Input
                      lb="Guidance"
                      type="number"
                      v={gp.gd}
                      onChange={(v) => setGp({ ...gp, gd: +v || 7.5 })}
                    />
                  </div>
                ) : ag === "midjourney" ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <Input
                      lb="Stylize"
                      type="number"
                      v={gp.sty}
                      onChange={(v) => setGp({ ...gp, sty: +v || 250 })}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>
                    确保响应体包含 url 字段
                  </div>
                )}
              </div>

              <Input
                lb="请求间隔（秒）"
                type="number"
                v={dly}
                onChange={(v) => setDly(+v || 1)}
                s={{ marginTop: 10 }}
              />
            </>
          }
        />

        {/* Style Card */}
        <Card
          ch={
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "var(--t1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="palette" size={13} />
                生图风格
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {ST.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSty(s.id)}
                    className="gf-pill"
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      cursor: "pointer",
                      border:
                        "1.5px solid " +
                        (sty === s.id ? "rgba(0,229,255,.6)" : "var(--bd)"),
                      background:
                        sty === s.id ? "var(--accent-dim)" : "var(--b1)",
                      textAlign: "center",
                      transition: "all .15s",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Icon name={s.p} size={20} />
                    </span>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: sty === s.id ? "var(--accent)" : "var(--t2)",
                      }}
                    >
                      {s.n}
                    </div>
                  </div>
                ))}
                {/* 自定义风格堅 */}
                <div
                  onClick={() => setSty("custom")}
                  className="gf-pill"
                  style={{
                    padding: "10px 8px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border:
                      "1.5px solid " +
                      (sty === "custom" ? "rgba(255,149,0,.7)" : "var(--bd)"),
                    background:
                      sty === "custom" ? "rgba(255,149,0,.08)" : "var(--b1)",
                    textAlign: "center",
                    transition: "all .15s",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Icon name="pencil" size={20} />
                  </span>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: sty === "custom" ? "#FF9500" : "var(--t2)",
                    }}
                  >
                    自定义
                  </div>
                </div>
              </div>

              {/* 自定义风格区域 */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 9,
                  border:
                    "1px solid " +
                    (sty === "custom" ? "rgba(255,149,0,.35)" : "var(--bd)"),
                  background:
                    sty === "custom" ? "rgba(255,149,0,.04)" : "var(--b1)",
                  transition: "border-color .2s, background .2s",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: sty === "custom" ? "#FF9500" : "var(--t3)",
                    marginBottom: 7,
                  }}
                >
                  {sty === "custom" ? (
                    <>
                      <Icon
                        name="pencil"
                        size={11}
                        style={{ marginRight: 3 }}
                      />
                      自定义风格提示词
                    </>
                  ) : (
                    "可选：覆盖提示词"
                  )}
                </div>
                <textarea
                  value={csty}
                  onChange={(e) => setCsty(e.target.value)}
                  placeholder={
                    sty === "custom"
                      ? "输入或生成风格提示词，如：watercolor, soft lighting, vivid colors..."
                      : "（可不填）自定义覆盖兑..."
                  }
                  rows={2}
                  className="gf-textarea"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border:
                      "1px solid " +
                      (sty === "custom" ? "rgba(255,149,0,.4)" : "var(--bd2)"),
                    background: "var(--b2)",
                    color: "var(--t1)",
                    fontSize: 12,
                    fontFamily: "var(--f)",
                    outline: "none",
                    resize: "vertical",
                    transition: "border-color .15s, box-shadow .15s",
                    lineHeight: 1.5,
                    boxSizing: "border-box",
                  }}
                />

                {/* AI 生成风格提示词 - 仅在自定义模式显示 */}
                {sty === "custom" && (
                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      type="text"
                      value={gameStyleDesc}
                      onChange={(e) => setGameStyleDesc(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !styGenerating && handleGenStyle()
                      }
                      placeholder="描述游戏风格，如：赛博朋克机瞟..."
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: 7,
                        border: "1px solid var(--bd)",
                        background: "var(--b2)",
                        color: "var(--t1)",
                        fontSize: 11,
                        fontFamily: "var(--f)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleGenStyle}
                      disabled={
                        !styleReady || styGenerating || !gameStyleDesc.trim()
                      }
                      title={
                        !styleReady
                          ? "请先在设置中配置风格提示词模型"
                          : "AI 生成风格提示词"
                      }
                      style={{
                        padding: "6px 11px",
                        borderRadius: 7,
                        border: "1px solid rgba(255,149,0,.5)",
                        background: styGenerating
                          ? "var(--b2)"
                          : "rgba(255,149,0,.12)",
                        color: !styleReady ? "var(--t4)" : "#FF9500",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor:
                          !styleReady || styGenerating || !gameStyleDesc.trim()
                            ? "not-allowed"
                            : "pointer",
                        fontFamily: "var(--f)",
                        whiteSpace: "nowrap",
                        transition: "all .15s",
                        flexShrink: 0,
                      }}
                    >
                      {styGenerating ? (
                        "⧗ 生成中..."
                      ) : (
                        <>
                          <Icon
                            name="sparkle"
                            size={11}
                            style={{ marginRight: 3 }}
                          />
                          AI 生成
                        </>
                      )}
                    </button>
                  </div>
                )}
                {sty === "custom" && !styleReady && (
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 10,
                      color: "var(--t4)",
                    }}
                  >
                    <>
                      <Icon name="info" size={10} style={{ marginRight: 3 }} />
                      在设置 → 模型配置 → 风格提示词模型中配置后方可使用 AI 生成
                    </>
                  </div>
                )}
              </div>

              {ag === "seedream" && mani?.assets?.[0] && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    background: "var(--b1)",
                    borderRadius: 8,
                    border: "1px solid var(--bd)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--t3)",
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon name="antenna" size={11} />
                    请求预览
                  </div>
                  <pre
                    style={{
                      fontSize: 10,
                      color: "var(--t2)",
                      fontFamily: "var(--fm)",
                      whiteSpace: "pre-wrap",
                      maxHeight: 110,
                      overflow: "auto",
                      lineHeight: 1.5,
                    }}
                  >
                    {JSON.stringify(
                      g.build(
                        mani.assets[0].description +
                          ". Style: " +
                          (csty || ST.find((s) => s.id === sty)?.d),
                        "text,watermark",
                        mani.assets[0].width,
                        mani.assets[0].height,
                        gp,
                      ),
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </>
          }
        />
      </div>

      {/* Footer action bar */}
      <Card
        s={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
        }}
        ch={
          <>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                共 {sel.size} 项资源待生成
              </div>
              {!apiReady && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--danger)",
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon name="settings" size={11} />
                  请先在设置中配置 API URL 和 Key
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button c="返回" v="ghost" onClick={onBack} sz="md" />
              <Button
                c="开始生成"
                v="primary"
                ic={<Icon name="rocket" size={14} />}
                sz="lg"
                onClick={onStart}
                dis={!apiReady}
              />
            </div>
          </>
        }
      />
    </div>
  );
}
