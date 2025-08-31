import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableMerge } from "@/components/tables/TableMerge"
import { TableSplit } from "@/components/tables/TableSplit"
import { TableClean } from "@/components/tables/TableClean"
import { TableDeduplicate } from "@/components/tables/TableDeduplicate"
import { useLanguage } from "@/contexts/LanguageContext"

export function TablesSection() {
  const [activeTab, setActiveTab] = useState('merge')
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="merge">{t.tables.merge.title}</TabsTrigger>
          <TabsTrigger value="split">{t.tables.split.title}</TabsTrigger>
          <TabsTrigger value="clean">{t.tables.clean.title}</TabsTrigger>
          <TabsTrigger value="deduplicate">{t.tables.deduplicate.title}</TabsTrigger>
        </TabsList>

        <TabsContent value="merge">
          <TableMerge />
        </TabsContent>

        <TabsContent value="split">
          <TableSplit />
        </TabsContent>

        <TabsContent value="clean">
          <TableClean />
        </TabsContent>

        <TabsContent value="deduplicate">
          <TableDeduplicate />
        </TabsContent>
      </Tabs>
    </div>
  )
}
