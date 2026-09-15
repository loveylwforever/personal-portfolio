# Gaojian Portfolio

Nuxt 4 个人作品集。包管理用 **npm**（随 Node 自带，不依赖 Corepack / pnpm）。

## 本地开发

需要 Node **24.x**（见 `.nvmrc`）：

```bash
nvm use
npm install
npm run dev
```

## 修改内容

文案与资料在 `data/profile.ts`。

## 部署到 Vercel

导入仓库后选 Nuxt，默认 `npm run build` 即可。Vercel 会按 `package-lock.json` 使用 npm。
