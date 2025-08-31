import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { FileUpload } from "@/components/ui/file-upload"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { API_BASE_URL, TABLE_API } from "@/lib/api"
import { safeApiCall, type AppError } from "@/lib/errorHandler"
import { handleDownloadResponse, formatFileSize, getFileIcon } from "@/lib/fileUtils"
import { useLanguage } from "@/contexts/LanguageContext"

// 去重模式类型
type DeduplicateLogic = 'random' | 'max' | 'min'

export function TableDeduplicate() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [deduplicateColumn, setDeduplicateColumn] = useState('')
  const [logic, setLogic] = useState<DeduplicateLogic>('random')
  const [valueColumn, setValueColumn] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingColumns, setIsLoadingColumns] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<AppError | null>(null)
  const [success, setSuccess] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)
  const [stats, setStats] = useState<{ 
    original: number; 
    deduplicated: number;
    deduplicationRate: number;
  } | null>(null)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess('');
    setPreviewData(null);
    setStats(null);
    setDeduplicateColumn('');
    setLogic('random');
    setValueColumn('');
    setColumns([]);

    // 自动获取列名
    if (selectedFiles.length > 0) {
      getColumns(selectedFiles[0]);
    }
  }

  const getColumns = async (file: File) => {
    setIsLoadingColumns(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 使用表格拆分的列名获取接口
      const response = await fetch(`${API_BASE_URL}${TABLE_API.SPLIT_COLUMNS}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `${t.processing.failedToGetColumns} (${response.status})`);
      }

      const data = await response.json();
      setColumns(data.columns || []);
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
          message: t.processing.failedToGetColumns,
          retryable: false,
          timestamp: new Date()
        };
      setError(appError);
    } finally {
      setIsLoadingColumns(false);
    }
  }

  // 检查是否可以选择依据字段
  const shouldShowValueColumn = logic === 'max' || logic === 'min'

  const handleDeduplicate = async () => {
    if (files.length === 0) {
      setError({
        type: 'validation',
        message: t.processing.uploadFilesFirst,
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    if (!deduplicateColumn) {
      setError({
        type: 'validation',
        message: t.processing.selectDeduplicateColumn,
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    if ((logic === 'max' || logic === 'min') && !valueColumn) {
      setError({
        type: 'validation',
        message: t.processing.selectValueColumn,
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
      formData.append('file', files[0]);
      formData.append('deduplicate_column', deduplicateColumn);
      formData.append('logic', logic);
      if (valueColumn) {
        formData.append('value_column', valueColumn);
      }

      const response = await fetch(`${API_BASE_URL}${TABLE_API.DEDUPLICATE_PREVIEW}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `去重请求失败 (${response.status})`);
      }

      const data = await response.json();
      setPreviewData(data);
      
      if (data.original_rows && data.deduplicated_rows) {
        setStats({
          original: data.original_rows,
          deduplicated: data.deduplicated_rows,
          deduplicationRate: data.deduplication_rate || 0
        });
        
        const duplicatesRemoved = data.original_rows - data.deduplicated_rows;
        setSuccess(`${t.processing.deduplicateSuccess} ${duplicatesRemoved} ${t.processing.duplicatesRemoved}, ${t.processing.duplicationRate} ${data.deduplication_rate || 0}%`);
      } else {
        setSuccess(t.processing.deduplicateSuccess);
      }
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
          message: t.processing.deduplicateFailed,
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
      formData.append('file', files[0]);
      formData.append('deduplicate_column', deduplicateColumn);
      formData.append('logic', logic);
      if (valueColumn) {
        formData.append('value_column', valueColumn);
      }

      const response = await fetch(`${API_BASE_URL}${TABLE_API.DEDUPLICATE}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      await handleDownloadResponse(response, 'deduplicated_data.xlsx');
      setSuccess('去重后的文件下载成功！');
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
    handleDeduplicate();
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.deduplicate.title}</CardTitle>
          <CardDescription>{t.tables.deduplicate.description}</CardDescription>
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
            disabled={isLoading || isLoadingColumns}
          />
        </CardContent>
      </Card>

      {/* 去重选项区域 */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.tables.deduplicate.optionsTitle}</CardTitle>
            <CardDescription>{t.tables.deduplicate.optionsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 去重字段选择 */}
            <div className="space-y-3">
              <Label htmlFor="deduplicate-column">{t.tables.deduplicate.deduplicateBy}</Label>
              <SearchableSelect
                value={deduplicateColumn}
                onValueChange={setDeduplicateColumn}
                placeholder={t.tables.deduplicate.deduplicateBy}
                options={columns}
                disabled={isLoadingColumns}
              />
            </div>

            {/* 去重模式选择 */}
            <div className="space-y-3">
              <Label>{t.tables.deduplicate.method}</Label>
              <RadioGroup 
                value={logic} 
                onValueChange={(value) => setLogic(value as DeduplicateLogic)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="cursor-pointer">{t.tables.deduplicate.random}</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="max" id="max" />
                  <Label htmlFor="max" className="cursor-pointer">{t.tables.deduplicate.max}</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="min" id="min" />
                  <Label htmlFor="min" className="cursor-pointer">{t.tables.deduplicate.min}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 依据字段选择（仅当选择取大或取小时显示） */}
            {shouldShowValueColumn && (
              <div className="space-y-3">
                <Label htmlFor="value-column">{t.tables.deduplicate.valueField}</Label>
                <SearchableSelect
                  value={valueColumn}
                  onValueChange={setValueColumn}
                  placeholder={t.tables.deduplicate.valueField}
                  options={columns}
                  disabled={isLoadingColumns}
                />
                <p className="text-sm text-muted-foreground">
                  {t.tables.deduplicate.valueFieldDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Button
        onClick={handleDeduplicate}
        disabled={
          files.length === 0 || 
          !deduplicateColumn || 
          (shouldShowValueColumn && !valueColumn) || 
          isLoading || 
          isLoadingColumns
        }
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.processing.processing}
          </div>
        ) : (
          t.tables.deduplicate.title
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

      {/* 统计信息 */}
      {stats && (
        <Card>
        <CardHeader>
          <CardTitle>{t.tables.deduplicate.title}</CardTitle>
          <CardDescription>{t.processing.dataComparison}</CardDescription>
        </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.original}</div>
                <div className="text-sm text-muted-foreground">{t.tables.deduplicate.originalRows}</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.deduplicated}</div>
                <div className="text-sm text-muted-foreground">{t.tables.deduplicate.deduplicatedRows}</div>
              </div>
            </div>
            {stats.original > stats.deduplicated && (
              <div className="text-center mt-4 p-4 bg-blue-500/10 rounded-lg">
                <div className="text-lg font-semibold text-blue-500">
                  {t.processing.removedDuplicates.replace('{count}', (stats.original - stats.deduplicated).toString())}
                </div>
                <div className="text-sm text-blue-400">
                  {t.processing.duplicationRate}: {stats.deduplicationRate.toFixed(1)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 预览区域 */}
      {previewData && previewData.preview_data && (
        <Card>
          <CardHeader>
            <CardTitle>{t.processing.deduplicatePreview}</CardTitle>
            <CardDescription>{t.processing.deduplicatePreviewDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 max-h-96 overflow-auto">
              {previewData.preview_data.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {previewData.preview_columns.map((column: string, index: number) => (
                        <th key={index} className="text-left p-2 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview_data.slice(0, 10).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b">
                        {previewData.preview_columns.map((column: string, colIndex: number) => (
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
                `${t.common.download} ${t.tables.deduplicate.title} (.xlsx)`
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
