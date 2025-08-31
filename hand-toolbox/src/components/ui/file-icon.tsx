import { 
  FileSpreadsheet, 
  Table, 
  FileText, 
  Image, 
  Archive, 
  File,
  type LucideProps
} from "lucide-react"

interface FileIconProps extends LucideProps {
  filename: string
}

export function FileIcon({ filename, className = "h-4 w-4", ...props }: FileIconProps) {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return <FileSpreadsheet className={className} {...props} />;
    case 'csv':
      return <Table className={className} {...props} />;
    case 'pdf':
      return <FileText className={className} {...props} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <Image className={className} {...props} />;
    case 'zip':
      return <Archive className={className} {...props} />;
    default:
      return <File className={className} {...props} />;
  }
}
