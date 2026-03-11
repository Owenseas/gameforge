/**
 * E2E 测试 — 完整链路（含 AI 解析阶段）
 *
 * 验证路径：
 *   上传游戏代码文件 → FileSelectStep → ScanStep（mock AI 两次调用）
 *   → ManifestStep → ConfigStep → GenerateStep（mock 图像 API）→ ReviewStep
 *
 * 这是最终完整链路的核心验证：
 *   "游戏代码当需求文档 → AI 解析出资源清单 → 生图 → 结果"
 *
 * 重点断言：
 *   1. 两阶段 AI 解析（结构分析 + Manifest 生成）均被调用
 *   2. 解析出的 Manifest 能渲染到 ManifestStep
 *   3. 生图 API 被调用
 *   4. Review Step 展示成功结果
 */

import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildInitScript,
  setupApiProxy,
  buildMinimalManifest,
} from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** 磁盘上的 fixture 游戏项目目录（webkitdirectory 需要真实目录路径） */
const GAME_PROJECT_DIR = path.join(__dirname, "fixtures", "game-project");

/** 上传 fixture 目录到 webkitdirectory input 的辅助函数 */
async function uploadGameProject(page) {
  const fileInput = page.locator("input[type='file']");
  await expect(fileInput).toBeAttached();
  await fileInput.setInputFiles(GAME_PROJECT_DIR);
}

