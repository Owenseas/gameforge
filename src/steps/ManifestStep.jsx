import { useState, useCallback } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AT } from "../constants/config";
import { Icon } from "../components/ui/Icon";

// Three-state checkbox state for an asset
function assetCheckedState(asset, sel) {
  const ids = asset.items.map((i) => i.id);
  const selected = ids.filter((id) => sel.has(id)).length;
  if (selected === 0) return "none";
  if (selected === ids.length) return "all";
  return "partial";
}

function selectAsset(asset, sel) {
  const next = new Set(sel);
  asset.items.forEach((i) => next.add(i.id));
  return next;
}

function deselectAsset(asset, sel) {
  const next = new Set(sel);
  asset.items.forEach((i) => next.delete(i.id));
  return next;
}

function shortHash() {
  return Math.random().toString(36).slice(2, 7);
}

function ThreeStateCheckbox({ state, onChange, color }) {
  const c = color || "var(--accent)";
  return (
    <div
      onClick={onChange}
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: "2px solid " + (state !== "none" ? c : "var(--t4)"),
        background:
          state === "all" ? c : state === "partial" ? c + "44" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        color: "#fff",
        flexShrink: 0,
        cursor: "pointer",
        transition: "all .15s",
        userSelect: "none",
      }}
    >
      {state === "all" && <Icon name="check" size={10} />}
      {state === "partial" && (
        <span style={{ fontSize: 9, lineHeight: 1 }}>▣</span>
      )}
    </div>
  );
}

