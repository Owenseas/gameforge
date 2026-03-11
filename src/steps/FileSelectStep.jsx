import { useMemo } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { Badge } from "../components/ui/Badge";
import { PRIORITY_KEYWORDS_HIGH } from "../constants/priority";

const SUPPORTED_EXT = [".js", ".ts", ".kt", ".java", ".json", ".html", ".xml"];

function getPriority(file) {
  const n = (file.webkitRelativePath || file.name).toLowerCase();
  const ext = "." + n.split(".").pop();
  if (!SUPPORTED_EXT.includes(ext)) return "unsupported";
  if (PRIORITY_KEYWORDS_HIGH.some((k) => n.includes(k))) return "high";
  return "normal";
}

function buildTree(files) {
  const root = {};
  for (const file of files) {
    const rel = file.webkitRelativePath || file.name;
    const parts = rel.split("/");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!node[part]) node[part] = { __children: {} };
      node = node[part].__children;
    }
    const fname = parts[parts.length - 1];
    node[fname] = { __file: file, __priority: getPriority(file) };
  }
  return root;
}

function collectDefaults(files) {
  const sorted = [...files].sort((a, b) => {
    const pa = getPriority(a);
    const pb = getPriority(b);
    if (pa === pb) return 0;
    if (pa === "high") return -1;
    if (pb === "high") return 1;
    if (pa === "normal") return -1;
    return 1;
  });
  const result = new Set();
  for (const f of sorted) {
    const p = getPriority(f);
    if (p === "unsupported") continue;
    if (result.size >= 15) break;
    result.add(f.webkitRelativePath || f.name);
  }
  return result;
}

