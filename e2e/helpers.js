/**
 * 共享测试辅助：
 *  - localStorage provider 预填（绕过 SettingsPanel 手动配置）
 *  - 加速 setTimeout（把长延迟从 2000ms → 20ms）
 *  - /api-proxy 路由拦截工厂
 */

/** 最小 1×1 透明 PNG 的 data URL，用作 mock 图片 URL */
export const MOCK_IMAGE_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAA" +
  "DUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/** 供应商配置（scan + image 同一条供应商，方便测试） */
export const MOCK_PROVIDER = {
  id: "e2e-provider",
  name: "E2E Mock",
  baseUrl: "https://e2e-mock.test/v1",
  apiKey: "sk-e2e-mock-key",
  models: [],
  status: "untested",
  lastSync: null,
};

/**
 * page.addInitScript 使用的脚本：
 *  1. 将 provider/model 写入 localStorage（在 React 初始化前执行）
 *  2. 将 dly(间隔)写入 localStorage（App 的 dly state 硬编码 2，只能通过 UI 改）
 *  3. 覆盖 setTimeout 跳过长延迟（> 500ms → 20ms）
 */
export function buildInitScript(overrides = {}) {
  const provider = JSON.stringify([
    { ...MOCK_PROVIDER, ...overrides.provider },
  ]);
  const scanPid = overrides.scanPid ?? "e2e-provider";
  const scanModel = overrides.scanModel ?? "e2e-model";
  const imgPid = overrides.imgPid ?? "e2e-provider";

  return `
(function() {
  try {
    // 供应商 & 模型配置
    localStorage.setItem('gf_providers',  ${JSON.stringify(provider)});
    localStorage.setItem('gf_scan_pid',   ${JSON.stringify(scanPid)});
    localStorage.setItem('gf_scan_model', ${JSON.stringify(scanModel)});
    localStorage.setItem('gf_img_pid',    ${JSON.stringify(imgPid)});

    // 加速 setTimeout（跳过长延迟，避免 2s/item 拖慢测试）
    const _origTimeout = window.setTimeout;
    window.setTimeout = function(fn, ms, ...args) {
      return _origTimeout(fn, ms > 500 ? 20 : ms, ...args);
    };
  } catch(e) {
    console.warn('[e2e-init] setup failed:', e);
  }
})();
`;
}

/**
 * 创建 /api-proxy 路由拦截处理器。
 * 根据 x-proxy-target 请求头区分：
 *   - 包含 chat/completions → scan 链路（Call1 / Call2）
 *   - 包含 images/generations → 生图链路
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ manifest?: object, onCall?: Function }} opts
 */
export async function setupApiProxy(page, opts = {}) {
  const manifest = opts.manifest ?? buildMinimalManifest();
  const calls = { scan1: 0, scan2: 0, image: 0 };

  await page.route("**/api-proxy", async (route) => {
    const req = route.request();
    const target = (req.headers()["x-proxy-target"] || "").toLowerCase();

    // ── 图像生成 API ──────────────────────────────────────────────────────────
    if (target.includes("images/generations")) {
      calls.image++;
      opts.onCall?.("image", calls.image);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [{ url: MOCK_IMAGE_URL, size: "1x1" }],
          usage: { total_tokens: 1 },
        }),
      });
      return;
    }

    // ── 文本 / 扫码 API ───────────────────────────────────────────────────────
    if (target.includes("chat/completions")) {
      let postBody = {};
      try {
        postBody = JSON.parse(req.postData() || "{}");
      } catch {
        // ignore parse errors
      }
      const systemContent = postBody.messages?.[0]?.content ?? "";

      // Call 1 — 结构分析（system msg 包含"游戏结构分析师"）
      if (systemContent.includes("游戏结构分析师")) {
        calls.scan1++;
        opts.onCall?.("scan1", calls.scan1);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            choices: [
              {
                message: {
                  content:
                    "共3关，第1章森林（森林背景/洞穴背景），第2章城堡（城堡背景）。" +
                    "BOSS：树灵、洞穴巨魔、龙王。武器：剑、斧、弓。",
                },
              },
            ],
          }),
        });
        return;
      }

      // Call 2 — Manifest 生成（system msg 包含"美术资源分析专家"）
      if (systemContent.includes("美术资源分析专家")) {
        calls.scan2++;
        opts.onCall?.("scan2", calls.scan2);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify(manifest),
                },
              },
            ],
          }),
        });
        return;
      }
    }

    // 未匹配的请求 → 返回 400 让测试更容易发现问题
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "e2e-unmatched-route", target }),
    });
  });

  return calls;
}

/**
 * 最简 Manifest（3 个 item），避免大量 API 调用拖慢测试。
 */
export function buildMinimalManifest() {
  return {
    game_name: "Adventure Quest (E2E)",
    structure_summary:
      "3 levels across 2 chapters. Bosses: Tree Spirit, Cave Troll, Dragon King.",
    source_files: ["game.js", "levels/level_data.json"],
    assets: [
      {
        id: "bg_forest",
        name: "森林背景",
        type: "background",
        width: 1920,
        height: 1080,
        transparent: false,
        items: [
          {
            id: "bg_forest_1",
            label: "1-1 黑暗森林",
            prompt:
              "dark enchanted forest, towering ancient trees, eerie green fog at ground level",
          },
          {
            id: "bg_forest_2",
            label: "1-2 森林夜色",
            prompt:
              "moonlit forest at night, silvery light, mysterious glowing mushrooms",
          },
        ],
      },
      {
        id: "boss",
        name: "BOSS",
        type: "target",
        width: 512,
        height: 512,
        transparent: true,
        items: [
          {
            id: "boss_1",
            label: "树灵 BOSS",
            prompt:
              "ancient tree spirit boss, gnarled bark body, glowing amber eyes, leaf crown",
          },
        ],
      },
      {
        id: "weapon",
        name: "武器",
        type: "weapon",
        width: 128,
        height: 128,
        transparent: true,
        items: [
          {
            id: "weapon_1",
            label: "铁剑",
            prompt:
              "iron fantasy sword, metallic blade, ornate crossguard, game icon style",
          },
        ],
      },
    ],
  };
}