function ItemRow({ item, checked, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(item.prompt);
  const [draftLabel, setDraftLabel] = useState(item.label);

  const saveEdit = useCallback(() => {
    if (!draftPrompt.trim()) return;
    onUpdate(item.id, {
      prompt: draftPrompt.trim(),
      label: draftLabel.trim() || item.label,
    });
    setEditing(false);
  }, [draftPrompt, draftLabel, item.id, item.label, onUpdate]);

  const cancelEdit = useCallback(() => {
    setDraftPrompt(item.prompt);
    setDraftLabel(item.label);
    setEditing(false);
  }, [item.prompt, item.label]);

  return (
    <div style={{ borderTop: "1px solid var(--bd)", padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          style={{ marginTop: 2, cursor: "pointer", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span
                  style={{ fontSize: 11, color: "var(--t3)", flexShrink: 0 }}
                >
                  标签：
                </span>
                <input
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid var(--bd)",
                    background: "var(--b1)",
                    color: "var(--t1)",
                    fontFamily: "var(--f)",
                  }}
                />
              </div>
              <textarea
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  fontSize: 11,
                  fontFamily: "var(--fm)",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--bd)",
                  background: "var(--b1)",
                  color: "var(--t2)",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              {!draftPrompt.trim() && (
                <div style={{ fontSize: 10, color: "var(--danger)" }}>
                  提示词不能为空
                </div>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <Button
                  c="保存"
                  v="primary"
                  sz="sm"
                  onClick={saveEdit}
                  dis={!draftPrompt.trim()}
                />
                <Button c="取消" v="ghost" sz="sm" onClick={cancelEdit} />
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 2,
                  color: "var(--t1)",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--t3)",
                  lineHeight: 1.5,
                  fontFamily: "var(--fm)",
                }}
              >
                {item.prompt}
              </div>
            </div>
          )}
        </div>
        {!editing && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setEditing(true)}
              title="编辑"
              style={{
                background: "var(--b3)",
                border: "1px solid var(--bd)",
                borderRadius: 5,
                fontSize: 11,
                padding: "2px 6px",
                cursor: "pointer",
                color: "var(--t2)",
                fontFamily: "var(--f)",
              }}
            >
              ✎
            </button>
            <button
              onClick={() => onDelete(item.id)}
              title="删除"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,55,95,.3)",
                borderRadius: 5,
                fontSize: 11,
                padding: "2px 6px",
                cursor: "pointer",
                color: "var(--danger)",
                fontFamily: "var(--f)",
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ asset, sel, setSel, onManiChange, mani }) {
  const [expanded, setExpanded] = useState(false);
  const t = AT[asset.type] || { l: asset.type, i: "package", c: "#888" };
  const state = assetCheckedState(asset, sel);
  const hasItems = asset.items.length > 0;

  function handleCheckboxClick() {
    if (!hasItems) return;
    if (state === "all") setSel(deselectAsset(asset, sel));
    else setSel(selectAsset(asset, sel));
  }

  function updateItem(itemId, fields) {
    const newAssets = mani.assets.map((a) => {
      if (a.id !== asset.id) return a;
      return {
        ...a,
        items: a.items.map((it) =>
          it.id === itemId ? { ...it, ...fields } : it,
        ),
      };
    });
    onManiChange({ ...mani, assets: newAssets });
  }

  function deleteItem(itemId) {
    const newAssets = mani.assets.map((a) => {
      if (a.id !== asset.id) return a;
      return { ...a, items: a.items.filter((it) => it.id !== itemId) };
    });
    const newSel = new Set(sel);
    newSel.delete(itemId);
    onManiChange({ ...mani, assets: newAssets });
    setSel(newSel);
  }

  function addItem() {
    const newId = asset.id + "_u" + shortHash();
    const newItem = { id: newId, label: "", prompt: "" };
    const newAssets = mani.assets.map((a) => {
      if (a.id !== asset.id) return a;
      return { ...a, items: [...a.items, newItem] };
    });
    onManiChange({ ...mani, assets: newAssets });
    const newSel = new Set(sel);
    newSel.add(newId);
    setSel(newSel);
    setExpanded(true);
  }

  const selectedCount = asset.items.filter((it) => sel.has(it.id)).length;

  return (
    <Card
      s={{
        padding: 12,
        background: state !== "none" ? t.c + "0A" : "var(--b2)",
        border: "1px solid " + (state !== "none" ? t.c + "55" : "var(--bd)"),
      }}
      ch={
        <div>
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThreeStateCheckbox
              state={hasItems ? state : "none"}
              onChange={hasItems ? handleCheckboxClick : undefined}
              color={t.c}
            />
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                background: t.c + "1A",
                border: "1px solid " + t.c + "30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={t.i} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {asset.name}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Badge c={t.l} t={t.c} />
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--t4)",
                    fontFamily: "var(--fm)",
                  }}
                >
                  {asset.width}×{asset.height}
                </span>
                {!hasItems ? (
                  <span style={{ fontSize: 10, color: "var(--warning)" }}>
                    ⚠️ 无子项
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      color: state !== "none" ? t.c : "var(--t4)",
                      fontFamily: "var(--fm)",
                      fontWeight: 600,
                    }}
                  >
                    ×{asset.items.length}张
                    {selectedCount !== asset.items.length
                      ? `  ${selectedCount}/${asset.items.length}选中`
                      : ""}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "var(--b3)",
                border: "1px solid var(--bd)",
                borderRadius: 6,
                fontSize: 11,
                padding: "3px 9px",
                cursor: "pointer",
                color: "var(--t2)",
                fontFamily: "var(--f)",
                flexShrink: 0,
              }}
            >
              {expanded ? "收起 ↑" : "查看详情 →"}
            </button>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--t3)", flex: 1 }}>
                  {asset.items.length} 张
                </span>
                <button
                  onClick={() => setSel(selectAsset(asset, sel))}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 5,
                    border: "1px solid var(--bd)",
                    background: "var(--b3)",
                    cursor: "pointer",
                    color: "var(--t2)",
                    fontFamily: "var(--f)",
                  }}
                >
                  全选
                </button>
                <button
                  onClick={() => setSel(deselectAsset(asset, sel))}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 5,
                    border: "1px solid var(--bd)",
                    background: "var(--b3)",
                    cursor: "pointer",
                    color: "var(--t2)",
                    fontFamily: "var(--f)",
                  }}
                >
                  全不选
                </button>
              </div>
              {asset.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  checked={sel.has(item.id)}
                  onToggle={() => {
                    const next = new Set(sel);
                    sel.has(item.id) ? next.delete(item.id) : next.add(item.id);
                    setSel(next);
                  }}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              ))}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={addItem}
                  style={{
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--bd)",
                    background: "var(--b3)",
                    cursor: "pointer",
                    color: "var(--accent)",
                    fontFamily: "var(--f)",
                  }}
                >
                  + 添加一项
                </button>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}

