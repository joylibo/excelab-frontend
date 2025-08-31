import * as React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import { Search, ChevronDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchableSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: string[]
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "搜索并选择...",
  options,
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setSearchTerm("")
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm("")
    }
  }

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLabel = value || placeholder

  // 计算下拉框位置
  const calculatePosition = () => {
    if (!triggerRef.current) return {}
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    // 如果下方空间不足，则向上弹出
    if (triggerRect.bottom + 300 > viewportHeight - 20) {
      return { bottom: '100%', top: 'auto' }
    } else {
      return { top: '100%', bottom: 'auto' }
    }
  }

  const position = calculatePosition()

  return (
    <div className={cn("relative", className)}>
      {/* 触发按钮 */}
      <Button
        ref={triggerRef}
        variant="outline"
        className="w-full justify-between"
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* 下拉框 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80"
          style={position}
        >
          {/* 搜索输入框 */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索字段..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          {/* 选项列表 - 添加上下内边距避免与边框重叠 */}
          <div className="max-h-64 overflow-y-auto pt-1 pb-1 px-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-3 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === option && "bg-accent text-accent-foreground",
                    index < filteredOptions.length - 1 && "mb-1" // 为选项之间添加间距
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {/* Check图标 - 选中的选项显示 */}
                  {value === option && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {option}
                </div>
              ))
            ) : (
              <div className="py-8 px-2 text-center text-sm text-muted-foreground">
                未找到匹配的字段
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
