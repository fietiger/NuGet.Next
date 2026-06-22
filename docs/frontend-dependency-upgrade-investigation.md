# 前端依赖升级工作量调查报告

调查日期：2026-06-22

## 1. 背景

本次调查源于本地调试前端时出现的 Vite import-analysis 报错：

```text
Failed to resolve import "@ant-design/icons"
```

继续排查后发现，前端源码中已经使用了若干运行时依赖，但 `web/package.json` 没有完整声明。补齐依赖后，又出现了部分包的 peer dependency 不匹配问题，例如：

```text
react-layout-kit 2.x 需要 react >= 19
antd-style 4.x 需要 antd >= 6
```

当前项目主栈仍是 React 18 + Ant Design 5。因此，本报告用于评估是否应该升级到最新稳定主版本，以及对应工作量和风险。

## 2. 当前依赖基线

当前前端位于 `web` 目录，核心依赖基线如下：

| 分类 | 当前版本/约束 | 备注 |
| --- | --- | --- |
| React | 18.3.1 | 当前项目运行主栈 |
| React DOM | 18.3.1 | 与 React 保持一致 |
| Ant Design | 5.x | 当前代码按 Antd 5 使用 |
| @ant-design/icons | 6.x | 已补充缺失依赖 |
| antd-style | 3.7.1 | 与 Antd 5 / React 18 匹配 |
| react-layout-kit | 1.9.2 | 与 React 18 匹配 |
| Vite | 5.4.x | 当前构建工具 |
| TypeScript | 5.6.x | 当前类型检查工具 |
| React Router | 6.x | 当前路由主版本 |
| Zustand | 5.x | 当前状态管理主版本 |

另有一个需要清理的问题：`web/package.json` 中存在 `"node"` 运行时依赖。Node.js 应作为本机/CI 运行环境管理，不建议放在前端应用的 `dependencies` 中。这个依赖会导致安装时出现类似下面的警告：

```text
Failed to create bin ... node.EXE
```

## 3. 调查命令和结果

已执行的关键命令：

```powershell
pnpm add @ant-design/icons lucide-react react-layout-kit antd-style url-join query-string
pnpm add react-layout-kit@1 antd-style@3
pnpm outdated
pnpm build
```

`pnpm outdated` 显示，如果追到当前 npm latest，会涉及以下主版本跃迁：

| 包 | 当前安装版本 | latest | 影响 |
| --- | --- | --- | --- |
| react | 18.3.1 | 19.x | React 主版本升级 |
| react-dom | 18.3.1 | 19.x | 与 React 绑定升级 |
| antd | 5.x | 6.x | UI 组件库主版本升级 |
| antd-style | 3.x | 4.x | 依赖 Antd 6 |
| react-layout-kit | 1.x | 2.x | 依赖 React 19 |
| @lobehub/ui | 1.x | 5.x | UI 组件封装跨多个主版本 |
| react-router-dom | 6.x | 7.x | 路由主版本升级 |
| vite | 5.x | 8.x | 构建工具主版本升级 |
| typescript | 5.6.x | 6.x | 类型系统升级 |
| eslint | 9.x | 10.x | lint 工具主版本升级 |

当前 `pnpm build` 已经不再报缺失依赖类错误，但仍存在 3 个类型问题：

```text
CreateUser.tsx / UpdateUser.tsx: @lobehub/ui Modal 不支持 onClose 属性
createDevtools.ts: zustand devtools 类型不匹配
```

这些属于当前基线下的类型修复，不属于大版本迁移问题。

## 4. 升级路线评估

### 方案 A：稳定当前 React 18 / Antd 5 栈

目标：

- 保持 React 18、Antd 5、Vite 5。
- 保持 `antd-style@3`、`react-layout-kit@1`。
- 删除 `node` 运行时依赖。
- 修复当前 3 个 TypeScript 构建错误。
- 确保 `pnpm build`、`pnpm dev` 正常。

预计工作量：0.5-1 天。

风险：低。

适用场景：当前目标是尽快恢复本地调试、打包和功能验证。

### 方案 B：在当前主版本内更新到兼容的最新补丁/小版本

目标：

- 仍保持 React 18、Antd 5、React Router 6、Vite 5。
- 只更新同主版本内的 patch/minor。
- 锁定与 React 18 / Antd 5 兼容的周边依赖。

预计工作量：1 天左右。

风险：中低。

适用场景：希望减少已知 bug 和安全风险，但暂不承担主版本迁移成本。

### 方案 C：升级到当前 npm latest 主版本栈

目标：

- React 18 -> React 19。
- Antd 5 -> Antd 6。
- @lobehub/ui 1 -> 5。
- react-layout-kit 1 -> 2。
- antd-style 3 -> 4。
- React Router 6 -> 7。
- Vite 5 -> 8。
- TypeScript 5 -> 6。
- ESLint 9 -> 10。

预计工作量：3-5 天。

风险：中高。

主要风险：

- `@lobehub/ui` 跨多个主版本，Modal、Menu、Snippet、Icon 等组件 API 可能变化。
- Antd 6 可能带来样式、主题 token、表单、弹窗、上传组件行为变化。
- React 19 对渲染行为、类型声明和部分第三方库兼容性有影响。
- React Router 7 可能影响路由配置和导航 hook。
- TypeScript 6 可能暴露更多类型问题。
- Vite 8 可能影响插件、构建输出、dev server 行为。

适用场景：计划进行前端技术栈专项升级，并能安排完整回归测试。

## 5. 推荐结论

不建议当前直接追 `latest`。

建议先执行方案 A，把当前 React 18 / Antd 5 栈稳定下来，形成可构建、可调试、可回归的基线。完成后再单独创建升级分支，按方案 C 评估 React 19 / Antd 6 / Vite 8 迁移。

推荐近期执行顺序：

1. 删除 `web/package.json` 中的 `node` 依赖。
2. 保持 `antd-style@3`、`react-layout-kit@1`。
3. 修复 `CreateUser.tsx`、`UpdateUser.tsx` 的 Modal 属性问题。
4. 修复 `createDevtools.ts` 的 Zustand devtools 类型问题。
5. 运行 `pnpm build`，确保当前基线通过。
6. 手工回归登录、修改密码、用户管理、包管理、上传、Key 管理、下载 `NuGet.config`。
7. 另起分支进行 React 19 / Antd 6 等主版本升级预研。

## 6. 验收标准

方案 A 的完成标准：

- `pnpm install` 无 peer dependency 警告。
- `pnpm dev` 可正常启动。
- `pnpm build` 通过。
- 登录、修改密码、Key 管理、下载 `NuGet.config` 可用。
- 包列表、包详情、上传、下载、后台用户管理可用。
- `web/package.json` 不再声明 `node` 运行时依赖。

方案 C 的完成标准：

- 所有前端依赖升级到目标主版本并通过 peer dependency 检查。
- `pnpm build` 和 `pnpm lint` 通过。
- 关键页面完成视觉和交互回归。
- 与后端 API 的代理、鉴权、下载链路正常。
- 记录所有破坏性变更和对应代码调整。

## 7. 参考依据

- 本仓库 `web/package.json` 和 `web/pnpm-lock.yaml`。
- `pnpm outdated` 在 2026-06-22 的输出。
- `pnpm build` 在 2026-06-22 的输出。
- Node.js 官方发布计划：<https://raw.githubusercontent.com/nodejs/Release/main/schedule.json>
