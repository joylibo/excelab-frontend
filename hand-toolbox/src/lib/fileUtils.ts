import { createFormData } from "./api";
import { safeApiCall } from "./errorHandler";
import type { AppError } from "./errorHandler";

/**
 * 文件上传选项
 */
export interface FileUploadOptions {
  maxFileSize?: number; // 最大文件大小（字节）
  allowedTypes?: string[]; // 允许的文件类型
  maxFiles?: number; // 最大文件数量
}

/**
 * 验证文件
 */
export const validateFile = (
  file: File,
  options: FileUploadOptions = {}
): { valid: boolean; error?: string } => {
  const { maxFileSize = 50 * 1024 * 1024, allowedTypes } = options;

  // 检查文件大小
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `文件 "${file.name}" 太大。最大允许 ${Math.round(maxFileSize / 1024 / 1024)}MB`
    };
  }

  // 检查文件类型
  if (allowedTypes && allowedTypes.length > 0) {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const mimeType = file.type.toLowerCase();
    
    const isValidType = allowedTypes.some(type => 
      type.startsWith('.') 
        ? fileExtension === type.slice(1)
        : mimeType.includes(type.replace('*', ''))
    );

    if (!isValidType) {
      return {
        valid: false,
        error: `文件 "${file.name}" 的类型不被支持。支持的类型: ${allowedTypes.join(', ')}`
      };
    }
  }

  return { valid: true };
};

/**
 * 验证多个文件
 */
export const validateFiles = (
  files: File[],
  options: FileUploadOptions = {}
): { valid: boolean; errors?: string[] } => {
  const { maxFiles } = options;
  const errors: string[] = [];

  // 检查文件数量
  if (maxFiles && files.length > maxFiles) {
    errors.push(`最多只能上传 ${maxFiles} 个文件`);
  }

  // 检查每个文件
  files.forEach(file => {
    const result = validateFile(file, options);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

/**
 * 下载文件
 */
export const downloadFile = async (
  url: string,
  filename: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<void> => {
  try {
    const response = await safeApiCall(() =>
      fetch(url, {
        method: options.method || 'GET',
        body: options.body,
        headers: options.headers,
      })
    );

    if (!response.ok) {
      throw new Error(`下载失败: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('文件下载失败:', error);
    throw error;
  }
};

/**
 * 上传文件并处理响应
 */
export const uploadFiles = async <T>(
  url: string,
  files: File[],
  data?: Record<string, any>,
  options: {
    onProgress?: (progress: number) => void;
    maxRetries?: number;
    fileFieldName?: string; // 自定义文件字段名
  } = {}
): Promise<T> => {
  const formData = createFormData(files, data, options.fileFieldName);

  return safeApiCall(
    async () => {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // 注意：不要设置 Content-Type header，浏览器会自动设置正确的 multipart/form-data
      });

      if (!response.ok) {
        throw new Error(`上传失败: HTTP ${response.status}`);
      }

      // 处理不同的响应类型
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return response.json();
      } else if (contentType?.includes('application/zip') || contentType?.includes('application/octet-stream')) {
        return response.blob() as unknown as T;
      } else {
        return response.text() as unknown as T;
      }
    },
    { maxRetries: options.maxRetries }
  );
};

/**
 * 处理文件下载响应
 */
export const handleDownloadResponse = async (
  response: Response,
  defaultFilename: string
): Promise<void> => {
  if (!response.ok) {
    throw new Error(`下载失败: HTTP ${response.status}`);
  }

  const contentDisposition = response.headers.get('content-disposition');
  let filename = defaultFilename;

  // 从 Content-Disposition 头中提取文件名
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 获取文件图标（基于文件类型）
 */
export const getFileIcon = (filename: string): string => {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return '📊';
    case 'csv':
      return '📋';
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️';
    case 'zip':
      return '📦';
    default:
      return '📁';
  }
};
