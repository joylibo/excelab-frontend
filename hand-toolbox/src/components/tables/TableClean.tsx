import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { FileUpload } from "@/components/ui/file-upload"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { API_BASE_URL, TABLE_API } from "@/lib/api"
import { safeApiCall, type AppError } from "@/lib/errorHandler"
import { handleDownloadResponse, formatFileSize, getFileIcon } from "@/lib/fileUtils"
import { useLanguage } from "@/contexts/LanguageContext"

interface CleanOptions {
  removeEmptyRows: boolean
  removeEmptyCols: boolean
  trimSpaces: boolean
}

interface CleanStats {
  originalRows: number
  cleanedRows: number
  originalCols: number
  cleanedCols: number
}

export function TableClean() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [options, setOptions] = useState<CleanOptions>({
    removeEmptyRows: true,
    removeEmptyCols: true,
    trimSpaces: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<AppError | null>(null)
  const [success, setSuccess] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)
  const [stats, setStats] = useState<CleanStats | null>(null)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess('');
    setPreviewData(null);
    setStats(null);
  }

  const handleOptionChange = (option: keyof CleanOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  const handlePreview = async () => {
    if (files.length === 0) {
      setError({
        type: 'validation',
        message: t.processing.uploadFilesFirst,
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess('');
    setProgress(0);

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const formData = new FormData();
      // 后端API期望的是file字段（单数），不是files字段（复数）
      formData.append('file', files[0]);
      formData.append('remove_empty_rows', options.removeEmptyRows.toString());
      formData.append('remove_empty_cols', options.removeEmptyCols.toString());
      formData.append('trim_spaces', options.trimSpaces.toString());

      const response = await fetch(`${API_BASE_URL}${TABLE_API.CLEAN_PREVIEW}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `预览请求失败 (${response.status})`);
      }

      const data = await response.json();
      setPreviewData(data);
      setStats({
        originalRows: data.original_rows,
        cleanedRows: data.cleaned_rows,
        originalCols: data.original_cols,
        cleanedCols: data.cleaned_cols
      });
      
      const rowsRemoved = data.original_rows - data.cleaned_rows;
      const colsRemoved = data.original_cols - data.cleaned_cols;
      setSuccess(t.processing.cleanSuccessWithStats.replace('{rows}', rowsRemoved.toString()).replace('{cols}', colsRemoved.toString()));
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
          message: t.processing.cleanFailed,
          retryable: false,
          timestamp: new Date()
        };
      setError(appError);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const formData = new FormData();
      // 后端API期望的是file字段（单数），不是files字段（复数）
      formData.append('file', files[0]);
      formData.append('remove_empty_rows', options.removeEmptyRows.toString());
      formData.append('remove_empty_cols', options.removeEmptyCols.toString());
      formData.append('trim_spaces', options.trimSpaces.toString());

      const response = await fetch(`${API_BASE_URL}${TABLE_API.CLEAN}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      await handleDownloadResponse(response, 'cleaned_data.xlsx');
      setSuccess(t.processing.downloadSuccess);
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
      setError(appError);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRetry = () => {
    setError(null);
    handlePreview();
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.clean.title}</CardTitle>
          <CardDescription>{t.tables.clean.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            options={{
              allowedTypes: ['.xlsx', '.xls', '.csv'],
              maxFiles: 1,
              maxFileSize: 50 * 1024 * 1024, // 50MB
              multiple: false
            }}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* 清理选项 */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.clean.optionsTitle}</CardTitle>
          <CardDescription>{t.tables.clean.optionsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="remove-empty-rows"
              checked={options.removeEmptyRows}
              onCheckedChange={() => handleOptionChange('removeEmptyRows')}
              className="h-5 w-5"
            />
            <Label htmlFor="remove-empty-rows" className="text-sm cursor-pointer">{t.tables.clean.removeEmptyRows}</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="remove-empty-cols"
              checked={options.removeEmptyCols}
              onCheckedChange={() => handleOptionChange('removeEmptyCols')}
              className="h-5 w-5"
            />
            <Label htmlFor="remove-empty-cols" className="text-sm cursor-pointer">{t.tables.clean.removeEmptyColumns}</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="trim-spaces"
              checked={options.trimSpaces}
              onCheckedChange={() => handleOptionChange('trimSpaces')}
              className="h-5 w-5"
            />
            <Label htmlFor="trim-spaces" className="text-sm cursor-pointer">{t.tables.clean.trimSpaces}</Label>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Button
        onClick={handlePreview}
        disabled={files.length === 0 || isLoading}
        className="w-full h-12 rounded-xl button-hover"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.processing.processing}
          </div>
        ) : (
            <span className="font-semibold">{t.tables.clean.title}预览</span>
        )}
      </Button>

      {/* 进度条 */}
      {isLoading && (
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
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
        <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-xl">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {stats && (
        <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.clean.title}</CardTitle>
          <CardDescription>{t.tables.clean.description}</CardDescription>
        </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{stats.originalRows}</div>
                <div className="text-sm text-muted-foreground mt-1">原始行数</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{stats.cleanedRows}</div>
                <div className="text-sm text-muted-foreground mt-1">清理后行数</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{stats.originalCols}</div>
                <div className="text-sm text-muted-foreground mt-1">原始列数</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-foreground">{stats.cleanedCols}</div>
                <div className="text-sm text-muted-foreground mt-1">清理后列数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 预览区域 */}
      {previewData && previewData.preview_data && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg">{t.tables.clean.title}</CardTitle>
            <CardDescription>{t.tables.clean.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-xl p-4 max-h-96 overflow-auto scrollbar-thin">
              {previewData.preview_data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {previewData.preview_columns.map((column: string, index: number) => (
                        <th key={index} className="text-left p-3 font-medium bg-muted/50">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview_data.slice(0, 10).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b hover:bg-muted/30 transition-colors">
                        {previewData.preview_columns.map((column: string, colIndex: number) => (
                          <td key={colIndex} className="p-3">
                            {row[column] !== null && row[column] !== undefined ? String(row[column]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t.processing.emptyPreview}</p>
              )}
            </div>

            <Button 
              onClick={handleDownload} 
              className="w-full h-12 rounded-xl button-hover"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.common.download}
                </div>
              ) : (
                <span className="font-semibold">{t.common.download}清理结果 (.xlsx)</span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
