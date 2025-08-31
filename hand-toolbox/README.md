# 手边工具箱 - 前端工程

这是一个基于React + TypeScript + Vite + shadcn/ui的文件处理工具箱前端应用。

## 功能特性

### 📊 表格处理
- **表格合并**: 合并多个Excel/CSV文件
- **表格拆分**: 按条件拆分表格数据
- **表格清理**: 清理空值、格式化数据
- **表格去重**: 去除重复数据行

### 📄 文档处理
- **PDF转图片**: 将PDF转换为图片格式
- **PDF合并**: 合并多个PDF文档

### 🖼️ 图片处理
- **图片格式转换**: 支持PNG, JPG, WebP, BMP, TIFF格式转换

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: shadcn/ui + Tailwind CSS
- **图标**: Lucide React
- **HTTP客户端**: Fetch API

## 项目结构

```
hand-toolbox/
├── src/
│   ├── components/
│   │   ├── layout/          # 布局组件
│   │   ├── tables/          # 表格处理组件
│   │   ├── docs/            # 文档处理组件
│   │   ├── images/          # 图片处理组件
│   │   ├── sections/        # 页面区块组件
│   │   └── ui/              # shadcn/ui组件
│   ├── lib/                 # 工具函数
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── package.json
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
├── tsconfig.json           # TypeScript配置
└── components.json         # shadcn/ui配置
```

## 安装和运行

### 前置要求
- Node.js 16+ 
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 后端服务要求

前端应用需要后端API服务支持，后端服务应该运行在 http://127.0.0.1:8000

### 预期的API端点

```
POST /api/table/merge          # 表格合并
POST /api/table/split          # 表格拆分  
POST /api/table/clean          # 表格清理
POST /api/table/deduplicate    # 表格去重
POST /api/pdf/to-images        # PDF转图片
POST /api/pdf/merge            # PDF合并
POST /api/image/convert        # 图片格式转换
```

### 启动后端服务
确保后端项目已经设置并运行：
```bash
cd /path/to/backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 功能说明

### 表格处理功能
- 支持Excel和CSV文件格式
- 实时进度显示
- 错误处理和用户反馈
- 文件大小和格式验证

### 文档处理功能  
- PDF文件上传和验证
- 批量处理支持
- 压缩包下载

### 图片处理功能
- 多种图片格式支持
- 格式转换预览
- 批量处理能力

## 开发说明

### 添加新组件
1. 在相应的组件目录创建新组件
2. 导出组件并在对应的Section中引入
3. 确保TypeScript类型定义正确

### 样式规范
- 使用Tailwind CSS进行样式设计
- 遵循shadcn/ui的设计规范
- 响应式设计支持移动端

### API集成
- 使用Fetch API进行HTTP请求
- 统一的错误处理机制
- 文件上传使用FormData格式

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

- GitHub: [hand-toolbox](https://github.com/hand-toolbox)
- Email: support@hand-toolbox.com
- Website: hand-toolbox.com
