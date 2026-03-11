import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";

async function downloadImage(result) {
  try {
    const ext = result.imageUrl?.includes(".png") ? "png" : "jpg";
    const blob = await fetch(result.imageUrl).then((r) => r.blob());
    const blobExt = blob.type.includes("png") ? "png" : "jpg";
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objUrl;
    link.download = `${result.assetName}_${result.itemLabel}.${blobExt || ext}`;
    link.click();
    URL.revokeObjectURL(objUrl);
  } catch {
    // skip
  }
}

export default function ReviewStep({
  res,
  gening,
  onExportAll,
  onRetryFailed,
  onExportItem,
  onExport,
}) {
  const doneCount = res.filter((a) => a.status === "done").length;
  const errCount = res.filter((a) => a.status === "error").length;

  // Group by assetId preserving insertion order
  const groupMap = new Map();
  res.forEach((r) => {
    if (!groupMap.has(r.assetId)) {
      groupMap.set(r.assetId, {
        assetName: r.assetName,
        type: r.type,
        results: [],
      });
    }
    groupMap.get(r.assetId).results.push(r);
  });
  const groups = [...groupMap.values()];

  const handleExportAll = onExportAll || onExport;

  return (
    <div className="fd">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.3 }}>
            生成结果
          </h2>
          <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
            <Badge
              c={
                <>
                  <Icon name="check" size={11} style={{ marginRight: 3 }} />
                  {doneCount} 成功
                </>
              }
              t="var(--success)"
            />
            {errCount > 0 && (
              <Badge
                c={
                  <>
                    <Icon name="x" size={11} style={{ marginRight: 3 }} />
                    {errCount} 失败
                  </>
                }
                t="var(--danger)"
              />
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {errCount > 0 && (
            <Button
              c="重试失败项"
              v="ghost"
              ic={<Icon name="refresh" size={13} />}
              onClick={onRetryFailed}
              sz="md"
            />
          )}
          <Button
            c="导出全部"
            v="gold"
            ic={<Icon name="package" size={13} />}
            sz="md"
            onClick={handleExportAll}
            dis={!res.some((a) => a.status === "done")}
          />
        </div>
      </div>

      {/* Groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {groups.map((group) => {
          const done = group.results.filter((r) => r.status === "done").length;
          const err = group.results.filter((r) => r.status === "error").length;
          return (
            <div key={group.results[0]?.assetId}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "var(--t1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {group.assetName}
                <span
                  style={{ fontSize: 11, color: "var(--t3)", fontWeight: 400 }}
                >
                  （{group.results.length}张 · ✅ {done}成功
                  {err > 0 ? `  ❌ ${err}失败` : ""}）
                </span>
              </div>
              <div
                className="sm-col1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
                  gap: 8,
                }}
              >
                {group.results.map((r) => {
                  const ok = r.status === "done";
                  return (
                    <Card
                      key={r.itemId || r.id}
                      s={{
                        padding: 0,
                        overflow: "hidden",
                        borderColor: ok ? "var(--bd)" : "rgba(255,55,95,.25)",
                      }}
                      ch={
                        <>
                          <div
                            style={{
                              height: 140,
                              background: ok
                                ? "var(--b1)"
                                : "rgba(255,55,95,.06)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundImage: r.transparent
                                ? "repeating-conic-gradient(var(--b3) 0% 25%, transparent 0% 50%) 50% / 12px 12px"
                                : "none",
                            }}
                          >
                            {r.imageUrl ? (
                              <img
                                src={r.imageUrl}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <span style={{ opacity: 0.25 }}>
                                {ok ? (
                                  <Icon name="package" size={28} />
                                ) : (
                                  <Icon name="x-circle" size={28} />
                                )}
                              </span>
                            )}
                          </div>
                          <div style={{ padding: "8px 10px" }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                marginBottom: 3,
                              }}
                            >
                              {r.itemLabel || r.name}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--t4)",
                                fontFamily: "var(--fm)",
                              }}
                            >
                              {r.rSz || r.width + "×" + r.height}
                              {r.usage
                                ? " · " + r.usage.total_tokens + " tok"
                                : ""}
                            </div>
                            {!ok && r.error && (
                              <div
                                title={r.error}
                                style={{
                                  fontSize: 10,
                                  color: "var(--danger)",
                                  marginTop: 4,
                                  lineHeight: 1.4,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "help",
                                }}
                              >
                                {r.error.slice(0, 60)}
                              </div>
                            )}
                            {r.prompt && (
                              <details
                                style={{
                                  fontSize: 10,
                                  color: "var(--t3)",
                                  marginTop: 5,
                                }}
                              >
                                <summary
                                  style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                >
                                  提示词
                                </summary>
                                <div
                                  style={{
                                    marginTop: 4,
                                    padding: "5px 7px",
                                    background: "var(--b1)",
                                    borderRadius: 5,
                                    fontFamily: "var(--fm)",
                                    fontSize: 10,
                                    lineHeight: 1.5,
                                    maxHeight: 60,
                                    overflow: "auto",
                                    color: "var(--t2)",
                                  }}
                                >
                                  {r.prompt}
                                </div>
                              </details>
                            )}
                            <div style={{ marginTop: 6 }}>
                              {ok ? (
                                <button
                                  onClick={() =>
                                    onExportItem
                                      ? onExportItem(r)
                                      : onExport
                                        ? onExport(r)
                                        : downloadImage(r)
                                  }
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 8px",
                                    borderRadius: 5,
                                    border: "1px solid var(--success)",
                                    background: "rgba(48,209,88,.08)",
                                    color: "var(--success)",
                                    cursor: "pointer",
                                    fontFamily: "var(--f)",
                                  }}
                                >
                                  ✅ 下载
                                </button>
                              ) : (
                                <button
                                  onClick={onRetryFailed}
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 8px",
                                    borderRadius: 5,
                                    border: "1px solid rgba(255,55,95,.3)",
                                    background: "rgba(255,55,95,.06)",
                                    color: "var(--danger)",
                                    cursor: "pointer",
                                    fontFamily: "var(--f)",
                                  }}
                                >
                                  🔄 重试
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
