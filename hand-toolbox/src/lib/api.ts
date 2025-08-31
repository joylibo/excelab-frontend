// API配置中心 - 统一管理所有API端点
// 根据环境自动选择API地址
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

// 导出当前环境信息用于调试
export const ENV_INFO = {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  baseUrl: API_BASE_URL
};

// 表格处理API
export const TABLE_API = {
  MERGE: '/api/merge',
  MERGE_PREVIEW: '/api/merge/preview',
  SPLIT: '/api/split', 
  SPLIT_COLUMNS: '/api/split/columns',
  CLEAN: '/api/clean',
  CLEAN_PREVIEW: '/api/clean/preview',
  DEDUPLICATE: '/api/deduplicate',
  DEDUPLICATE_PREVIEW: '/api/deduplicate/preview',
  DEDUPLICATE_DOWNLOAD: '/api/deduplicate/download'
};

// 文档处理API  
export const DOCS_API = {
  PDF_TO_IMAGES: '/api/pdf-to-images',
  PDF_MERGE: '/api/pdfmerge',
  PDF_MERGE_PREVIEW: '/api/pdfmerge/preview'
};

// 图片处理API
export const IMAGE_API = {
  CONVERT: '/api/image_convert'
};

// 其他API
export const OTHER_API = {
  HEART_CLICK: '/api/heart-click',
  HEART_STATS: '/api/heart-stats'
};

// 统一的错误处理函数
export const handleApiError = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json().catch(() => ({}));
    const errorDetail = errorData.detail || `请求失败 (HTTP ${response.status})`;
    
    // 处理文件大小错误信息（从后端返回的英文错误信息）
    if (typeof errorDetail === 'string') {
      // 检查是否是文件大小错误
      const fileSizeMatch = errorDetail.match(/File is larger than (\d+) bytes/);
      if (fileSizeMatch) {
        const bytes = parseInt(fileSizeMatch[1]);
        const mb = Math.round(bytes / 1024 / 1024);
        
        // 根据当前语言环境返回相应的错误信息
        const language = localStorage.getItem('language') || navigator.language;
        if (language.startsWith('zh')) {
          return `文件太大。最大允许 ${mb}MB`;
        } else {
          return `File is too large. Maximum allowed: ${mb}MB`;
        }
      }
      
      // 检查其他常见的文件相关错误
      if (errorDetail.includes('file size') || errorDetail.includes('File size')) {
        const sizeMatch = errorDetail.match(/(\d+)/);
        if (sizeMatch) {
          const bytes = parseInt(sizeMatch[1]);
          const mb = Math.round(bytes / 1024 / 1024);
          
          const language = localStorage.getItem('language') || navigator.language;
          if (language.startsWith('zh')) {
            return `文件太大。最大允许 ${mb}MB`;
          } else {
            return `File is too large. Maximum allowed: ${mb}MB`;
          }
        }
      }
    }
    
    return errorDetail;
  } catch {
    return `请求失败 (HTTP ${response.status})`;
  }
};

// 统一的文件上传处理
export const createFormData = (files: File[], data?: Record<string, any>, fileFieldName: string = 'files'): FormData => {
  const formData = new FormData();
  
  // 添加文件
  files.forEach(file => {
    formData.append(fileFieldName, file);
  });
  
  // 添加其他数据
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }
  
  return formData;
};
