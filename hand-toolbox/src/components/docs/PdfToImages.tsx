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
import { API_BASE_URL, DOCS_API } from "@/lib/api";
import { safeApiCall, type AppError } from "@/lib/errorHandler";
import { handleDownloadResponse, formatFileSize, getFileIcon } from "@/lib/fileUtils";
import { useLanguage } from "@/contexts/LanguageContext";

export function PdfToImages() {
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
      // 后端API期望的是file字段（单数），不是files字段（复数）
      files.forEach(file => formData.append("file", file));
      formData.append("format", format);

      // 确保进度条至少有3秒的显示时间（PDF转图片通常需要更长时间）
      const minProcessingTime = 3000;
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}${DOCS_API.PDF_TO_IMAGES}`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      
      // 计算剩余需要等待的时间
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minProcessingTime - elapsedTime);
      
      if (remainingTime > 0) {
        // 如果请求太快，继续模拟进度到98%
        let currentProgress = 95;
        const continueInterval = setInterval(() => {
          currentProgress += 1;
          setProgress(currentProgress);
          if (currentProgress >= 98) {
            clearInterval(continueInterval);
            
            // 然后平滑过渡到100%
            const finishInterval = setInterval(() => {
              currentProgress += 1;
              setProgress(currentProgress);
              if (currentProgress >= 100) {
                clearInterval(finishInterval);
              }
            }, remainingTime / 2); // 均匀分配到剩余时间
          }
        }, remainingTime / 3); // 均匀分配到剩余时间
      } else {
        // 如果已经超过最小时间，直接平滑过渡到100%
        let currentProgress = 95;
        const finishInterval = setInterval(() => {
          currentProgress += 1;
          setProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(finishInterval);
          }
        }, 30);
      }

      if (!response.ok) {
        throw new Error(t.processing.pdfConvertFailed);
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
          message: t.processing.pdfConvertFailed,
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
      return `${baseName}_images.zip`;
    }
    return "converted_pdfs_images.zip";
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
          <CardTitle className="text-lg">{t.docs.pdfToImages.title}</CardTitle>
          <CardDescription>{t.docs.pdfToImages.uploadDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            options={{
              allowedTypes: ['.pdf'],
              maxFiles: 1,
              maxFileSize: 100 * 1024 * 1024, // 100MB
              multiple: false
            }}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* 图片格式选择区域 */}
      {files.length > 0 && (
        <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.docs.pdfToImages.formatOptions}</CardTitle>
          <CardDescription>{t.docs.pdfToImages.formatSelect}</CardDescription>
        </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="format">{t.docs.pdfToImages.formatSelect}</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder={t.docs.pdfToImages.formatPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

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
            {t.processing.pdfConvertProcessing}
          </div>
        ) : (
          t.docs.pdfToImages.title
        )}
      </Button>

      {/* 进度条 */}
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            {progress < 100 ? t.processing.pdfConvertProgress : t.processing.pdfConvertComplete}
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
            <CardTitle className="text-lg">{t.processing.pdfConvertComplete}</CardTitle>
            <CardDescription>{t.docs.pdfToImages.downloadButton}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/15 text-green-600 p-3 rounded-lg">
              <p>{t.processing.pdfConvertSuccess}</p>
            </div>

            <Button 
              asChild 
              className="flex items-center gap-2 w-full"
            >
              <a href={downloadUrl} download={getOutputFilename()}>
                <Download className="h-4 w-4" />
                {t.docs.pdfToImages.downloadButton}
              </a>
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>{t.docs.pdfToImages.outputFormat}: ZIP ({format === 'jpeg' ? 'JPG' : format.toUpperCase()})</p>
              <p>{t.docs.pdfToImages.fileCount}: {files.length}</p>
              {files.length > 1 && <p>{t.docs.pdfToImages.multipleFilesNote}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
