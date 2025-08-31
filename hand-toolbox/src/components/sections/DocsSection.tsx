import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfToImages } from "@/components/docs/PdfToImages";
import { PdfMerge } from "@/components/docs/PdfMerge";
import { useLanguage } from "@/contexts/LanguageContext";

export function DocsSection() {
  const { t } = useLanguage()
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pdf-to-images" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pdf-to-images">{t.docs.pdfToImages.title}</TabsTrigger>
          <TabsTrigger value="pdf-merge">{t.docs.pdfMerge.title}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pdf-to-images">
          <PdfToImages />
        </TabsContent>
        
        <TabsContent value="pdf-merge">
          <PdfMerge />
        </TabsContent>
      </Tabs>
    </div>
  );
}
