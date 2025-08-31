import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export function PdfMerge() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<AppError | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
    setDownloadUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError({
        type: 'validation',
        message: t.processing.minTwoFilesRequired,
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // 模拟进度 - 更平滑的进度条体验
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) { // 在90%时停止模拟，给实际请求留更多时间
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 3 + 1; // 随机增量，更自然的进度感
        });
      }, 150); // 稍慢的更新间隔，更平滑的视觉效果

      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      // 确保进度条至少有2秒的显示时间
      const minProcessingTime = 2000;
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}${DOCS_API.PDF_MERGE}`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      
      // 计算剩余需要等待的时间
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minProcessingTime - elapsedTime);
      
      if (remainingTime > 0) {
        // 如果请求太快，继续模拟进度到95%
        let currentProgress = 90;
        const continueInterval = setInterval(() => {
          currentProgress += 1;
          setProgress(currentProgress);
          if (currentProgress >= 95) {
            clearInterval(continueInterval);
            
            // 然后平滑过渡到100%
            const finishInterval = setInterval(() => {
              currentProgress += 1;
              setProgress(currentProgress);
              if (currentProgress >= 100) {
                clearInterval(finishInterval);
              }
            }, remainingTime / 5); // 均匀分配到剩余时间
          }
        }, remainingTime / 5); // 均匀分配到剩余时间
      } else {
        // 如果已经超过最小时间，直接平滑过渡到100%
        let currentProgress = 90;
        const finishInterval = setInterval(() => {
          currentProgress += 2;
          setProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(finishInterval);
          }
        }, 50);
      }

      if (!response.ok) {
        throw new Error(t.processing.pdfMergeFailed);
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
          message: t.processing.pdfMergeFailed,
          retryable: false,
          timestamp: new Date()
        };
      setError(appError);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOutputFilename = () => {
    if (files.length === 0) return "merged_document.pdf";
    if (files.length === 1) {
      const baseName = files[0].name.split('.').slice(0, -1).join('.');
      return `${baseName}_merged.pdf`;
    }
    return "merged_documents.pdf";
  };

  const handleRetry = () => {
    setError(null);
    handleMerge();
  };

  return (
    <div className="space-y-6">
      {/* 文件上传区域 */}
      <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t.docs.pdfMerge.title}</CardTitle>
        <CardDescription>{t.docs.pdfMerge.uploadDescription}</CardDescription>
      </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            options={{
              allowedTypes: ['.pdf'],
              maxFiles: 10,
              maxFileSize: 100 * 1024 * 1024, // 100MB
              multiple: true
            }}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Button
        onClick={handleMerge}
        disabled={files.length < 2 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {t.processing.pdfMergeProcessing}
          </div>
        ) : (
          `${t.docs.pdfMerge.title} (${files.length})`
        )}
      </Button>

      {/* 进度条 */}
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            {progress < 100 ? t.processing.pdfMergeProgress : t.processing.pdfMergeComplete}
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
            <CardTitle className="text-lg">{t.processing.pdfMergeComplete}</CardTitle>
            <CardDescription>{t.docs.pdfMerge.downloadButton}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/15 text-green-600 p-3 rounded-lg">
              <p>{t.processing.pdfMergeSuccess.replace('{count}', files.length.toString())}</p>
            </div>

            <Button 
              asChild 
              className="flex items-center gap-2 w-full"
            >
              <a href={downloadUrl} download={getOutputFilename()}>
                <Download className="h-4 w-4" />
                {t.docs.pdfMerge.downloadButton}
              </a>
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>{t.docs.pdfMerge.fileCount}: {files.length}</p>
              <p>{t.docs.pdfMerge.outputFormat}: PDF</p>
              <p>{t.docs.pdfMerge.mergeOrder}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
