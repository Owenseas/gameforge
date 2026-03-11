import { useState, useCallback, useMemo } from "react";
import { proxyFetch } from "./utils/proxyFetch";
import { G } from "./constants/generators";
import { STEPS, PL, ST, DEMO_MANIFEST } from "./constants/config";
import {
  PRIORITY_KEYWORDS_HIGH,
  PRIORITY_KEYWORDS_MID,
} from "./constants/priority";
import { globalCss } from "./styles/global";
import { Badge } from "./components/ui/Badge";
import { Icon } from "./components/ui/Icon";
import UploadStep from "./steps/UploadStep";
import FileSelectStep, { collectDefaults } from "./steps/FileSelectStep";
import ScanStep from "./steps/ScanStep";
import ManifestStep from "./steps/ManifestStep";
import ConfigStep from "./steps/ConfigStep";
import GenerateStep from "./steps/GenerateStep";
import ReviewStep from "./steps/ReviewStep";
import SettingsPanel from "./components/SettingsPanel";

export default function App() {
  const [step, setStep] = useState("upload");
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [selectedPaths, setSelectedPaths] = useState(new Set());
  const [plat, setPlat] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState("idle"); // idle | analyzing | generating | error | done
  const [scanProgress, setScanProgress] = useState({
    phase: "idle",
    readFiles: [],
    structureSummary: "",
    errorMsg: "",
  });
  const [mani, setMani] = useState(null);
  const [sel, setSel] = useState(new Set());
  const [gening, setGening] = useState(false);
  const [prog, setProg] = useState({ d: 0, t: 0, c: "" });
  const [res, setRes] = useState([]);
  const [filt, setFilt] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ag, setAg] = useState(
    () => localStorage.getItem("gf_ag") || "seedream",
  );
  // providers: [{id, name, baseUrl, apiKey, models[], status, lastSync}]
  const [providers, setProviders] = useState(() => {
    try {
      const saved = localStorage.getItem("gf_providers");
      if (saved) return JSON.parse(saved);
      // Migrate from legacy single-key config
      const oldKey = localStorage.getItem("gf_key") || "";
      if (!oldKey) return [];
      const oldUrl = localStorage.getItem("gf_url") || G.seedream.defUrl;
      const baseUrl = oldUrl
        .replace(/\/(images\/generations|chat\/completions)(\/.*)?$/, "")
        .replace(/\/+$/, "");
      const migrated = [
        {
          id: "migrated",
          name: "Migrated Provider",
          baseUrl,
          apiKey: oldKey,
          models: [],
          status: "untested",
          lastSync: null,
        },
      ];
      localStorage.setItem("gf_providers", JSON.stringify(migrated));
      return migrated;
    } catch {
      return [];
    }
  });
  const [scanProviderId, setScanProviderId] = useState(
    () =>
      localStorage.getItem("gf_scan_pid") ||
      (localStorage.getItem("gf_key") ? "migrated" : ""),
  );
  const [scanModel, setScanModel] = useState(
    () => localStorage.getItem("gf_scan_model") || "",
  );
  const [imgProviderId, setImgProviderId] = useState(
    () =>
      localStorage.getItem("gf_img_pid") ||
      (localStorage.getItem("gf_key") ? "migrated" : ""),
  );
  const [styleProviderId, setStyleProviderId] = useState(
    () => localStorage.getItem("gf_style_pid") || "",
  );
  const [styleModel, setStyleModel] = useState(
    () => localStorage.getItem("gf_style_model") || "",
  );

  const saveProviders = useCallback((updated) => {
    setProviders(updated);
    localStorage.setItem("gf_providers", JSON.stringify(updated));
  }, []);
  const saveScanProviderId = useCallback((id) => {
    setScanProviderId(id);
    localStorage.setItem("gf_scan_pid", id);
  }, []);
  const saveScanModel = useCallback((v) => {
    setScanModel(v);
    localStorage.setItem("gf_scan_model", v);
  }, []);
  const saveImgProviderId = useCallback((id) => {
    setImgProviderId(id);
    localStorage.setItem("gf_img_pid", id);
  }, []);
  const saveStyleProviderId = useCallback((id) => {
    setStyleProviderId(id);
    localStorage.setItem("gf_style_pid", id);
  }, []);
  const saveStyleModel = useCallback((v) => {
    setStyleModel(v);
    localStorage.setItem("gf_style_model", v);
  }, []);
  const [gp, setGp] = useState({ ...G.seedream.defP });
  const [sty, setSty] = useState("dark");
  const [csty, setCsty] = useState("");
  const [dly, setDly] = useState(2);

  const g = G[ag];
  const si = STEPS.findIndex((s) => s.id === step);

  const scanProvider = providers.find((p) => p.id === scanProviderId);
  const imgProvider = providers.find((p) => p.id === imgProviderId);
  const styleProvider = providers.find((p) => p.id === styleProviderId);
  const imgUrl = imgProvider
    ? imgProvider.baseUrl.replace(/\/+$/, "") + "/images/generations"
    : "";
  const imgKey = imgProvider?.apiKey || "";

  const exportAll = useCallback(async () => {
    const done = res.filter((a) => a.status === "done" && a.imageUrl);
    if (!done.length) return;
    for (const a of done) {
      try {
        const blob = await fetch(a.imageUrl).then((r) => r.blob());
        const ext = blob.type.includes("png") ? "png" : "jpg";
        const objUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objUrl;
        link.download = `${a.assetName}_${a.itemLabel}.${ext}`;
        link.click();
        URL.revokeObjectURL(objUrl);
        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch {
        // skip failed assets
      }
    }
  }, [res]);

  const exportItem = useCallback(async (item) => {
    if (!item?.imageUrl) return;
    try {
      const blob = await fetch(item.imageUrl).then((r) => r.blob());
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = `${item.assetName}_${item.itemLabel}.${ext}`;
      link.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      // ignore
    }
  }, []);

  const swG = useCallback((k) => {
    setAg(k);
    localStorage.setItem("gf_ag", k);
    setGp({ ...G[k].defP });
  }, []);

  const handleFiles = useCallback((fl) => {
    const all = Array.from(fl);
    setAllFiles(all);
    const defaults = collectDefaults(all);
    setSelectedPaths(defaults);
    // Detect platform from all files
    const ps = all.map((f) => f.webkitRelativePath || f.name);
    let d = "web";
    if (ps.some((p) => p.includes("AndroidManifest"))) d = "android";
    else if (ps.some((p) => p.includes("project.config"))) d = "wechat";
    else if (ps.some((p) => p.includes("game.js"))) d = "douyin";
    setPlat(d);
    setScanPhase("idle");
    setScanProgress({
      phase: "idle",
      readFiles: [],
      structureSummary: "",
      errorMsg: "",
    });
    setStep("fileselect");
  }, []);

  const handleFileSelectConfirm = useCallback(
    (paths) => {
      const selected = allFiles.filter((f) =>
        paths.has(f.webkitRelativePath || f.name),
      );
      setFiles(selected);
      setScanPhase("idle");
      setScanProgress({
        phase: "idle",
        readFiles: [],
        structureSummary: "",
        errorMsg: "",
      });
      setStep("scan");
    },
    [allFiles],
  );

  const handleDemo = useCallback(() => {
    setMani(DEMO_MANIFEST);
    setPlat("web");
    const allItemIds = new Set();
    DEMO_MANIFEST.assets.forEach((a) =>
      (a.items || []).forEach((it) => allItemIds.add(it.id)),
    );
    setSel(allItemIds);
    setStep("manifest");
  }, []);

  const scan = useCallback(async () => {
    setScanning(true);
    setScanPhase("analyzing");
    setScanProgress({
      phase: "analyzing",
      readFiles: [],
      structureSummary: "",
      errorMsg: "",
    });
    try {
      const SUPPORTED = [
        ".js",
        ".ts",
        ".kt",
        ".java",
        ".json",
        ".html",
        ".xml",
      ];
      const filtered = files.filter((f) =>
        SUPPORTED.some((e) => f.name.toLowerCase().endsWith(e)),
      );
      const sortRank = (f) => {
        const n = (f.webkitRelativePath || f.name).toLowerCase();
        if (PRIORITY_KEYWORDS_HIGH.some((k) => n.includes(k))) return 0;
        if (PRIORITY_KEYWORDS_MID.some((k) => n.includes(k))) return 1;
        return 2;
      };
      const sorted = [...filtered]
        .sort((a, b) => sortRank(a) - sortRank(b))
        .slice(0, 15);
      const readFiles = sorted.map((f) => f.webkitRelativePath || f.name);
      setScanProgress((p) => ({ ...p, readFiles }));

      const fileContents = await Promise.all(
        sorted.map(async (f) => ({
          n: f.webkitRelativePath || f.name,
          c: (await f.text()).slice(0, 8000),
        })),
      );
      const codeBlock = fileContents
        .map((f) => "--- " + f.n + " ---\n" + f.c)
        .join("\n\n");

      const scanKey = scanProvider?.apiKey || "";
      const scanUrl = scanProvider
        ? scanProvider.baseUrl.replace(/\/+$/, "") + "/chat/completions"
        : "";
      if (!scanUrl || !scanKey) {
        throw new Error("请先在设置中添加供应商并配置 API Key");
      }

      // ── Call 1: Structure analysis ──
      const r1 = await proxyFetch(scanUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + scanKey,
        },
        body: JSON.stringify({
          model: scanModel,
          max_tokens: 1500,
          temperature: 0.3,
          thinking: { type: "disabled" },
          messages: [
            {
              role: "system",
              content:
                "你是专业游戏结构分析师。分析提供的游戏代码，识别游戏的整体结构。只输出纯文字摘要，不要列举资源清单，不要输出 JSON。",
            },
            {
              role: "user",
              content: `分析以下游戏代码，告诉我：\n1. 游戏总共有几章/几关（给出明确数字）\n2. 每章/关卡的主题和场景氛围\n3. 有哪些 BOSS/精英敌人（一一列出）\n4. 有哪些武器/道具变体（一一列出）\n5. 有哪些重要 UI 场景\n\n请用简洁中文描述，无需额外解释。\n\n---以下是游戏代码---\n${codeBlock}`,
            },
          ],
        }),
      });
      if (!r1.ok) {
        const eText = await r1.text().catch(() => "");
        let eMsg = "HTTP " + r1.status;
        try {
          const j = JSON.parse(eText);
          eMsg = j.error?.message || j.message || eMsg;
        } catch {}
        throw new Error(eMsg);
      }
      const d1 = await r1.json();
      const structureSummary = d1.choices?.[0]?.message?.content?.trim() || "";
      setScanPhase("generating");
      setScanProgress((p) => ({ ...p, phase: "generating", structureSummary }));

      // ── Call 2: Manifest generation ──
      const r2 = await proxyFetch(scanUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + scanKey,
        },
        body: JSON.stringify({
          model: scanModel,
          max_tokens: 8000,
          temperature: 0.2,
          thinking: { type: "disabled" },
          messages: [
            {
              role: "system",
              content:
                "你是专业游戏美术资源分析专家。根据游戏结构摘要和代码，生成完整的美术资源清单。只输出纯 JSON，不要任何解释、markdown 代码块或其他文字。",
            },
            {
              role: "user",
              content: `游戏结构摘要：\n${structureSummary}\n\n基于以上结构和下方代码，生成美术资源清单。\n\n严格规则：每张独立图片必须是独立一条 item，禁止合并。prompt 用英文。\n\n返回格式：\n{"game_name":"","structure_summary":"","source_files":[],"assets":[{"id":"","name":"","type":"background|prop|target|weapon|effect|ui","width":1080,"height":1920,"transparent":false,"items":[{"id":"","label":"","prompt":""}]}]}\n\n---以下是游戏代码---\n${codeBlock}`,
            },
          ],
        }),
      });
      if (!r2.ok) {
        const eText = await r2.text().catch(() => "");
        let eMsg = "HTTP " + r2.status;
        try {
          const j = JSON.parse(eText);
          eMsg = j.error?.message || j.message || eMsg;
        } catch {}
        throw new Error(eMsg);
      }
      const d2 = await r2.json();
      const t2 = d2.choices?.[0]?.message?.content || "";
      const cleaned = t2
        .replace(/```(?:json)?\s*/g, "")
        .replace(/```\s*$/g, "")
        .trim();
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("模型未返回有效 JSON，请重试");
      const parsed = JSON.parse(m[0]);
      if (!parsed.source_files?.length) parsed.source_files = readFiles;
      if (!parsed.structure_summary)
        parsed.structure_summary = structureSummary;
      setMani(parsed);
      const allItemIds = new Set();
      parsed.assets.forEach((a) =>
        (a.items || []).forEach((it) => allItemIds.add(it.id)),
      );
      setSel(allItemIds);
      setScanPhase("done");
      setStep("manifest");
    } catch (e) {
      setScanPhase("error");
      setScanProgress((p) => ({
        ...p,
        phase: "error",
        errorMsg: e.message || "请检查供应商配置和 API Key",
      }));
    }
    setScanning(false);
  }, [files, scanProvider, scanModel]);

  const genStylePrompt = useCallback(
    async (gameStyle) => {
      if (!styleProvider?.apiKey || !styleModel) {
        throw new Error("请先在设置中配置风格提示词模型");
      }
      const url =
        styleProvider.baseUrl.replace(/\/+$/, "") + "/chat/completions";
      const r = await proxyFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + styleProvider.apiKey,
        },
        body: JSON.stringify({
          model: styleModel,
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content:
                "你是专业游戏美术风格设计师。根据用户描述的游戏风格，生成简洁的英文风格提示词用于AI图像生成。直接输出提示词，不要任何解释和引号。包含艺术风格、色调、光影等关键词，用逗号分隔，不超过80个单词。",
            },
            {
              role: "user",
              content: "游戏风格：" + gameStyle,
            },
          ],
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error?.message || "HTTP " + r.status);
      }
      const d = await r.json();
      return d.choices?.[0]?.message?.content?.trim() || "";
    },
    [styleProvider, styleModel],
  );

  const startG = useCallback(async () => {
    if (!mani?.assets?.length || !imgUrl || !imgKey) return;
    setGening(true);
    setStep("generate");
    // Flatten assets → items filtered by sel
    const tasks = mani.assets
      .filter((a) => (a.items || []).some((item) => sel.has(item.id)))
      .flatMap((asset) =>
        (asset.items || [])
          .filter((item) => sel.has(item.id))
          .map((item) => ({ asset, item })),
      );
    setProg({ d: 0, t: tasks.length, c: "" });
    const rs = [];
    const styd = csty || ST.find((s) => s.id === sty)?.d || "game art";
    for (let i = 0; i < tasks.length; i++) {
      const { asset, item } = tasks[i];
      const label = `${asset.name}（${item.label}）`;
      setProg({ d: i, t: tasks.length, c: label });
      const fullPrompt = [
        item.prompt,
        "Style: " + styd,
        asset.transparent ? "transparent bg" : "",
      ]
        .filter(Boolean)
        .join(", ");
      const neg = "text, watermark, blurry, low quality";
      try {
        const pl = g.build(fullPrompt, neg, asset.width, asset.height, gp);
        const hd = g.auth(imgKey);
        const rp = await proxyFetch(imgUrl, {
          method: "POST",
          headers: hd,
          body: JSON.stringify(pl),
        });
        if (rp.ok) {
          const d = await rp.json();
          const pd = g.parse(d);
          rs.push(
            pd.ok
              ? {
                  assetId: asset.id,
                  assetName: asset.name,
                  itemId: item.id,
                  itemLabel: item.label,
                  type: asset.type,
                  width: asset.width,
                  height: asset.height,
                  transparent: asset.transparent,
                  status: "done",
                  imageUrl: pd.url,
                  prompt: fullPrompt,
                  rSz: pd.sz,
                  usage: pd.usage,
                }
              : {
                  assetId: asset.id,
                  assetName: asset.name,
                  itemId: item.id,
                  itemLabel: item.label,
                  type: asset.type,
                  width: asset.width,
                  height: asset.height,
                  transparent: asset.transparent,
                  status: "error",
                  error: pd.err,
                  prompt: fullPrompt,
                },
          );
        } else {
          const et = await rp.text().catch(() => "");
          rs.push({
            assetId: asset.id,
            assetName: asset.name,
            itemId: item.id,
            itemLabel: item.label,
            type: asset.type,
            width: asset.width,
            height: asset.height,
            transparent: asset.transparent,
            status: "error",
            error: "HTTP " + rp.status + ": " + et.slice(0, 80),
            prompt: fullPrompt,
          });
        }
      } catch (e) {
        rs.push({
          assetId: asset.id,
          assetName: asset.name,
          itemId: item.id,
          itemLabel: item.label,
          type: asset.type,
          width: asset.width,
          height: asset.height,
          transparent: asset.transparent,
          status: "error",
          error: e.message,
          prompt: fullPrompt,
        });
      }
      setRes([...rs]);
      setProg({ d: i + 1, t: tasks.length, c: label });
      if (i < tasks.length - 1)
        await new Promise((resolve) => setTimeout(resolve, dly * 1000));
    }
    setGening(false);
    setStep("review");
  }, [mani, sel, imgUrl, imgKey, g, gp, sty, csty, dly]);

  // Retry only failed items, preserving successful results.
  const retryFailed = useCallback(async () => {
    if (!imgUrl || !imgKey) return;
    const failed = res.filter((r) => r.status === "error");
    if (!failed.length) return;
    setGening(true);
    setStep("generate");
    // Build a lookup of current results keyed by itemId for merging later.
    const successMap = new Map(
      res.filter((r) => r.status === "done").map((r) => [r.itemId, r]),
    );
    const styd = csty || ST.find((s) => s.id === sty)?.d || "game art";
    const retryResults = [...successMap.values()];
    setProg({ d: 0, t: failed.length, c: "" });
    for (let i = 0; i < failed.length; i++) {
      const item = failed[i];
      const label = `${item.assetName}（${item.itemLabel}）`;
      setProg({ d: i, t: failed.length, c: label });
      const fullPrompt = item.prompt;
      try {
        const asset = mani.assets.find((a) => a.id === item.assetId) || {
          id: item.assetId,
          name: item.assetName,
          type: item.type,
          width: item.width,
          height: item.height,
          transparent: item.transparent,
        };
        const pl = g.build(
          fullPrompt,
          "text, watermark, blurry, low quality",
          asset.width,
          asset.height,
          gp,
        );
        const hd = g.auth(imgKey);
        const rp = await proxyFetch(imgUrl, {
          method: "POST",
          headers: hd,
          body: JSON.stringify(pl),
        });
        if (rp.ok) {
          const d = await rp.json();
          const pd = g.parse(d);
          retryResults.push(
            pd.ok
              ? {
                  ...item,
                  status: "done",
                  imageUrl: pd.url,
                  error: undefined,
                  rSz: pd.sz,
                  usage: pd.usage,
                }
              : { ...item, status: "error", error: pd.err },
          );
        } else {
          const et = await rp.text().catch(() => "");
          retryResults.push({
            ...item,
            status: "error",
            error: "HTTP " + rp.status + ": " + et.slice(0, 80),
          });
        }
      } catch (e) {
        retryResults.push({ ...item, status: "error", error: e.message });
      }
      // Sort back to original order by assetId then itemId
      const ordered = res.map(
        (r) => retryResults.find((rr) => rr.itemId === r.itemId) || r,
      );
      setRes([...ordered]);
      setProg({ d: i + 1, t: failed.length, c: label });
      if (i < failed.length - 1)
        await new Promise((resolve) => setTimeout(resolve, dly * 1000));
    }
    setGening(false);
    setStep("review");
  }, [res, mani, imgUrl, imgKey, g, gp, sty, csty, dly]);

  const fa = useMemo(
    () =>
      mani?.assets
        ? filt === "all"
          ? mani.assets
          : mani.assets.filter((a) => a.type === filt)
        : [],
    [mani, filt],
  );

  const ac = useMemo(() => {
    const c = {};
    mani?.assets?.forEach((a) => {
      c[a.type] = (c[a.type] || 0) + 1;
    });
    return c;
  }, [mani]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "var(--b0)",
        fontFamily: "var(--f)",
        color: "var(--t1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{globalCss}</style>

      {/* ── Header ── */}
      <header
        style={{
          height: 52,
          borderBottom: "1px solid var(--bd)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          background: "var(--b1)",
          flexShrink: 0,
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <Icon name="gamepad" size={18} />
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: -0.3 }}>
            GameForge
          </span>
        </div>

        {/* Step nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 12,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <button
                onClick={() => i <= si && setStep(s.id)}
                className={step === s.id ? "gf-step-active" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "none",
                  background: step === s.id ? "var(--b3)" : "transparent",
                  color:
                    i <= si
                      ? step === s.id
                        ? "var(--t1)"
                        : "var(--t2)"
                      : "var(--t4)",
                  fontSize: 12,
                  fontWeight: step === s.id ? 700 : 400,
                  fontFamily: "var(--f)",
                  cursor: i <= si ? "pointer" : "default",
                  opacity: i <= si ? 1 : 0.35,
                  transition: "color .15s, background .15s",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  className="sm-hide"
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <Icon name={s.i} size={13} />
                </span>
                <span className="sm-hide">{s.l}</span>
                <span style={{ display: "none" }} className="sm-show">
                  <Icon name={s.i} size={13} />
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  style={{
                    color: "var(--t4)",
                    fontSize: 10,
                    margin: "0 1px",
                    flexShrink: 0,
                  }}
                >
                  ›
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Right badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSettingsOpen(true)}
            title="全局设置"
            style={{
              background: "var(--b3)",
              border: "1px solid var(--bd)",
              borderRadius: 7,
              color: "var(--t2)",
              fontSize: 15,
              width: 30,
              height: 30,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background .15s",
            }}
          >
            <Icon name="settings" size={15} />
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        className="sc"
        style={{ flex: 1, overflow: "auto", padding: "20px 16px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {step === "upload" && (
            <UploadStep onFiles={handleFiles} onDemo={handleDemo} />
          )}
          {step === "fileselect" && (
            <FileSelectStep
              allFiles={allFiles}
              selectedPaths={selectedPaths}
              onSelectionChange={setSelectedPaths}
              onConfirm={handleFileSelectConfirm}
              onBack={() => setStep("upload")}
            />
          )}
          {step === "scan" && (
            <ScanStep
              scanning={scanning}
              scanPhase={scanPhase}
              scanProgress={scanProgress}
              onScan={scan}
              onBack={() => setStep("fileselect")}
              scanReady={!!(scanProvider?.apiKey && scanModel)}
              scanProviderName={scanProvider?.name || ""}
              scanModel={scanModel}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}
          {step === "manifest" && mani && (
            <ManifestStep
              mani={mani}
              sel={sel}
              setSel={setSel}
              onManiChange={setMani}
              filt={filt}
              setFilt={setFilt}
              fa={fa}
              ac={ac}
              onNext={() => setStep("config")}
            />
          )}
          {step === "config" && (
            <ConfigStep
              ag={ag}
              gp={gp}
              setGp={setGp}
              sty={sty}
              setSty={setSty}
              csty={csty}
              setCsty={setCsty}
              dly={dly}
              setDly={setDly}
              sel={sel}
              mani={mani}
              g={g}
              apiReady={!!(imgUrl && imgKey)}
              onOpenSettings={() => setSettingsOpen(true)}
              onBack={() => setStep("manifest")}
              onStart={startG}
              styleReady={!!(styleProvider?.apiKey && styleModel)}
              onGenStylePrompt={genStylePrompt}
            />
          )}
          {step === "generate" && (
            <GenerateStep
              gening={gening}
              prog={prog}
              res={res}
              onViewResults={() => setStep("review")}
            />
          )}
          {step === "review" && (
            <ReviewStep
              res={res}
              gening={gening}
              onExportAll={exportAll}
              onExportItem={exportItem}
              onRetryFailed={retryFailed}
            />
          )}
        </div>
      </main>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        providers={providers}
        onSaveProviders={saveProviders}
        ag={ag}
        onSwitchGenerator={swG}
        scanProviderId={scanProviderId}
        onScanProviderChange={saveScanProviderId}
        scanModel={scanModel}
        onScanModelChange={saveScanModel}
        imgProviderId={imgProviderId}
        onImgProviderChange={saveImgProviderId}
        imgModel={gp.model}
        onImgModelChange={(m) => setGp((prev) => ({ ...prev, model: m }))}
        styleProviderId={styleProviderId}
        onStyleProviderChange={saveStyleProviderId}
        styleModel={styleModel}
        onStyleModelChange={saveStyleModel}
        g={g}
      />
    </div>
  );
}
