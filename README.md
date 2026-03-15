# AI UI Runtime

一个面向浏览器扩展的开源 MVP，用来验证这条链路：

`真实网页交互 -> 结构化 UI Intent / 手动修改要求 -> 复制给 AI`

当前版本不直接改源代码，也不直接接入 Claude、Codex、Cursor 或 MCP。它解决的是更靠前的一步：让用户在真实网页里选中 UI、做视觉调整，或者直接写出修改要求，然后把足够准确的上下文复制给 AI。

[English README](./README.en.md)  
[产品路线图](./ROADMAP.md)

## 这个项目解决什么问题

传统“把截图发给 AI”有两个明显问题：

- AI 很难准确知道你改的是哪个真实组件。
- AI 很难判断应该改当前节点、父级容器，还是更高一层布局。

AI UI Runtime 的思路是先把用户在页面里的动作和定位线索结构化，再把这些上下文交给 AI：

- 选中目标组件
- 拖动位置或调整尺寸
- 或者直接输入文字修改要求
- 复制更完整、更可执行的 AI prompt

## 当前能力

- Chrome Extension Manifest V3
- 默认静默，只有显式启用当前页调试后才接管交互
- 页面内 overlay 控制面板
- `位置` 模式：选中并拖动元素，支持 `Ctrl / Cmd + 点击` 多选后整体移动
- `尺寸` 模式：单选元素做缩放预览
- `描述` 模式：选中目标后直接写修改要求
- 输出结构化 intent
- 输出面向 AI 的主 prompt
- 中英文界面

## 当前边界

- 不自动修改业务源代码
- 不自动发送给 Claude / Codex / Cursor
- 不做 patch apply
- 不做 IDE 插件
- 不做真实持久化布局改写

所以当前看到的移动和缩放都是视觉预览，目标是验证“更好的 AI 输入”，不是直接把网页改掉。

## 项目结构

```text
ai-ui-runtime/
├─ apps/
│  └─ demo-app/
├─ packages/
│  ├─ browser-extension/
│  ├─ intent-engine/
│  ├─ shared/
│  └─ ui-runtime/
├─ docs/
│  └─ media/
├─ ROADMAP.md
├─ README.en.md
└─ README.md
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 demo 页面

```bash
pnpm dev:demo
```

默认地址：

```text
http://localhost:5173
```

这个 demo 只是一个本地验证页。扩展本身不是 `localhost` 专用，可以工作在普通 `http://`、`https://` 或 `file://` 页面上。

### 3. 构建扩展

```bash
pnpm build:extension
```

扩展产物目录：

```text
packages/browser-extension/dist
```

### 4. 加载扩展

1. 打开 `chrome://extensions`
2. 开启右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择 `packages/browser-extension/dist`

## 使用方式

### 调试开关

扩展安装后默认静默：

- 不显示高亮
- 不拦截鼠标
- 不影响网页

只有在 popup 里点击“启用当前页调试”之后，页面右上角才会出现 overlay。

### 三个核心模式

- `位置`
  直接选中元素并拖动，做位置预览。支持多选后整体移动。
- `尺寸`
  对单个选中元素做缩放预览。
- `描述`
  继续选中目标，并直接输入“我希望怎么改”。

### 复制给 AI

主按钮只有一个：

- `复制给 AI`

它会自动组合以下内容：

- 当前目标组件的定位线索
- 层级线索
- 最近一次视觉 intent
- 用户在“描述”里手写的修改要求

## 为什么它比普通 prompt 更有价值

当前复制给 AI 的上下文不只包含 tag / class，还会尽量补更多定位信息：

- selector hint
- DOM path
- 父级容器签名
- 语义层级
- 祖先链路
- 最近标题
- 地标容器
- 同级位置
- 子节点数量
- 常见测试属性与 data 属性

这些线索的目的不是让 AI 改运行时组件 ID，而是帮助它判断真实源码里应该改哪一层布局。

## 推荐演示路径

### 路径 A：位置调整

1. 启用当前页调试
2. 选中一个卡片或容器
3. 在 `位置` 模式下拖动
4. 点击 `复制给 AI`

### 路径 B：尺寸调整

1. 启用当前页调试
2. 选中一个信息面板
3. 切到 `尺寸`
4. 拖动边缘或角点
5. 点击 `复制给 AI`

### 路径 C：纯文字修改

1. 启用当前页调试
2. 切到 `描述`
3. 选中一个目标区域
4. 输入修改要求
5. 点击 `复制给 AI`

## 开发命令

```bash
pnpm dev
```

同时启动 demo 和扩展 watch 构建。

```bash
pnpm dev:demo
```

只启动 demo。

```bash
pnpm dev:extension
```

只启动扩展 watch 构建。

```bash
pnpm build
```

构建整个 workspace。

```bash
pnpm typecheck
```

执行类型检查。

## 演示素材

录屏和截图会补充到 [docs/media/README.md](./docs/media/README.md) 提到的目录中。当前仓库已经预留了素材目录，但示例 GIF / 截图由后续录制补充。

## 开源协作

- 英文说明见 [README.en.md](./README.en.md)
- 路线规划见 [ROADMAP.md](./ROADMAP.md)
- Issue / PR 模板已放在 `.github/`

## 已知限制

- 多选移动已支持，但多选缩放暂不支持
- 视觉预览不会持久写回网页
- 复杂网页上仍可能选中过细节点，因此当前有“提升到更稳定容器”的启发式逻辑，但不是 100% 精准
- 当前产品仍然是“更好的 AI 输入”，不是自动 patch 系统

## License

`MIT`
