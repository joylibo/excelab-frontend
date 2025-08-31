import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { FileUpload } from "@/components/ui/file-upload"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { API_BASE_URL, TABLE_API } from "@/lib/api"
import { safeApiCall, createErrorFromResponse, type AppError } from "@/lib/errorHandler"
import { uploadFiles, handleDownloadResponse, formatFileSize, getFileIcon } from "@/lib/fileUtils"
import { useLanguage } from "@/contexts/LanguageContext"

export function TableMerge() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [mergeMode, setMergeMode] = useState<'outer' | 'inner'>('outer')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<AppError | null>(null)
  const [success, setSuccess] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setError(null)
  }

  const handleMerge = async () => {
    if (files.length === 0) {
      setError({
        type: 'validation',
        message: t.processing.uploadFilesFirst,
        retryable: false,
        timestamp: new Date()
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess('')
    setProgress(0)

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      const data = await uploadFiles(
        `${API_BASE_URL}${TABLE_API.MERGE_PREVIEW}`,
        files,
        { merge_mode: mergeMode },
        {
          onProgress: setProgress,
          maxRetries: 3
        }
      )

      clearInterval(progressInterval)
      setProgress(100)
      setPreviewData(data)
      setSuccess(t.processing.mergeSuccessWithCount.replace('{count}', files.length.toString()))
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
          message: t.processing.mergeFailed,
          retryable: false,
          timestamp: new Date()
        };
      setError(appError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!previewData) return

    setIsLoading(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      const response = await fetch(`${API_BASE_URL}${TABLE_API.MERGE}`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData()
          files.forEach(file => formData.append('files', file))
          formData.append('merge_mode', mergeMode)
          return formData
        })()
      })

      clearInterval(progressInterval)
      setProgress(100)

      await handleDownloadResponse(response, 'merged_pro.xlsx')
      setSuccess(t.processing.downloadSuccess)
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
          message: t.processing.downloadFailed,
          retryable: false,
          timestamp: new Date()
        };
      setError(appError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    handleMerge()
  }

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.merge.title}</CardTitle>
          <CardDescription>{t.tables.merge.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            options={{
              allowedTypes: ['.xlsx', '.xls', '.csv'],
              maxFiles: 10,
              maxFileSize: 50 * 1024 * 1024, // 50MB
              multiple: true
            }}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* 合并选项 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.merge.optionsTitle}</CardTitle>
          <CardDescription>{t.tables.merge.optionsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mergeMode} onValueChange={(value: 'outer' | 'inner') => setMergeMode(value)}>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="outer" id="outer" />
              <Label htmlFor="outer" className="text-sm cursor-pointer">{t.tables.merge.keepAllColumns}</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="inner" id="inner" />
              <Label htmlFor="inner" className="text-sm cursor-pointer">{t.tables.merge.keepCommonColumns}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Button
        onClick={handleMerge}
        disabled={files.length === 0 || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.processing.processing}
          </div>
        ) : (
          `${t.tables.merge.title} (${files.length})`
        )}
      </Button>

      {/* 进度条 */}
      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            {progress < 100 ? t.processing.processingProgress : t.processing.processingCompleteMessage}
          </p>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <ErrorAlert
          error={error}
          onRetry={handleRetry}
          onDismiss={() => setError(null)}
        />
      )}

      {/* 成功信息 */}
      {success && (
        <div className="bg-green-500/15 text-green-600 p-3 rounded-lg">
          {success}
        </div>
      )}

      {/* 预览区域 */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>{t.processing.mergePreview}</CardTitle>
            <CardDescription>{t.processing.mergePreviewDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 max-h-96 overflow-auto">
              {previewData.data && previewData.data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {previewData.columns.map((column: string, index: number) => (
                        <th key={index} className="text-left p-2 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data.slice(0, 10).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b">
                        {previewData.columns.map((column: string, colIndex: number) => (
                          <td key={colIndex} className="p-2">
                            {row[column] !== null && row[column] !== undefined ? String(row[column]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted-foreground">{t.processing.emptyPreview}</p>
              )}
            </div>

            <Button 
              onClick={handleDownload} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {t.processing.processing}
                </div>
              ) : (
                `${t.common.download} ${t.tables.merge.title} (.xlsx)`
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