function TreeNode({ name, node, depth, selectedPaths, onToggle }) {
  const isFile = !!node.__file;
  const file = node.__file;
  const priority = node.__priority;

  if (isFile) {
    const path = file.webkitRelativePath || file.name;
    const selectable = priority !== "unsupported";
    const checked = selectedPaths.has(path);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 6px",
          paddingLeft: 12 + depth * 16,
          borderRadius: 5,
          opacity: selectable ? 1 : 0.4,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={!selectable}
          onChange={() => selectable && onToggle(path)}
          style={{
            cursor: selectable ? "pointer" : "not-allowed",
            flexShrink: 0,
          }}
        />
        <Icon
          name="file"
          size={12}
          style={{ color: "var(--t4)", flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: 12,
            color: selectable ? "var(--t2)" : "var(--t4)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        {priority === "high" && <Badge c="推荐" t="var(--success)" />}
        {priority === "unsupported" && (
          <span style={{ fontSize: 10, color: "var(--t4)" }}>不可选</span>
        )}
      </div>
    );
  }

  // Directory node
  const children = node.__children || {};
  const childKeys = Object.keys(children).sort();
  // Gather all file paths under this dir
  function collectPaths(n) {
    const paths = [];
    if (n.__file) {
      const p = n.__file.webkitRelativePath || n.__file.name;
      if (n.__priority !== "unsupported") paths.push(p);
    }
    const ch = n.__children || {};
    for (const k of Object.keys(ch)) paths.push(...collectPaths(ch[k]));
    return paths;
  }
  const dirPaths = childKeys.flatMap((k) => collectPaths(children[k]));
  const selectedCount = dirPaths.filter((p) => selectedPaths.has(p)).length;
  const allSelected = dirPaths.length > 0 && selectedCount === dirPaths.length;
  const partialSelected = selectedCount > 0 && !allSelected;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 6px",
          paddingLeft: 12 + depth * 16,
          borderRadius: 5,
          cursor: dirPaths.length > 0 ? "pointer" : "default",
        }}
        onClick={() => {
          if (!dirPaths.length) return;
          const next = new Set(selectedPaths);
          if (allSelected) {
            dirPaths.forEach((p) => next.delete(p));
          } else {
            dirPaths.forEach((p) => next.add(p));
          }
          onToggle(null, next);
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            border:
              "1.5px solid " +
              (allSelected || partialSelected ? "var(--accent)" : "var(--t4)"),
            background: allSelected
              ? "var(--accent)"
              : partialSelected
                ? "rgba(0,229,255,.3)"
                : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {allSelected && <Icon name="check" size={9} />}
          {partialSelected && (
            <span style={{ fontSize: 8, lineHeight: 1 }}>▣</span>
          )}
        </div>
        <Icon
          name="folder"
          size={12}
          style={{ color: "var(--warning)", flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>
          {name}/
        </span>
      </div>
      <div>
        {childKeys.map((k) => (
          <TreeNode
            key={k}
            name={k}
            node={children[k]}
            depth={depth + 1}
            selectedPaths={selectedPaths}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default function FileSelectStep({
  allFiles,
  selectedPaths,
  onSelectionChange,
  onConfirm,
  onBack,
}) {
  const tree = useMemo(() => buildTree(allFiles), [allFiles]);
  const rootKeys = useMemo(() => Object.keys(tree).sort(), [tree]);

  const totalFiles = allFiles.filter(
    (f) => getPriority(f) !== "unsupported",
  ).length;
  const selectedCount = selectedPaths.size;
  const highCount = [...selectedPaths].filter((p) => {
    const f = allFiles.find((f) => (f.webkitRelativePath || f.name) === p);
    return f && getPriority(f) === "high";
  }).length;
  const normalCount = selectedCount - highCount;
  const estimatedTokens = selectedCount * 500;
  const overLimit = selectedCount > 15;

  function handleToggle(path, nextSet) {
    if (nextSet) {
      onSelectionChange(nextSet);
      return;
    }
    const next = new Set(selectedPaths);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    onSelectionChange(next);
  }

  return (
    <div className="fd" style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: -0.3,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Icon name="file-check" size={18} />
          选择要分析的文件
        </h2>
        <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>
          勾选要送入 AI 解析的文件，建议选择核心逻辑和配置文件
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}
      >
        {/* File tree */}
        <Card
          s={{ padding: 0, overflow: "hidden" }}
          ch={
            <div>
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--bd)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--t2)",
                }}
              >
                <Icon name="folder-open" size={13} style={{ marginRight: 5 }} />
                项目文件树
              </div>
              <div
                style={{ maxHeight: 480, overflowY: "auto", padding: "6px 0" }}
                className="sc"
              >
                {rootKeys.map((k) => (
                  <TreeNode
                    key={k}
                    name={k}
                    node={tree[k]}
                    depth={0}
                    selectedPaths={selectedPaths}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          }
        />

        {/* Summary panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Card
            s={{ padding: 14 }}
            ch={
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}
                >
                  <Icon name="bar-chart" size={13} style={{ marginRight: 5 }} />
                  选择摘要
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 900, color: "var(--t1)" }}
                >
                  {selectedCount}{" "}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: "var(--t3)",
                    }}
                  >
                    / {totalFiles} 个
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>
                  预估 token: ~{estimatedTokens.toLocaleString()}
                </div>
                {overLimit && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--warning)",
                      padding: "6px 8px",
                      background: "rgba(255,149,0,.08)",
                      borderRadius: 6,
                      border: "1px solid rgba(255,149,0,.2)",
                    }}
                  >
                    ⚠️ 已超过推荐数量，可能影响解析质量
                  </div>
                )}
                {!overLimit && selectedCount <= 15 && selectedCount > 0 && (
                  <div style={{ fontSize: 11, color: "var(--t4)" }}>
                    建议 ≤ 15 个文件
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid var(--bd)",
                    paddingTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "var(--success)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "var(--t3)" }}>
                      高优先级 {highCount} 个
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "var(--accent)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "var(--t3)" }}>
                      普通文件 {normalCount} 个
                    </span>
                  </div>
                </div>
              </div>
            }
          />

          <Button c="← 返回" v="ghost" sz="md" onClick={onBack} />
          <Button
            c="开始 AI 解析 →"
            v="primary"
            sz="md"
            dis={selectedCount === 0}
            onClick={() => onConfirm(selectedPaths)}
          />
        </div>
      </div>
    </div>
  );
}

export { collectDefaults };
