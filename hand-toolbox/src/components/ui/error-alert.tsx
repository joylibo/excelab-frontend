import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppError } from "@/lib/errorHandler";
import { isRetryableError } from "@/lib/errorHandler";

interface ErrorAlertProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, onDismiss, className }: ErrorAlertProps) {
  if (!error) return null;

  const getVariant = () => {
    switch (error.type) {
      case 'network':
        return 'destructive';
      case 'validation':
        return 'warning';
      case 'server':
        return 'destructive';
      case 'unknown':
      default:
        return 'destructive';
    }
  };

  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return <AlertCircle className="h-4 w-4" />;
      case 'validation':
        return <AlertCircle className="h-4 w-4" />;
      case 'server':
        return <AlertCircle className="h-4 w-4" />;
      case 'unknown':
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const variant = getVariant();
  const icon = getIcon();
  const canRetry = isRetryableError(error) && onRetry;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4",
        {
          "border-destructive/50 bg-destructive/10 text-destructive": variant === 'destructive',
          "border-yellow-500/50 bg-yellow-500/10 text-yellow-700": variant === 'warning',
        },
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">
            {error.type === 'network' && '网络错误'}
            {error.type === 'validation' && '验证错误'}
            {error.type === 'server' && '服务器错误'}
            {error.type === 'unknown' && '未知错误'}
          </p>
          <p className="text-sm">{error.message}</p>
          
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              重试
            </Button>
          )}
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={onDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
