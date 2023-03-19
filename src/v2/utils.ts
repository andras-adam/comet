import { BASE_URL } from '../utils'

export function isValidPathname(value?: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    new URLPattern(value, BASE_URL)
    return true
  } catch (error) {
    return false
  }
}

export function isValidMethod(value?: unknown): boolean {
  return typeof value === 'string' // TODO check more
}

export function isValidCompatibilityDate(value?: unknown): boolean {
  return typeof value === 'string' && !Number.isNaN(new Date(value).valueOf())
}
