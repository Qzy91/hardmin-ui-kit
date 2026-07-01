import { createContext, useContext } from 'react'

// Minimal stub so synced components (DatePicker etc.) compile in this standalone app.
// The real implementation lives in HardminCloud and provides full i18n.

const translations: Record<string, string> = {
  'common.selectDate': 'Vyberte datum',
  'common.cancel': 'Zrušit',
  'common.confirm': 'Potvrdit',
}

interface LanguageContextValue {
  language: string
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'cs',
  t: (key) => translations[key] ?? key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value: LanguageContextValue = {
    language: 'cs',
    t: (key) => translations[key] ?? key,
  }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext)
}
