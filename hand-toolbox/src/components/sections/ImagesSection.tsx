import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageConvert } from "@/components/images/ImageConvert"
import { useLanguage } from "@/contexts/LanguageContext"

export function ImagesSection() {
  const [activeTab, setActiveTab] = useState('convert')
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="convert">{t.images.convert.title}</TabsTrigger>
          <TabsTrigger value="resize" disabled>{t.images.resize.title}</TabsTrigger>
          <TabsTrigger value="crop" disabled>{t.images.crop.title}</TabsTrigger>
        </TabsList>

        <TabsContent value="convert">
          <ImageConvert />
        </TabsContent>

        <TabsContent value="resize">
          <div className="text-center py-12 text-muted-foreground">
            {t.images.resize.developing}
          </div>
        </TabsContent>

        <TabsContent value="crop">
          <div className="text-center py-12 text-muted-foreground">
            {t.images.crop.developing}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
