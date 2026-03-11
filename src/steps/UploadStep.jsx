import { useRef } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

export default function UploadStep({ onFiles, onDemo }) {
  const fR = useRef(null);

  return (
    <div
      className="fd"
      style={{ maxWidth: 580, margin: "0 auto", padding: "0 4px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ marginBottom: 10 }}>
          <Icon name="gamepad" size={40} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>
          游戏美术 AI 生成器
        </h1>
        <p
          style={{
            color: "var(--t3)",
            fontSize: 13,
            marginTop: 6,
            lineHeight: 1.6,
          }}
        >
          上传代码 → 选择文件 → AI 解析 → 检查清单 → 批量生成 → 导出
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => fR.current?.click()}
        style={{
          border: "2px dashed rgba(255,255,255,.14)",
          borderRadius: 16,
          padding: "52px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: "var(--b1)",
          transition: "border-color .2s, background .2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,229,255,.35)";
          e.currentTarget.style.background = "var(--b2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,.14)";
          e.currentTarget.style.background = "var(--b1)";
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <Icon name="folder-open" size={48} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          拖放项目文件夹到此处
        </div>
        <div style={{ color: "var(--t3)", fontSize: 13 }}>
          支持抖音 / 微信小游戏 / Android / Web
        </div>
        <div
          style={{
            color: "var(--t4)",
            fontSize: 11,
            marginTop: 8,
            fontFamily: "var(--fm)",
          }}
        >
          .js .ts .kt .java .json .html .xml
        </div>
        <input
          ref={fR}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => onFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      <Card
        s={{
          textAlign: "center",
          marginTop: 16,
          padding: "14px 16px",
          background: "var(--b1)",
        }}
        ch={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              没有项目？先体验 Demo
            </div>
            <Button
              c="Demo 模式"
              v="ghost"
              ic={<Icon name="target" size={14} />}
              onClick={onDemo}
              sz="lg"
            />
          </div>
        }
      />
    </div>
  );
}