test.describe("完整链路：上传 → 解析 → 清单 → 生成 → 结果", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(buildInitScript());
    await page.goto("/");
  });

  // ─────────────────────────────────────────────────────────────
  // TC-10: 上传游戏文件 → 进入 FileSelectStep
  // ─────────────────────────────────────────────────────────────
  test("TC-10 上传游戏代码文件 → 进入文件选择步骤", async ({ page }) => {
    // 上传真实 fixture 目录
    await uploadGameProject(page);

    // 应进入 FileSelectStep（显示文件树结构，game.js 出现）
    await expect(page.getByText(/game\.js/i)).toBeVisible({
      timeout: 5000,
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TC-11: FileSelect → ScanStep → Manifest（AI 解析两阶段全链路）
  // ─────────────────────────────────────────────────────────────
  test("TC-11 AI 解析两阶段全链路：代码→结构分析→Manifest 生成", async ({
    page,
  }) => {
    const apiCalls = await setupApiProxy(page);

    // 1. 上传 fixture 目录
    await uploadGameProject(page);

    // 2. 进入 FileSelectStep — 找确认按钮（"开始 AI 解析 →"）
    await expect(page.getByText(/game\.js/i)).toBeVisible({ timeout: 5000 });
    const confirmBtn = page.getByRole("button", { name: /开始\s*AI\s*解析/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 3. 进入 ScanStep — 应出现"AI 解析"按钮
    const scanBtn = page.getByRole("button", { name: "AI 解析" });
    await expect(scanBtn).toBeVisible({ timeout: 5000 });

    // scan 前验证按钮可点击（provider 已在 localStorage 配好）
    await expect(scanBtn).toBeEnabled();
    await scanBtn.click();

    // 4. 等待跳转到 ManifestStep
    //    判断终态：ManifestStep 有"配置 · N 张"按钮（只有 mani 加载后才出现）
    await expect(page.getByRole("button", { name: /配置\s*·/ })).toBeVisible({
      timeout: 30000,
    });

    // 5. 验证两次 AI 调用都发生了（结构分析 + Manifest 生成）
    expect(apiCalls.scan1).toBe(1);
    expect(apiCalls.scan2).toBe(1);

    // 6. Manifest 上应出现我们 mock 返回的资源分类名称
    await expect(
      page.getByText(/Adventure Quest|森林背景|BOSS|武器/i).first(),
    ).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // TC-12: 完整端到端链路（代码→解析→清单→配置→生成→结果）
  // ─────────────────────────────────────────────────────────────
  test("TC-12 端到端全链路：代码解析 + 生图 API + Review 结果验证", async ({
    page,
  }) => {
    const apiCalls = await setupApiProxy(page);

    // === 阶段 1: 上传 fixture 目录 ===
    await uploadGameProject(page);
    await expect(page.getByText(/game\.js/i)).toBeVisible({ timeout: 5000 });

    // === 阶段 2: FileSelectStep → 确认选择 ===
    const confirmBtn = page.getByRole("button", { name: /开始\s*AI\s*解析/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // === 阶段 3: ScanStep → 触发 AI 解析 ===
    const scanBtn = page.getByRole("button", { name: "AI 解析" });
    await expect(scanBtn).toBeEnabled({ timeout: 5000 });
    await scanBtn.click();

    // 等待解析完成并自动跳到 ManifestStep（判断终态：只有 mani 加载后才出现此按钮）
    await expect(page.getByRole("button", { name: /配置\s*·/ })).toBeVisible({
      timeout: 30000,
    });

    // 验证两次 AI 扫码调用
    expect(apiCalls.scan1).toBe(1);
    expect(apiCalls.scan2).toBe(1);

    // === 阶段 4: ManifestStep → 进入 ConfigStep ===
    // mock manifest 有 4 项（bg×2 + boss×1 + weapon×1）
    await expect(page.getByRole("button", { name: /配置\s*·/ })).toBeVisible();
    await page.getByRole("button", { name: /配置\s*·/ }).click();
    await expect(page.getByText(/配置生成参数/i)).toBeVisible();

    // === 阶段 5: ConfigStep → 开始生成 ===
    const startBtn = page.getByRole("button", { name: /开始生成/i });
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // === 阶段 6: GenerateStep 显示进度 ===
    await expect(page.getByText(/生成中|生成完成/i).first()).toBeVisible({
      timeout: 10000,
    });

    // === 阶段 7: Review Step ===
    await expect(page.getByText(/生成结果/i)).toBeVisible({ timeout: 60000 });

    // 验证生图 API 调用次数 = mock manifest 中的 item 总数 (2+1+1=4)
    expect(apiCalls.image).toBe(4);

    // 验证成功数 > 0
    const successBadge = page.getByText(/\d+\s*成功/i).first();
    await expect(successBadge).toBeVisible();
    const successText = await successBadge.textContent();
    const count = parseInt(successText?.match(/\d+/)?.[0] ?? "0", 10);
    expect(count).toBe(4);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-13: 解析 AI 返回无效 JSON → ScanStep 展示错误状态
  // ─────────────────────────────────────────────────────────────
  test("TC-13 AI 解析返回无效 JSON → ScanStep 显示错误提示", async ({
    page,
  }) => {
    // 第一次 scan call （结构分析）正常，第二次（manifest）返回乱码
    await page.route("**/api-proxy", async (route) => {
      const req = route.request();
      const target = (req.headers()["x-proxy-target"] || "").toLowerCase();

      if (target.includes("chat/completions")) {
        let postBody = {};
        try {
          postBody = JSON.parse(req.postData() || "{}");
        } catch {
          /* ignore */
        }
        const systemContent = postBody.messages?.[0]?.content ?? "";

        if (systemContent.includes("游戏结构分析师")) {
          // Call 1 正常返回结构摘要
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              choices: [
                { message: { content: "3 levels, 2 bosses, 2 weapons" } },
              ],
            }),
          });
          return;
        }

        if (systemContent.includes("美术资源分析专家")) {
          // Call 2 返回非 JSON 内容（模拟模型输出乱码）
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              choices: [
                {
                  message: {
                    content: "这是一段无法解析为JSON的内容，仅有文字描述。",
                  },
                },
              ],
            }),
          });
          return;
        }
      }

      await route.abort("failed");
    });

    // 上传并触发解析
    await uploadGameProject(page);
    await expect(page.getByText(/game\.js/i)).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: /开始\s*AI\s*解析/i }).click();
    const scanBtn = page.getByRole("button", { name: "AI 解析" });
    await expect(scanBtn).toBeEnabled({ timeout: 5000 });
    await scanBtn.click();

    // 等待错误状态出现（ScanStep error 相位显示"解析失败"和"重试"按钮）
    await expect(page.getByText("解析失败")).toBeVisible({ timeout: 20000 });
    // "重试"按钮出现代表仍在 ScanStep
    await expect(page.getByRole("button", { name: "重试" })).toBeVisible();

    // 没有跳转到 ManifestStep（"配置 · N 张"按钮不应出现）
    await expect(
      page.getByRole("button", { name: /配置\s*·/ }),
    ).not.toBeVisible({ timeout: 3000 });
  });
});
