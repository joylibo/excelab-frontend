import React, { createContext, useContext, useEffect, useState, type ReactNode, type ReactElement } from 'react'
import { type Language, getSystemLanguage, getLanguagePreference, saveLanguagePreference, getTranslation, type Translation } from '@/lib/i18n'

// 辅助函数：替换字符串中的占位符为React组件
function replaceWithReactComponents(
  text: string, 
  replacements: Record<string, ReactElement>
): (string | ReactElement)[] {
  const parts: (string | ReactElement)[] = [];
  let currentText = text;
  
  Object.entries(replacements).forEach(([key, component]) => {
    const placeholder = `{${key}}`;
    const index = currentText.indexOf(placeholder);
    
    if (index !== -1) {
      // 添加占位符前的文本
      if (index > 0) {
        parts.push(currentText.substring(0, index));
      }
      
      // 添加React组件
      parts.push(React.cloneElement(component, { key }));
      
      // 更新剩余文本
      currentText = currentText.substring(index + placeholder.length);
    }
  });
  
  // 添加剩余文本
  if (currentText.length > 0) {
    parts.push(currentText);
  }
  
  return parts;
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // 首先尝试从localStorage获取用户偏好
    const savedLanguage = getLanguagePreference()
    if (savedLanguage) {
      return savedLanguage
    }
    // 如果没有保存的偏好，使用系统语言
    return getSystemLanguage()
  })

  const [t, setT] = useState<Translation>(getTranslation(language))

  useEffect(() => {
    // 当语言改变时更新翻译
    setT(getTranslation(language))
    // 保存语言偏好
    saveLanguagePreference(language)
  }, [language])

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 导出辅助函数供其他组件使用
export { replaceWithReactComponents }
