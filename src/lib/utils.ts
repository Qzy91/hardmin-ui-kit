import { clsx, type ClassValue } from 'clsx'
import type { Locale } from 'date-fns'
import { cs, enUS } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const localeMap: Record<string, Locale> = {
  cs,
  en: enUS,
}
