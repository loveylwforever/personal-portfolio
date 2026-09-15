# Gaojian Portfolio

Nuxt 4 个人作品集。包管理用 **npm**（随 Node 自带，不依赖 Corepack / pnpm）。

## 本地开发

需要 Node **24.x**（见 `.nvmrc`）：

```bash
nvm use
npm install
npm run dev
```

首页「GitHub 动态」热点图会请求 `/api/github-contributions`。本地可在项目根目录建 `.env`：

```bash
NUXT_GITHUB_TOKEN=ghp_xxx
# 或
GITHUB_TOKEN=ghp_xxx
```

Token 只需能读公开用户信息即可（classic 的 `read:user`，或 fine-grained 的只读）。

## 修改内容

文案与资料在 `data/profile.ts`（含 `githubUsername`）。

## 部署到 Vercel

导入仓库后选 Nuxt，默认 `npm run build` 即可。Vercel 会按 `package-lock.json` 使用 npm。

在 Project → Settings → Environment Variables 增加 `NUXT_GITHUB_TOKEN` 或 `GITHUB_TOKEN`，否则贡献图会显示占位提示。
