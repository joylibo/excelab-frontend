import type { Language, Translation } from './types';
import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { en } from './en';
import { ja } from './ja';

// 多语言翻译数据
const translations: Record<Language, Translation> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  "en": en,
  "ja": ja
};

// 获取系统语言
export function getSystemLanguage(): Language {
  const navigatorLanguage = navigator.language;
  if (navigatorLanguage.startsWith('zh-CN')) return 'zh-CN';
  if (navigatorLanguage.startsWith('zh-TW') || navigatorLanguage.startsWith('zh-HK')) return 'zh-TW';
  if (navigatorLanguage.startsWith('ja')) return 'ja';
  return 'en';
}

// 获取语言偏好
export function getLanguagePreference(): Language | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('language');
  if (saved && ['zh-CN', 'zh-TW', 'en', 'ja'].includes(saved)) {
    return saved as Language;
  }
  return null;
}

// 保存语言偏好
export function saveLanguagePreference(language: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', language);
}

// 获取翻译对象
export function getTranslation(language: Language): Translation {
  return translations[language] || translations["zh-CN"];
}

export type { Language, Translation };