export default function ManifestStep({
  mani,
  sel,
  setSel,
  onManiChange,
  filt,
  setFilt,
  fa,
  ac,
  onNext,
}) {
  const totalItems = mani.assets.reduce((s, a) => s + a.items.length, 0);
  const allSelected = sel.size === totalItems && totalItems > 0;

  return (
    <div className="fd">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: -0.3,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="clipboard" size={18} />
            {mani.game_name}
          </h2>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>
            找到 {mani.assets.length} 个分类 · 共 {totalItems} 张图，
            {allSelected ? "已全选" : `已选 ${sel.size} 张`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            c="全选"
            v="ghost"
            sz="sm"
            onClick={() => {
              const all = new Set();
              mani.assets.forEach((a) =>
                a.items.forEach((it) => all.add(it.id)),
              );
              setSel(all);
            }}
          />
          <Button
            c={`配置 · ${sel.size} 张`}
            v="primary"
            ic={<Icon name="settings" size={13} />}
            onClick={onNext}
            dis={!sel.size}
            sz="md"
          />
        </div>
      </div>

      {/* Structure summary */}
      {mani.structure_summary && (
        <details style={{ marginBottom: 14 }}>
          <summary
            style={{
              fontSize: 12,
              color: "var(--accent)",
              cursor: "pointer",
              userSelect: "none",
              fontWeight: 600,
            }}
          >
            📋 游戏结构摘要
          </summary>
          <div
            style={{
              marginTop: 6,
              padding: "10px 12px",
              background: "var(--b1)",
              borderRadius: 8,
              border: "1px solid var(--bd)",
              fontSize: 11,
              color: "var(--t2)",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {mani.structure_summary}
          </div>
        </details>
      )}

      {/* Filter tabs */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}
      >
        <button
          className="gf-pill"
          onClick={() => setFilt("all")}
          style={{
            padding: "5px 12px",
            borderRadius: 99,
            border:
              "1px solid " +
              (filt === "all" ? "rgba(255,255,255,.25)" : "var(--bd)"),
            fontSize: 12,
            fontWeight: 600,
            background: filt === "all" ? "var(--b4)" : "var(--b2)",
            color: filt === "all" ? "var(--t1)" : "var(--t3)",
            cursor: "pointer",
            fontFamily: "var(--f)",
            transition: "all .15s",
          }}
        >
          全部 {mani.assets.length}
        </button>
        {Object.entries(AT).map(([k, v]) => {
          const c = ac[k] || 0;
          if (!c) return null;
          return (
            <button
              key={k}
              className="gf-pill"
              onClick={() => setFilt(k)}
              style={{
                padding: "5px 12px",
                borderRadius: 99,
                border: "1px solid " + (filt === k ? v.c + "55" : "var(--bd)"),
                fontSize: 12,
                fontWeight: 600,
                background: filt === k ? v.c + "1A" : "var(--b2)",
                color: filt === k ? v.c : "var(--t3)",
                cursor: "pointer",
                fontFamily: "var(--f)",
                transition: "all .15s",
              }}
            >
              <Icon name={v.i} size={12} style={{ marginRight: 3 }} />
              {v.l} {c}
            </button>
          );
        })}
      </div>

      {/* Asset list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {fa.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            sel={sel}
            setSel={setSel}
            onManiChange={onManiChange}
            mani={mani}
          />
        ))}
      </div>
    </div>
  );
}
