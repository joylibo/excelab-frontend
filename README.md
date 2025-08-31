# 手边工具箱 (Hand Toolbox)

一个现代化的Web应用，帮助用户处理日常文件操作，包括表格文件、PDF文件和图片文件。

## 🚀 项目概述

"手边工具箱"是一个基于React + TypeScript + Vite构建的前端工程，采用现代化的技术栈和UI设计，提供直观易用的文件处理功能。

## 🛠️ 技术栈

### 前端框架
- **React 19.1.1** - 现代化的React框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite 7.1.2** - 快速的构建工具，提供：
  - ⚡ 极速的冷启动和热模块替换（HMR）
  - 📦 开箱即用的TypeScript支持
  - 🎯 优化的生产构建
  - 🔧 丰富的插件生态系统
  - 🌐 原生ES模块支持

### UI组件库
- **shadcn/ui** - 基于Radix UI的现代化组件库
- **Tailwind CSS 3.4.17** - 实用的CSS框架
- **Tailwind CSS Animate** - 动画效果

### 核心依赖
- **Radix UI** 系列组件 (Checkbox, Label, Progress, Radio, Select, Tabs, Slot)
- **Lucide React** - 精美的图标库
- **React Dropzone** - 文件上传组件
- **Class Variance Authority** - 类名工具

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS处理工具
- **Autoprefixer** - CSS前缀自动添加

## 📁 项目结构

```
hand-toolbox/
├── public/                 # 静态资源
├── src/
│   ├── components/        # 组件目录
│   │   ├── docs/         # 文档处理组件
│   │   ├── images/       # 图片处理组件
│   │   ├── layout/       # 布局组件
│   │   ├── sections/     # 页面区块组件
│   │   ├── tables/       # 表格处理组件
│   │   └── ui/           # UI基础组件
│   ├── lib/              # 工具库
│   │   ├── api.ts        # API接口
│   │   ├── errorHandler.ts # 错误处理
│   │   ├── fileUtils.ts  # 文件工具
│   │   └── utils.ts      # 通用工具
│   ├── App.tsx           # 主应用组件
│   ├── index.css         # 全局样式
│   ├── main.tsx          # 应用入口
│   └── vite-env.d.ts     # Vite环境类型
├── package.json          # 项目配置
├── vite.config.ts        # Vite配置
├── tailwind.config.js    # Tailwind配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目说明
```

## 🎯 功能特性

### 手边表格
- **表格合并**: 合并多个表格文件，支持保留所有列或仅共同列
- **表格拆分**: 按指定列拆分表格文件
- **表格清理**: 删除空值行/列，清除多余空格
- **表格去重**: 按列去重，支持随机/最大/最小值选择

### 手边文档
- **PDF转图片**: 将PDF转换为JPEG或PNG格式图片
- **PDF合并**: 合并多个PDF文件，支持添加目录页和空白页

### 手边图片
- **图片格式转换**: 在JPEG和PNG格式之间转换图片

## 🚀 快速开始

### 🎯 Vite 构建工具
Vite 是本项目的核心构建工具，提供以下优势：

**开发体验**
- ⚡ **极速启动**: 基于原生ES模块，冷启动时间极短
- 🔥 **热模块替换**: 修改代码后立即生效，无需刷新页面
- 📦 **按需编译**: 只编译当前需要的模块，提升开发效率

**生产构建**
- 🎯 **优化打包**: 自动代码分割、Tree Shaking、资源压缩
- 🌐 **多种格式**: 支持ES模块、CommonJS、IIFE等多种输出格式
- 🔧 **插件丰富**: 强大的插件系统，支持各种功能扩展

### 环境要求
- Node.js 18+ 
- npm 或 yarn 包管理器

### 安装依赖
```bash
cd hand-toolbox
npm install
```

### 开发模式
```bash
npm run dev
```
应用将在 `http://localhost:5173` 启动

### 构建生产版本
```bash
npm run build
```
构建文件将输出到 `dist/` 目录

### 预览生产版本
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 🔧 部署说明

### 开发环境部署
1. 确保后端API服务运行在 `http://127.0.0.1:8000`
2. 运行 `npm run dev` 启动开发服务器
3. 访问 `http://localhost:5173`

### 生产环境部署
1. 运行 `npm run build` 构建项目
2. 将 `dist/` 目录部署到Web服务器（如Nginx, Apache等）
3. 配置服务器指向构建后的文件

### Docker部署（可选）
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📋 常用命令

### 开发相关
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行代码检查
npm run lint

# 安装新依赖
npm install <package-name>

# 安装开发依赖
npm install -D <package-name>
```

### Vite相关命令
```bash
# 开发服务器 - 启动Vite开发服务器，支持热重载
npm run dev

# 生产构建 - 使用Vite构建优化后的生产版本
npm run build

# 预览构建 - 本地预览生产构建结果
npm run preview

# 自定义端口 - 指定端口启动开发服务器
npm run dev -- --port 3000

# 自定义主机 - 指定主机启动开发服务器  
npm run dev -- --host 0.0.0.0
```

### 项目维护
```bash
# 清理node_modules并重新安装
rm -rf node_modules package-lock.json
npm install

# 更新所有依赖
npm update

# 检查过时依赖
npm outdated
```

## 🔌 API接口

项目需要后端API支持，接口文档可通过以下方式访问：
- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

### 环境配置
确保后端服务运行在正确的地址，API配置位于 `src/lib/api.ts`

## 🐛 故障排除

### 常见问题
1. **端口占用**: 如果5173端口被占用，Vite会自动选择其他端口
2. **依赖安装失败**: 尝试删除 `node_modules` 和 `package-lock.json` 后重新安装
3. **TypeScript错误**: 运行 `npm run lint` 检查代码问题

### 开发建议
- 使用VS Code配合ESLint和Prettier插件获得更好的开发体验
- 定期运行 `npm run lint` 保持代码质量
- 遵循TypeScript类型约束，避免any类型滥用

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件至项目维护者

---

**手边工具箱** - 让文件处理变得更简单！ ✨
