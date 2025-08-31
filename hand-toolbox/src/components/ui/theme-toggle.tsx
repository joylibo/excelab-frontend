import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
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

  const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  const getCurrentIcon = () => {
    if (theme === "system") return <Monitor className="h-4 w-4" />
    if (resolvedTheme === "dark") return <Moon className="h-4 w-4" />
    return <Sun className="h-4 w-4" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getCurrentIcon()}
        <span className="sr-only">切换主题</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleThemeChange("system")}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Monitor className="mr-2 h-4 w-4" />
              <span>跟随系统</span>
            </button>
            <button
              onClick={() => handleThemeChange("light")}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>浅色模式</span>
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>深色模式</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
