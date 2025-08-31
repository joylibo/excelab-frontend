import { useState } from 'react'
import { Header } from "@/components/layout/Header"
import { TablesSection } from "@/components/sections/TablesSection"
import { DocsSection } from "@/components/sections/DocsSection"
import { ImagesSection } from "@/components/sections/ImagesSection"
import { AboutSection } from "@/components/sections/AboutSection"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { ThemeProvider } from "@/contexts/ThemeContext"

function App() {
  const [activeSection, setActiveSection] = useState('tables')

  const renderSection = () => {
    switch (activeSection) {
      case 'tables':
        return <TablesSection />
      case 'docs':
        return <DocsSection />
      case 'images':
        return <ImagesSection />
      case 'about':
        return <AboutSection />
      default:
        return <TablesSection />
    }
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {renderSection()}
            </div>
          </main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
