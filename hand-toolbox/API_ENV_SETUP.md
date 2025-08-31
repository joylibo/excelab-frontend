# API 环境配置说明

## 概述

本项目现在支持自动根据不同的运行环境选择正确的 API 地址：

- **开发环境** (`npm run dev`): 使用 `http://127.0.0.1:8000`
- **预览环境** (`npm run preview`): 使用 `https://api.playharder.online`
- **生产环境** (`npm run build`): 使用 `https://api.playharder.online`

## 配置详情

### 自动环境检测

在 `src/lib/api.ts` 中，我们使用了以下逻辑：

```typescript
export const API_BASE_URL = (() => {
  // 开发环境：使用 npm run dev 启动
  if (import.meta.env.DEV) {
    console.log('🚀 开发环境：使用本地API地址 http://127.0.0.1:8000');
    return 'http://127.0.0.1:8000';
  }
  // 预览环境：使用 npm run preview 启动
  if (import.meta.env.MODE === 'preview') {
    console.log('🌐 预览环境：使用生产API地址 https://api.playharder.online');
    return 'https://api.playharder.online';
  }
  // 生产环境：使用 npm run build 构建后部署
  console.log('🌐 生产环境：使用生产API地址 https://api.playharder.online');
  return 'https://api.playharder.online';
})();
```

### Vite 环境变量

Vite 会自动设置以下环境变量：

- `import.meta.env.DEV`: 在开发模式下为 `true`
- `import.meta.env.MODE`: 当前运行模式
  - `development`: 开发模式 (`npm run dev`)
  - `preview`: 预览模式 (`npm run preview`)
  - `production`: 生产模式 (`npm run build`)

## 使用方法

### 1. 开发环境

```bash
npm run dev
```

控制台会显示：`🚀 开发环境：使用本地API地址 http://127.0.0.1:8000`

### 2. 预览环境

```bash
npm run build
npm run preview
```

控制台会显示：`🌐 预览环境：使用生产API地址 https://api.playharder.online`

### 3. 生产环境

```bash
npm run build
# 部署构建后的文件到服务器
```

控制台会显示：`🌐 生产环境：使用生产API地址 https://api.playharder.online`

## 调试信息

我们还导出了环境信息用于调试：

```typescript
import { ENV_INFO } from '@/lib/api';

console.log('环境信息:', ENV_INFO);
// 输出: { isDev: true, mode: 'development', baseUrl: 'http://127.0.0.1:8000' }
```

## 注意事项

1. **确保后端服务运行**：在开发环境中，确保本地后端服务在 `http://127.0.0.1:8000` 运行
2. **CORS 配置**：生产环境 API 需要正确配置 CORS 以允许前端访问
3. **HTTPS**：生产环境使用 HTTPS，确保 SSL 证书配置正确

## 验证测试

我们提供了一个测试脚本来验证环境配置：

```bash
node test-env.js
```

这个脚本会模拟不同的环境变量并验证 API 地址选择逻辑是否正确。
