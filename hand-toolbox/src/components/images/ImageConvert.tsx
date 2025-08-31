import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { ErrorAlert } from "@/components/ui/error-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Download } from "lucide-react";
import { API_BASE_URL, IMAGE_API } from "@/lib/api";
import { safeApiCall, type AppError } from "@/lib/errorHandler";
import { handleDownloadResponse, formatFileSize, getFileIcon } from "@/lib/fileUtils";
import { useLanguage } from "@/contexts/LanguageContext";

export function ImageConvert() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<AppError | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setDownloadUrl(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError({
        type: 'validation',
        message: t.processing.uploadFilesFirst,
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
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
      files.forEach(file => formData.append("files", file));
      formData.append("format", format);

      const response = await fetch(`${API_BASE_URL}${IMAGE_API.CONVERT}`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(t.processing.imageConvertFailed);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
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
          message: t.processing.imageConvertFailed,
          retryable: false,
          timestamp: new Date()
        };
      setError(appError);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOutputFilename = () => {
    if (files.length === 0) return "converted_images.zip";
    if (files.length === 1) {
      const baseName = files[0].name.split('.').slice(0, -1).join('.');
      return `${baseName}.${format}`;
    }
    return "converted_images.zip";
  };

  const handleRetry = () => {
    setError(null);
    handleConvert();
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.images.convert.title}</CardTitle>
          <CardDescription>{t.images.convert.uploadDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            options={{
              allowedTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
              maxFiles: 10,
              maxFileSize: 50 * 1024 * 1024, // 50MB
              multiple: true
            }}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* 转换选项 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.images.convert.formatOptions}</CardTitle>
          <CardDescription>{t.images.convert.formatSelect}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="format">{t.images.convert.formatSelect}</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder={t.images.convert.formatPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="bmp">BMP</SelectItem>
                <SelectItem value="tiff">TIFF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Button
        onClick={handleConvert}
        disabled={files.length === 0 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.processing.imageConvertProcessing}
          </div>
        ) : (
          `${t.images.convert.title} (${files.length})`
        )}
      </Button>

      {/* 进度条 */}
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            {progress < 100 ? t.processing.imageConvertProgress : t.processing.imageConvertComplete}
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

      {/* 下载区域 */}
      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.processing.imageConvertComplete}</CardTitle>
            <CardDescription>{t.images.convert.downloadButton}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/15 text-green-600 p-3 rounded-lg">
              <p>{t.processing.imageConvertSuccess}</p>
            </div>

            <Button 
              asChild 
              className="flex items-center gap-2 w-full"
            >
              <a href={downloadUrl} download={getOutputFilename()}>
                <Download className="h-4 w-4" />
                {t.images.convert.downloadButton}
              </a>
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>{t.images.convert.outputFormat}: {format.toUpperCase()}</p>
              <p>{t.images.convert.fileCount}: {files.length}</p>
              {files.length > 1 && <p>{t.images.convert.multipleFilesNote}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
