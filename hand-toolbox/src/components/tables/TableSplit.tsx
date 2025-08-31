import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Progress } from "@/components/ui/progress"
import { FileUpload } from "@/components/ui/file-upload"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { API_BASE_URL, TABLE_API } from "@/lib/api"
import { safeApiCall, type AppError } from "@/lib/errorHandler"
import { handleDownloadResponse, formatFileSize, getFileIcon } from "@/lib/fileUtils"
import { useLanguage } from "@/contexts/LanguageContext"

export function TableSplit() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingColumns, setIsLoadingColumns] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<AppError | null>(null)
  const [success, setSuccess] = useState('')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setSuccess('');
    setDownloadUrl(null);
    setSelectedColumn('');
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

  const handleSplit = async () => {
    if (files.length === 0) {
      setError({
        type: 'validation',
        message: t.processing.uploadFilesFirst,
        retryable: false,
        timestamp: new Date()
      });
      return;
    }
    
    if (!selectedColumn) {
      setError({
        type: 'validation',
        message: t.processing.selectSplitColumn,
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
      formData.append('split_column', selectedColumn);

      const response = await fetch(`${API_BASE_URL}${TABLE_API.SPLIT}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `${t.processing.splitFailed} (${response.status})`);
      }

      // 保存ZIP文件的Blob URL，但不立即下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccess(t.processing.splitSuccess.replace('{column}', selectedColumn));
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
          message: t.processing.splitFailed,
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
    handleSplit();
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'split_files.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.tables.split.title}</CardTitle>
          <CardDescription>{t.tables.split.description}</CardDescription>
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

      {/* 列选择区域 */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.tables.split.selectColumn}</CardTitle>
            <CardDescription>{t.tables.split.splitByColumn}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingColumns ? (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <p className="text-muted-foreground">{t.processing.gettingColumnNames}</p>
                </div>
              </div>
            ) : columns.length > 0 ? (
              <div className="space-y-4">
                <SearchableSelect
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                  placeholder={t.processing.selectSplitColumn}
                  options={columns}
                  disabled={isLoadingColumns}
                />
                
                {selectedColumn && (
                  <p className="text-sm text-muted-foreground">
                    {t.tables.split.splitByColumn.replace('{column}', selectedColumn)}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">{t.processing.failedToGetColumns}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Button
        onClick={handleSplit}
        disabled={files.length === 0 || !selectedColumn || isLoading || isLoadingColumns}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.processing.processing}
          </div>
        ) : (
          t.tables.split.title
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

      {/* 下载区域 */}
      {success && (
        <Card>
          <CardHeader>
            <CardTitle>{t.processing.splitSuccess}</CardTitle>
            <CardDescription>{t.processing.downloadSuccess}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm">
                {t.processing.filesWillBeZipped}
              </p>
            </div>

            <Button 
              onClick={handleDownload} 
              className="w-full"
              variant="default"
              size="lg"
            >
              {t.common.download} {t.common.files} (zip)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
