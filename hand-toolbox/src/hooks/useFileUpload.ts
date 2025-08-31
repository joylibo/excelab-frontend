import { useState, useCallback } from 'react'
import { safeApiCall, type AppError } from '@/lib/errorHandler'

interface UseFileUploadOptions {
  maxFiles?: number
  maxFileSize?: number
  allowedTypes?: string[]
  onFilesChange?: (files: File[]) => void
}

interface UseFileUploadReturn {
  files: File[]
  isUploading: boolean
  error: AppError | null
  handleFilesSelected: (selectedFiles: File[]) => void
  clearFiles: () => void
  uploadFiles: (url: string, additionalData?: Record<string, any>) => Promise<Response>
}

export function useFileUpload({
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  allowedTypes = [],
  onFilesChange
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    // 检查文件类型
    if (allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const isValidType = allowedTypes.some(type => 
        type.startsWith('.') ? fileExtension === type.slice(1) : file.type.includes(type)
      )
      
      if (!isValidType) {
        return `文件类型不支持: ${file.name}`
      }
    }

    // 检查文件大小
    if (file.size > maxFileSize) {
      return `文件太大: ${file.name} (最大 ${maxFileSize / 1024 / 1024}MB)`
    }

    return null
  }, [allowedTypes, maxFileSize])

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setError(null)
    
    // 验证文件数量
    if (selectedFiles.length > maxFiles) {
      setError({
        type: 'validation',
        message: `文件数量超过限制 (最多 ${maxFiles} 个)`,
        retryable: false,
        timestamp: new Date()
      })
      return
    }

    // 验证每个文件
    const validationErrors: string[] = []
    const validFiles: File[] = []

    selectedFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        validationErrors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (validationErrors.length > 0) {
      setError({
        type: 'validation',
        message: validationErrors.join(', '),
        retryable: false,
        timestamp: new Date()
      })
    }

    if (validFiles.length > 0) {
      setFiles(validFiles)
      onFilesChange?.(validFiles)
    }
  }, [maxFiles, validateFile, onFilesChange])

  const clearFiles = useCallback(() => {
    setFiles([])
    setError(null)
    onFilesChange?.([])
  }, [onFilesChange])

  const uploadFiles = useCallback(async (url: string, additionalData: Record<string, any> = {}) => {
    if (files.length === 0) {
      throw new Error('没有文件可上传')
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      
      // 添加文件
      files.forEach(file => {
        formData.append('files', file)
      })

      // 添加额外数据
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `上传失败 (${response.status})`)
      }

      return response
    } catch (err) {
      const appError = err instanceof Error ? 
        {
          type: 'server' as const,
          message: err.message,
          retryable: true,
          timestamp: new Date()
        } : 
        {
          type: 'unknown' as const,
          message: '上传失败',
          retryable: false,
          timestamp: new Date()
        }
      
      setError(appError)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [files])

  return {
    files,
    isUploading,
    error,
    handleFilesSelected,
    clearFiles,
    uploadFiles
  }
}
