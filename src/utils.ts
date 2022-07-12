// Get an array or CSV as an array
export function parseListValue(value: string | string[]) {
  return Array.isArray(value) ? value : value.split(',').map(s => s.trim())
}

// Check if a pathname matches a pattern
export function checkPathname(pathname: string, pattern: string): boolean {
  const BASE_URL = 'https://comet'
  return new URLPattern(pattern, BASE_URL).test(pathname, BASE_URL)
}
