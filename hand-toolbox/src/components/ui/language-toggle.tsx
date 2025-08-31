import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

type Language = "zh-CN" | "zh-TW" | "en" | "ja"

interface LanguageOption {
  value: Language
  label: string
  nativeName: string
}

const languageOptions: LanguageOption[] = [
  { value: "zh-CN", label: "简体中文", nativeName: "中文" },
  { value: "zh-TW", label: "繁體中文", nativeName: "中文" },
  { value: "en", label: "English", nativeName: "En" },
  { value: "ja", label: "日本語", nativeName: "日本語" }
]

interface LanguageToggleProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const getCurrentLanguage = () => {
    return languageOptions.find(option => option.value === currentLanguage) || languageOptions[0]
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Languages className="h-4 w-4" />
        <span className="sr-only">切换语言</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onLanguageChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  currentLanguage === option.value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
