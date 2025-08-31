import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { Menu, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface HeaderProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsMenuOpen(false)
  }

  const sections = [
    { id: "tables", label: t.header.tables },
    { id: "docs", label: t.header.docs },
    { id: "images", label: t.header.images },
    { id: "about", label: t.header.about }
  ]

  return (
    <header className="glass-effect border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-semibold text-xs sm:text-sm">
                {language === "en" ? "H" : "手"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground whitespace-nowrap">
              {t.common.appName}
            </h1>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  activeSection === section.id 
                    ? "bg-secondary text-secondary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => handleSectionChange(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-1">
            {/* Language Toggle */}
            <div className={isMenuOpen ? "hidden md:block" : "block"}>
              <LanguageToggle 
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>

            {/* Theme Toggle - always visible on desktop, hidden when mobile menu is open */}
            <div className={isMenuOpen ? "hidden md:block" : "block"}>
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">{isMenuOpen ? t.common.cancel : t.common.actions}</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border/40 shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col space-y-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className={`justify-start text-left px-4 py-3 text-base font-medium ${
                      activeSection === section.id 
                        ? "bg-secondary text-secondary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => handleSectionChange(section.id)}
                  >
                    {section.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
