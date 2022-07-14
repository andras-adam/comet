import { Params } from './types'


// Base URL for URLPattern pathname testing, the actual value is irrelevant
export const BASE_URL = 'https://comet'

// Parse an array or CSV to an array
export function parseListValue(value: string | string[]) {
  return Array.isArray(value) ? value : value.split(',').map(s => s.trim())
}

}
