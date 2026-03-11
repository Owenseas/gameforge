import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

export default function GenerateStep({ gening, prog, res, onViewResults }) {
  const pct = prog.t > 0 ? (prog.d / prog.t) * 100 : 0;

  return (
    <div className="fd" style={{ maxWidth: 780, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {gening && <Spinner s={20} />}
        <h2 style={{ fontSize: 18, fontWeight: 900 }}>
          {gening ? (
            "生成中..."
          ) : (
            <>
              <Icon name="check-circle" size={18} style={{ marginRight: 6 }} />
              生成完成
            </>
          )}
        </h2>
        {!gening && prog.t > 0 && (
          <span style={{ fontSize: 12, color: "var(--t3)", marginLeft: 4 }}>
            {res.filter((a) => a.status === "done").length}/{prog.t} 成功
          </span>
        )}
      </div>

      {/* Progress */}
      <Card
        s={{ marginBottom: 16, padding: "14px 16px" }}
        ch={
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--t2)" }}>
                {prog.c || "等待中"}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--fm)",
                  color: "var(--t2)",
                }}
              >
                {prog.d} / {prog.t}
              </span>
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
                  background: "linear-gradient(90deg, var(--success), #22e05a)",
                  borderRadius: 3,
                  transition: "width .5s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--t4)",
                marginTop: 5,
                fontFamily: "var(--fm)",
              }}
            >
              {Math.round(pct)}%
            </div>
          </>
        }
      />

      {/* Image grid */}
      <div
        className="sm-col1"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 8,
        }}
      >
        {res.map((a) => (
          <Card
            key={a.itemId || a.id}
            s={{ padding: 0, overflow: "hidden" }}
            ch={
              <>
                <div
                  style={{
                    height: 130,
                    background: "var(--b1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {a.imageUrl ? (
                    <img
                      src={a.imageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : a.status === "error" ? (
                    <div style={{ textAlign: "center", padding: "0 10px" }}>
                      <Icon name="x-circle" size={24} />
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--danger)",
                          marginTop: 5,
                          lineHeight: 1.4,
                        }}
                      >
                        {(a.error || "").slice(0, 50)}
                      </div>
                    </div>
                  ) : (
                    <Spinner s={24} />
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
                    }}
                  >
                    {a.itemLabel || a.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--t4)",
                      fontFamily: "var(--fm)",
                      marginTop: 2,
                    }}
                  >
                    {a.rSz || a.width + "×" + a.height}
                  </div>
                </div>
              </>
            }
          />
        ))}
      </div>

      {!gening && res.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button
            c="查看结果"
            v="primary"
            ic={<Icon name="check-circle" size={14} />}
            onClick={onViewResults}
            sz="lg"
          />
        </div>
      )}
    </div>
  );
}
