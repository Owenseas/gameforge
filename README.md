<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="6" width="20" height="12" rx="3"/>
  <path d="M12 12h.01M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M16 10v4M14 12h4"/>
</svg>

# GameForge

**游戏代码 → AI 解析 → 批量生图 · 一键导出**

把你的游戏源码当作需求文档，让 AI 自动提取美术资源清单，再调用图像生成 API 批量产出所有素材。

[![License](https://img.shields.io/badge/license-MIT-00E5FF?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)

</div>

---

## 目录

- [功能概览](#功能概览)
- [工作流程](#工作流程)
- [快速开始](#快速开始)
- [配置供应商](#配置供应商)
- [支持的平台与格式](#支持的平台与格式)
- [资产类型](#资产类型)
- [美术风格](#美术风格)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [本地代理机制](#本地代理机制)
- [开发与测试](#开发与测试)
- [许可证](#许可证)

---

## 功能概览

<table>
<tr>
<td width="50%">

**<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> AI 两阶段代码解析**

上传游戏项目文件夹，AI 先分析整体结构（章节 / 关卡 / BOSS / 武器），再生成完整美术资源清单（JSON Manifest），无需手动整理需求。

</td>
<td width="50%">

**<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> 可编辑资源清单**

AI 生成的 Manifest 完全可手动调整：增删资产分类、修改每张图的英文提示词（prompt）、勾选 / 取消单张图，精确控制生图范围。

</td>
</tr>
<tr>
<td width="50%">

**<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg> 批量生图 + 自动重试**

按队列逐张生成，实时显示进度与当前处理的资产名称。失败的图片可一键重试，成功结果保留不重复生成。

</td>
<td width="50%">

**<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> 一键批量导出**

结果页按资产分类展示所有生成图，支持单张下载或全部导出，自动以 `资产名_子项名.ext` 命名文件。

</td>
</tr>
<tr>
<td width="50%">

**<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> 多供应商管理**

在设置面板中添加任意数量的 OpenAI 兼容供应商（扫描 / 图像分开选），支持一键测试连通性并自动同步模型列表。

</td>
<td width="50%">

**<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> CORS 安全代理**

所有 API 调用经由 Vite 本地 Node.js 中间件中转（`/api-proxy`），API Key 不暴露于浏览器网络请求，同时彻底规避跨域限制。

</td>
</tr>
</table>

---

## 工作流程

```
上传项目文件夹
      │
      ▼
 选择分析文件          ← 自动优先选取 game.js / level / boss 等关键文件
      │
      ▼
  AI 两段解析
  ├─ Call 1: 结构分析  ← 章节 / 关卡 / BOSS / 武器 摘要（纯文字）
  └─ Call 2: 清单生成  ← 输出标准 JSON Manifest
      │
      ▼
  检查 & 编辑清单      ← 增删资产、修改 prompt、勾选生成范围
      │
      ▼
  配置生成参数         ← 选择风格、分辨率、图像供应商、请求间隔
      │
      ▼
  批量生成图像         ← 顺序调用图像 API，实时展示进度
      │
      ▼
  查看 & 导出结果      ← 按分类浏览、单张 / 全部下载
```

---

## 快速开始

### 前置要求

- Node.js **18+**
- 至少一个兼容 OpenAI API 格式的供应商 API Key（扫描用），以及 Seedream / 其他图像生成供应商 Key

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/Owenseas/gameforge.git
cd gameforge

# 安装依赖
npm install

# 启动开发服务器（含本地 API 代理）
npm run dev
```

浏览器访问 `http://localhost:5173`

### 生产构建

```bash
# 构建
npm run build

# 本地预览构建产物（代理同样生效）
npm run preview
```

> **注意：** 必须使用 `vite preview` 或 `vite dev` 启动，不能直接打开 `dist/index.html`，否则本地代理无法工作，API 请求会被 CORS 拦截。

---

## 配置供应商

点击页面右上角 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> **设置** 按钮，进入供应商管理面板：

### 步骤

1. **添加供应商** — 点击「添加供应商」，选择预设（智谱 AI / 火山方舟 / OpenAI）或手动填写 Base URL
2. **填写 API Key** — 粘贴供应商后台获取的 Secret Key
3. **同步模型** — 点击「同步模型」自动拉取可用模型列表（支持手动备选已知模型）
4. **测试连通** — 点击「测试」验证配置是否正确
5. **分配用途** — 在「扫描供应商」和「图像供应商」下拉框中分别选择已配置的供应商

### 内置预设

| 供应商 | 推荐用途 | 免费配额 |
|--------|----------|----------|
| **智谱 AI** | 代码扫描 / 结构分析 | GLM-4.7-Flash 有免费额度 |
| **火山方舟** | 代码扫描 + Seedream 生图 | 按量付费 |
| **OpenAI** | 代码扫描 | 按量付费 |

> 扫描供应商需支持 `POST /chat/completions`；图像供应商需支持 `POST /images/generations`（OpenAI Images 格式）。

---

## 支持的平台与格式

### 游戏平台

| 平台 | 自动识别特征 |
|------|-------------|
| 抖音小游戏 | `game.js` |
| 微信小游戏 | `project.config.json` |
| Android | `AndroidManifest.xml` |
| Web | 默认 |

### 支持解析的文件类型

`.js` `.ts` `.kt` `.java` `.json` `.html` `.xml`

文件会按优先级排序，优先读取包含 `level` `boss` `weapon` `asset` `scene` 等关键词的文件（最多取前 15 个），每文件截取前 8000 字符送入 AI。

---

## 资产类型

生成的 Manifest 中每个资产分类（Asset Group）包含若干子项（Item），每张图独立生成。

| 类型 | 说明 | 典型用例 |
|------|------|----------|
| `background` | 关卡背景 | 场景全图、章节背景 |
| `prop` | 道具 / 角色 | NPC、BOSS、可交互物品 |
| `target` | 目标物体 | 敌人、靶心、收集品 |
| `weapon` | 武器 | 剑、枪、法杖、弓 |
| `effect` | 特效 | 爆炸、魔法、粒子效果 |
| `ui` | UI 元素 | 按钮、血条、菜单背景 |

`transparent` 字段为 `true` 时，生图 prompt 自动追加 `transparent bg`。

---

## 美术风格

在配置步骤选择预设风格，或在「自定义风格」输入框描述你的风格（支持 AI 自动生成英文 prompt）：

| 风格 | Prompt 后缀 |
|------|-------------|
| 暗调风格化 | `dark moody game art, high contrast` |
| 卡通 Q 版 | `cute cartoon, bright colors` |
| 像素复古 | `pixel art, 8-bit retro` |
| 扁平现代 | `flat vector, clean` |
| 赛博朋克 | `cyberpunk neon, high-tech` |
| 自定义 | 任意描述，可用「AI 生成提示词」功能转为英文 |

---

## 项目结构

```
gameforge/
├── index.html
├── vite.config.js          # Vite 配置 + 本地 API 代理中间件
├── playwright.config.js    # E2E 测试配置
├── src/
│   ├── App.jsx             # 全局状态管理 + 步骤路由
│   ├── main.jsx
│   ├── components/
│   │   ├── SettingsPanel.jsx   # 供应商管理面板
│   │   ├── SeedreamParams.jsx  # Seedream 图像参数面板
│   │   └── ui/                 # 基础 UI 组件库
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Icon.jsx        # 内联 SVG 图标系统
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── Spinner.jsx
│   │       └── Toggle.jsx
│   ├── constants/
│   │   ├── config.js       # 平台、风格、资产类型、步骤、Demo 数据
│   │   ├── generators.js   # 各图像供应商的 build/parse/auth 适配器
│   │   └── priority.js     # 文件优先级关键词列表
│   ├── steps/              # 七步流程各步骤组件
│   │   ├── UploadStep.jsx
│   │   ├── FileSelectStep.jsx
│   │   ├── ScanStep.jsx
│   │   ├── ManifestStep.jsx
│   │   ├── ConfigStep.jsx
│   │   ├── GenerateStep.jsx
│   │   └── ReviewStep.jsx
│   ├── styles/
│   │   └── global.js       # CSS 变量与全局样式（注入到 <head>）
│   └── utils/
│       └── proxyFetch.js   # 封装 /api-proxy 代理请求
└── e2e/                    # Playwright E2E 测试
    ├── demo-pipeline.spec.js   # Demo 模式完整链路
    ├── scan-pipeline.spec.js   # 上传→解析→生图完整链路
    ├── helpers.js              # 共享辅助（mock provider、路由拦截）
    └── fixtures/
        └── game-project/       # 测试用 fixture 游戏项目
```

---

## 技术栈

| 层 | 技术 |
|----|------|
| UI 框架 | React 18 |
| 构建工具 | Vite 6 |
| 图标 | 内联 SVG（无外部依赖） |
| 样式 | CSS 变量 + 内联样式（无 CSS 框架） |
| API 代理 | Vite 自定义插件（Node.js `fetch`） |
| E2E 测试 | Playwright |
| 包管理 | npm |

无 Redux、无路由库、无 CSS 框架 — 保持零额外依赖，便于任意环境部署。

---

## 本地代理机制

浏览器直接调用第三方 AI API 会遭遇 CORS 跨域拦截。GameForge 通过 Vite 插件在本地起一个轻量代理：

```
浏览器
  │  POST /api-proxy
  │  Header: x-proxy-target: https://api.example.com/v1/chat/completions
  ▼
Vite Dev Server (Node.js)
  │  转发请求（携带 Authorization、Content-Type）
  ▼
第三方 AI API
```

- **API Key 安全**：Key 由前端传入请求头，Node.js 转发且不记录，不落盘
- **`vite preview` 同样支持**：代理在 `configurePreviewServer` 钩子中注册，生产预览模式完全可用

---

## 开发与测试

### 运行 E2E 测试

```bash
# 无头模式运行全部测试
npm run test:e2e

# 交互式 UI 模式（方便调试）
npm run test:e2e:ui

# 单步调试模式
npm run test:e2e:debug
```

测试覆盖：
- **Demo 路径**：Demo 模式 → Manifest → Config → Generate → Review
- **完整链路**：文件上传 → AI 两段解析 → Manifest → Config → Generate → Review

所有 AI API 和图像 API 调用均通过 Playwright 路由拦截 mock，测试不消耗真实 API 额度。

---

## 许可证

[MIT](LICENSE) © 2026 GameForge Contributors
