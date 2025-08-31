import { handleApiError } from "./api";

/**
 * 错误类型定义
 */
export type AppError = {
  type: 'network' | 'validation' | 'server' | 'unknown';
  message: string;
  code?: number;
  retryable: boolean;
  timestamp: Date;
};

/**
 * 创建应用错误对象
 */
export const createError = (
  type: AppError['type'],
  message: string,
  code?: number,
  retryable: boolean = true
): AppError => ({
  type,
  message,
  code,
  retryable,
  timestamp: new Date()
});

/**
 * 从HTTP响应创建错误对象
 */
export const createErrorFromResponse = async (response: Response): Promise<AppError> => {
  const errorMessage = await handleApiError(response);
  
  let errorType: AppError['type'] = 'unknown';
  let retryable = false;

  if (response.status >= 400 && response.status < 500) {
    errorType = 'validation';
    // 客户端错误通常不可重试，除非是429（太多请求）
    retryable = response.status === 429;
  } else if (response.status >= 500) {
    errorType = 'server';
    retryable = true; // 服务器错误通常可以重试
  } else {
    errorType = 'network';
    retryable = true;
  }

  return createError(errorType, errorMessage, response.status, retryable);
};

/**
 * 从异常创建错误对象
 */
export const createErrorFromException = (error: unknown): AppError => {
  if (error instanceof Error) {
    // 网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return createError(
        'network', 
        '网络连接失败，请检查网络连接后重试',
        undefined,
        true
      );
    }
    
    // 其他错误
    return createError(
      'unknown',
      error.message || '发生未知错误',
      undefined,
      false
    );
  }
  
  // 未知错误类型
  return createError(
    'unknown',
    '发生未知错误',
    undefined,
    false
  );
};

/**
 * 用户友好的错误消息映射
 */
export const getUserFriendlyErrorMessage = (error: AppError): string => {
  const { type, message, code } = error;
  
  switch (type) {
    case 'network':
      return message || '网络连接失败，请检查网络连接后重试';
    
    case 'validation':
      if (code === 400) {
        return message || '请求参数错误，请检查输入内容';
      }
      if (code === 401) {
        return '未授权访问，请重新登录';
      }
      if (code === 403) {
        return '权限不足，无法执行此操作';
      }
      if (code === 404) {
        return '请求的资源不存在';
      }
      if (code === 429) {
        return '请求过于频繁，请稍后再试';
      }
      return message || '请求验证失败';
    
    case 'server':
      return message || '服务器内部错误，请稍后再试';
    
    case 'unknown':
    default:
      return message || '发生未知错误，请稍后再试';
  }
};

/**
 * 判断错误是否可重试
 */
export const isRetryableError = (error: AppError): boolean => {
  return error.retryable;
};

/**
 * 错误重试机制
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: AppError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const appError = createErrorFromException(error);
      lastError = appError;
      
      // 如果不可重试或达到最大重试次数，抛出错误
      if (!isRetryableError(appError) || attempt === maxRetries) {
        throw appError;
      }
      
      // 等待一段时间后重试（指数退避）
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.warn(`操作失败，第 ${attempt} 次重试，等待 ${waitTime}ms`, appError);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || createError('unknown', '操作失败');
};

/**
 * 安全的API调用包装器
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  options: {
    maxRetries?: number;
    onError?: (error: AppError) => void;
  } = {}
): Promise<T> => {
  try {
    return await withRetry(apiCall, options.maxRetries);
  } catch (error) {
    const appError = error instanceof Error ? createErrorFromException(error) : error as AppError;
    
    if (options.onError) {
      options.onError(appError);
    }
    
    throw appError;
  }
};
