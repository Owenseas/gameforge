import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { PRIORITY_KEYWORDS_HIGH } from "../constants/priority";

function filePriorityLabel(path) {
  const n = path.toLowerCase();
  if (PRIORITY_KEYWORDS_HIGH.some((k) => n.includes(k))) return "high";
  return "normal";
}

export default function ScanStep({
  scanning,
  scanPhase,
  scanProgress,
  onScan,
  onBack,
  scanReady,
  scanProviderName,
  scanModel,
  onOpenSettings,
}) {
  const phase = scanPhase || "idle";
  const progress = scanProgress || {
    phase: "idle",
    readFiles: [],
    structureSummary: "",
    errorMsg: "",
  };

  const pct =
    phase === "idle"
      ? 0
      : phase === "analyzing"
        ? 50
        : phase === "generating"
          ? 100
          : phase === "done"
            ? 100
            : 0;

  return (
    <div className="fd" style={{ maxWidth: 560, margin: "0 auto" }}>
      <Card
        s={{ padding: 32 }}
        ch={
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* idle */}
            {phase === "idle" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "center",
                }}
              >
                <Icon name="search" size={40} />
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}
                  >
                    🔍 准备就绪
                  </div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>
                    点击「AI 解析」自动识别游戏美术资源
                  </div>
                </div>
                <ApiStatus
                  scanReady={scanReady}
                  scanProviderName={scanProviderName}
                  scanModel={scanModel}
                  onOpenSettings={onOpenSettings}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button c="返回" v="ghost" onClick={onBack} sz="md" />
                  <Button
                    c="AI 解析"
                    v="primary"
                    ic={<Icon name="search" size={13} />}
                    onClick={onScan}
                    dis={!scanReady}
                    sz="lg"
                  />
                </div>
              </div>
            )}

            {/* analyzing */}
            {phase === "analyzing" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Spinner s={20} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      第 1/2 步：分析代码结构…
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}
                    >
                      正在读取文件，识别游戏章节和角色…
                    </div>
                  </div>
                </div>
                {progress.readFiles.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--t3)",
                        marginBottom: 6,
                      }}
                    >
                      已读取文件（{progress.readFiles.length} 个）：
                    </div>
                    <div
                      style={{
                        maxHeight: 180,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                      className="sc"
                    >
                      {progress.readFiles.map((f) => {
                        const pri = filePriorityLabel(f);
                        return (
                          <div
                            key={f}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11,
                            }}
                          >
                            <Icon
                              name="file"
                              size={11}
                              style={{ color: "var(--t4)", flexShrink: 0 }}
                            />
                            <span
                              style={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "var(--t2)",
                              }}
                            >
                              {f}
                            </span>
                            {pri === "high" && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--success)",
                                  flexShrink: 0,
                                }}
                              >
                                🟢 高优先
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <ProgressBar pct={pct} />
              </div>
            )}

            {/* generating */}
            {phase === "generating" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Spinner s={20} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      第 2/2 步：生成资源清单…
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}
                    >
                      正在整理清单，请稍候…
                    </div>
                  </div>
                </div>
                {progress.structureSummary && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: "var(--b1)",
                      border: "1px solid var(--bd)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--success)",
                        marginBottom: 6,
                      }}
                    >
                      <Icon name="check" size={11} style={{ marginRight: 4 }} />
                      结构识别完成：
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--t2)",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {progress.structureSummary}
                    </div>
                  </div>
                )}
                <ProgressBar pct={pct} label="正在整理清单…" />
              </div>
            )}

            {/* error */}
            {phase === "error" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "center",
                }}
              >
                <Icon
                  name="x-circle"
                  size={36}
                  style={{ color: "var(--danger)" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--danger)",
                    }}
                  >
                    解析失败
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--t3)",
                      marginTop: 4,
                      maxWidth: 320,
                    }}
                  >
                    {progress.errorMsg || "请检查供应商配置和 API Key"}
                  </div>
                </div>
                <ApiStatus
                  scanReady={scanReady}
                  scanProviderName={scanProviderName}
                  scanModel={scanModel}
                  onOpenSettings={onOpenSettings}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button c="返回" v="ghost" onClick={onBack} sz="md" />
                  <Button
                    c="重试"
                    v="primary"
                    ic={<Icon name="refresh" size={13} />}
                    onClick={onScan}
                    dis={!scanReady}
                    sz="lg"
                  />
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

function ApiStatus({ scanReady, scanProviderName, scanModel, onOpenSettings }) {
  return (
    <div
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        background: scanReady ? "rgba(48,209,88,.08)" : "rgba(255,55,95,.08)",
        border:
          "1px solid " +
          (scanReady ? "rgba(48,209,88,.25)" : "rgba(255,55,95,.25)"),
        fontSize: 12,
        color: scanReady ? "var(--success)" : "var(--danger)",
        width: "100%",
        maxWidth: 340,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <span>
        {scanReady ? (
          <>
            <Icon name="check" size={11} style={{ marginRight: 3 }} />
            {`${scanProviderName || "解析模型"}${scanModel ? " · " + scanModel : ""} 已配置`}
          </>
        ) : (
          <>
            <Icon name="warning" size={11} style={{ marginRight: 3 }} />
            解析模型未配置，请先去设置
          </>
        )}
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
        去设置
      </button>
    </div>
  );
}

function ProgressBar({ pct, label }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 11,
          color: "var(--t3)",
        }}
      >
        <span>{label || ""}</span>
        <span style={{ fontFamily: "var(--fm)" }}>{Math.round(pct)}%</span>
      </div>
      <div
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          background: "var(--b3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--accent), #22e05a)",
            borderRadius: 3,
            transition: "width .5s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
    </div>
  );
}
