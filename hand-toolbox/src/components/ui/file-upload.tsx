import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, GripVertical } from "lucide-react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
  type DraggableStateSnapshot
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateFiles, formatFileSize, getFileIcon } from "@/lib/fileUtils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FileIcon } from "@/components/ui/file-icon";
import type { AppError } from "@/lib/errorHandler";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  options?: {
    maxFiles?: number;
    maxFileSize?: number;
    allowedTypes?: string[];
    multiple?: boolean;
  };
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  options = {},
  className,
  disabled = false
}: FileUploadProps) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
    onFilesSelected(items);
  };

  const {
    maxFiles = 10,
    maxFileSize = 50 * 1024 * 1024, // 50MB
    allowedTypes = ['.xlsx', '.xls', '.csv', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp'],
    multiple = true
  } = options;

  // Map file extensions to MIME types to avoid browser warnings
  const extensionToMime: Record<string, string> = {
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.bmp': 'image/bmp'
  };

  // Convert allowedTypes to MIME types for the accept prop
  const acceptTypes = allowedTypes.reduce((acc, type) => {
    const mimeType = extensionToMime[type];
    if (mimeType) {
      acc[mimeType] = [];
    }
    return acc;
  }, {} as Record<string, string[]>);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      const rejectionErrors = rejectedFiles.flatMap(rejection =>
        rejection.errors.map((error: any) => {
          // 处理react-dropzone生成的错误信息，转换为相应的语言
          let errorMessage = error.message;
          
          // 处理文件大小错误
          if (errorMessage.includes('larger than') && errorMessage.includes('bytes')) {
            const sizeMatch = errorMessage.match(/(\d+) bytes/);
            if (sizeMatch) {
              const bytes = parseInt(sizeMatch[1]);
              const mb = Math.round(bytes / 1024 / 1024);
              return t.common.error === "错误" ? `文件太大。最大允许 ${mb}MB` : `File is too large. Maximum allowed: ${mb}MB`;
            }
          }
          
          // 处理文件类型错误
          if (errorMessage.includes('file type') || errorMessage.includes('file types')) {
            return t.common.error === "错误" ? '文件类型不支持' : 'File type not supported';
          }
          
          // 处理文件数量错误
          if (errorMessage.includes('Too many files')) {
            return t.common.error === "错误" ? '文件数量超过限制' : 'Too many files';
          }
          
          // 默认返回原始错误信息
          return errorMessage;
        })
      );
      setError({
        type: 'validation',
        message: rejectionErrors.join(', '),
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    // 验证文件
    const validation = validateFiles(acceptedFiles, {
      maxFiles,
      maxFileSize,
      allowedTypes
    });

    if (!validation.valid && validation.errors) {
      setError({
        type: 'validation',
        message: validation.errors.join(', '),
        retryable: false,
        timestamp: new Date()
      });
      return;
    }

    setFiles(prevFiles => {
      const newFiles = multiple ? [...prevFiles, ...acceptedFiles] : acceptedFiles;
      // 确保不超过最大文件数
      const finalFiles = newFiles.slice(0, maxFiles);
      onFilesSelected(finalFiles);
      return finalFiles;
    });
  }, [maxFiles, maxFileSize, allowedTypes, multiple, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxFileSize,
    accept: acceptTypes,
    multiple,
    disabled: disabled || isUploading
  });

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      onFilesSelected(newFiles);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    setFiles([]);
    onFilesSelected([]);
    setError(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 拖拽区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          {
            "border-primary bg-primary/10": isDragActive,
            "border-muted-foreground/25 hover:border-muted-foreground/50": !isDragActive,
            "opacity-50 cursor-not-allowed": disabled || isUploading
          }
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? t.common.dragAndDrop : `${t.common.dragAndDrop}, ${t.common.or} ${t.common.clickToSelect}`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t.common.supportedFormats}: {allowedTypes.join(', ')} | {t.common.maxSize}: {formatFileSize(maxFileSize)} | {t.common.maxFiles}: {maxFiles} {t.common.files}
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <ErrorAlert
          error={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{t.common.selectedFiles} ({files.length})</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFiles}
              disabled={isUploading}
            >
              {t.common.clear}
            </Button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-40 overflow-y-auto"
                >
                  {files.map((file, index) => (
                    <Draggable
                      key={`${file.name}-${index}`}
                      draggableId={`${file.name}-${index}`}
                      index={index}
                    >
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "flex items-center justify-between p-2 bg-muted rounded-md",
                            {
                              "bg-primary/20": snapshot.isDragging,
                              "shadow-md": snapshot.isDragging
                            }
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            </div>
                            <FileIcon filename={file.name} className="h-5 w-5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          {isUploading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}
