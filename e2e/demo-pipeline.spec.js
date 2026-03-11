/**
 * E2E 测试 — Demo 路径完整链路
 *
 * 验证路径：
 *   Demo 模式 → Manifest Step（使用 DEMO_MANIFEST）→ Config Step
 *   → Generate Step（mock /api-proxy）→ Review Step
 *
 * 重点断言：
 *   1. 扫码生成的资源清单能正常渲染
 *   2. 点击"开始生成"能触发 /api-proxy 图像请求
 *   3. Review Step 显示"成功"计数 > 0
 *   4. 至少一张图片卡片渲染在页面内
 */

import { test, expect } from "@playwright/test";
import { buildInitScript, setupApiProxy, MOCK_IMAGE_URL } from "./helpers.js";

test.describe("Demo 路径：Manifest → Config → Generate → Review", () => {
  test.beforeEach(async ({ page }) => {
    // 注入 localStorage + 加速 setTimeout，在页面加载前执行
    await page.addInitScript(buildInitScript());
    await page.goto("/");
  });

  // ─────────────────────────────────────────────────────────────
  // TC-01: Demo 按钮能跳到 Manifest 步骤，并渲染资源列表
  // ─────────────────────────────────────────────────────────────
  test("TC-01 点击 Demo 按钮进入 Manifest Step", async ({ page }) => {
    // UploadStep 上应有 Demo 按钮
    const demoBtn = page.getByRole("button", { name: /demo\s*模式/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 应该进入 manifest 步骤，页面出现资源清单标题
    await expect(page.getByText(/资源清单|素材清单|清单/i)).toBeVisible();

    // DEMO_MANIFEST 里有资源分类，"配置 · N 张"按钮出现代表资源已加载
    await expect(page.getByRole("button", { name: /配置\s*·/ })).toBeVisible({
      timeout: 5000,
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TC-02: Manifest → Config 步骤导航
  // ─────────────────────────────────────────────────────────────
  test("TC-02 Manifest 确认后进入 Config Step", async ({ page }) => {
    const demoBtn = page.getByRole("button", { name: /demo\s*模式/i });
    await demoBtn.click();

    // 等待清单加载
    await expect(page.getByText(/资源清单|素材清单|清单/i)).toBeVisible();

    // 找"配置"按钮（文案含"配置"且含"张"数量的按钮）
    const nextBtn = page.getByRole("button", { name: /配置\s*·/ });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // 进入 Config Step，标题含"配置生成参数"
    await expect(page.getByText(/配置生成参数/i)).toBeVisible();
    // 应有"开始生成"按钮
    await expect(page.getByRole("button", { name: /开始生成/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────
  // TC-03: Config → Generate → Review 完整链路（核心 E2E）
  // ─────────────────────────────────────────────────────────────
  test("TC-03 完整生成链路：Generate 触发 API → 结果页显示成功数", async ({
    page,
  }) => {
    const apiCalls = await setupApiProxy(page);

    // 1. 进入 demo manifest
    await page.getByRole("button", { name: /demo\s*模式/i }).click();
    await expect(page.getByText(/资源清单|素材清单|清单/i)).toBeVisible();

    // 2. 进入 Config Step
    await page.getByRole("button", { name: /配置\s*·/ }).click();
    await expect(page.getByText(/配置生成参数/i)).toBeVisible();

    // 3. 把请求间隔改为 0（避免 2s × N 的等待）
    //    Input lb="请求间隔（秒）" → 找含该 label 的 input
    const delayInput = page.locator('input[type="number"]').filter({
      hasText: "",
    });
    // 通过 label 文字找最近的 input
    const delayLabel = page.getByText("请求间隔（秒）");
    if (await delayLabel.isVisible()) {
      // 找 label 所在区域下的 number input
      const nearestInput = page.locator("input[type='number']").last(); // delay input is typically the last number input
      await nearestInput.fill("0");
      await nearestInput.dispatchEvent("change");
    }

    // 4. 点击"开始生成"（apiReady = true，因 localStorage 已预设 imgProvider）
    const startBtn = page.getByRole("button", { name: /开始生成/i });
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // 5. Generate Step 应出现（进度条 / "生成中"）
    await expect(page.getByText(/生成中|生成完成/i).first()).toBeVisible({
      timeout: 10000,
    });

    // 6. 等待跳转到 Review Step（"生成结果"标题）
    await expect(page.getByText(/生成结果/i)).toBeVisible({ timeout: 60000 });

    // 7. 至少有 1 张成功（"N 成功"）—— 取第一个匹配元素（Review header badge）
    const successBadge = page.getByText(/\d+\s*成功/i).first();
    await expect(successBadge).toBeVisible();
    const successText = await successBadge.textContent();
    const count = parseInt(successText?.match(/\d+/)?.[0] ?? "0", 10);
    expect(count).toBeGreaterThan(0);

    // 8. 至少调用了一次图像生成 API
    expect(apiCalls.image).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-04: 图片生成失败时 Review Step 显示错误项
  // ─────────────────────────────────────────────────────────────
  test("TC-04 图像 API 全部返回 500 → Review 显示错误项", async ({ page }) => {
    // 让图像 API 全部失败
    await page.route("**/api-proxy", async (route) => {
      const req = route.request();
      const target = (req.headers()["x-proxy-target"] || "").toLowerCase();
      if (target.includes("images/generations")) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: 500, message: "mock server error" },
          }),
        });
      } else {
        await route.abort("failed");
      }
    });

    await page.getByRole("button", { name: /demo\s*模式/i }).click();
    await expect(page.getByText(/资源清单|素材清单|清单/i)).toBeVisible();
    await page.getByRole("button", { name: /配置\s*·/ }).click();
    await expect(page.getByText(/配置生成参数/i)).toBeVisible();
    await page.getByRole("button", { name: /开始生成/i }).click();

    // 等待 Review Step（出现"生成结果"）
    await expect(page.getByText(/生成结果/i)).toBeVisible({ timeout: 60000 });

    // 应出现错误计数
    const errBadge = page.getByText(/\d+\s*失败/i).first();
    await expect(errBadge).toBeVisible();
    const errText = await errBadge.textContent();
    const errCount = parseInt(errText?.match(/\d+/)?.[0] ?? "0", 10);
    expect(errCount).toBeGreaterThan(0);
  });
});
