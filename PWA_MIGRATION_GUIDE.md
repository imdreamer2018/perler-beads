# PWA 迁移指南

## 当前问题
- `next-pwa` 包已过时，不支持 Next.js 16 的 Turbopack
- 当前使用 `--webpack` 标志作为临时解决方案

## 推荐方案：迁移到 @ducanh2912/next-pwa

### 步骤 1：卸载旧包，安装新包

```bash
pnpm remove next-pwa
pnpm add -D @ducanh2912/next-pwa
```

### 步骤 2：更新 next.config.ts

```typescript
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
})(nextConfig);
```

### 步骤 3：恢复 dev 脚本

在 package.json 中移除 `--webpack` 标志：

```json
"dev": "next dev"
```

### 步骤 4：测试

```bash
pnpm dev
pnpm build
```

---

## 备选方案：使用 Vite PWA Plugin

如果未来考虑迁移到 Vite 构建系统，可以使用 `vite-plugin-pwa`。

---

## 参考链接

- [@ducanh2912/next-pwa](https://www.npmjs.com/package/@ducanh2912/next-pwa)
- [Next.js 16 Turbopack 文档](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)

