import { Logger } from './logger'


export interface CookiesOptions {
  decode?: ((arg: string) => Promise<string> | string) | null
  encode?: ((arg: string) => Promise<string> | string) | null
  limit?: number
}

export const defaultCookiesOptions: Required<CookiesOptions> = {
  decode: decodeURIComponent,
  encode: encodeURIComponent,
  limit: 64
}

export enum SameSite {
  Strict = 'Strict',
  Lax = 'Lax',
  None = 'None'
}

export interface CookieMetaData {
  domain?: string
  expires?: Date | number
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: SameSite | keyof typeof SameSite
  secure?: boolean
}

export interface Cookie {
  meta?: CookieMetaData
  name: string
  value: string
}

export class Cookies {

  private readonly data = new Map<string, Cookie>()

  get [Symbol.toStringTag]() {
    return `Cookies(${this.data.size})`
  }

  // Get a cookie by name
  public get(name: string): string | undefined {
    return this.data.get(name)?.value
  }

  // Check if a cookie exists
  public has(name: string): boolean {
    return this.data.has(name)
  }

  // Set a cookie with a name, a value and optional metadata
  public set(name: string, value: string, meta?: CookieMetaData): void {
    this.data.set(name, { name, value, ...(meta ? { meta } : {}) })
  }

  // Delete a cookie
  public delete(name: string): void {
    this.data.delete(name)
  }

  // Returns an array that contains the key-value pairs for each cookie
  public entries(): [key: string, value: string][] {
    return [ ...this.data.entries() ].map(([ name, cookie ]) => [ name, cookie.value ])
  }

  // Returns an array that contains the keys for each cookie
  public keys(): string[] {
    return [ ...this.data.keys() ]
  }

  // Returns an array that contains the values for each cookie
  public values(): string[] {
    return [ ...this.data.values() ].map(cookie => cookie.value)
  }

  // Parse cookies from headers
  public static async parse(headers: Headers, logger: Logger, options?: CookiesOptions): Promise<Cookies> {
    const allOptions = this.getAllOptions(options)
    const cookies = new Cookies()
    const pairs = headers.get('Cookie')?.split(';', allOptions.limit) ?? []
    for (const pair of pairs) {
      // Parse cookie name and value
      let [ name, value ] = pair.split('=', 2).map(component => component.trim())
      if (!name || !value) {
        logger.error(`[Comet] Failed to parse malformatted cookie "${pair}".`)
        continue
      }
      // Unwrap cookie value if it is wrapped in quotes
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      try {
        // Decode cookie name and value if a decoder function is provided
        if (allOptions.decode !== null) name = await allOptions.decode(name)
        if (allOptions.decode !== null) value = await allOptions.decode(value)
        // Set the cookie
        cookies.set(name, value)
      } catch (error) {
        logger.error(`[Comet] Failed to decode cookie "${pair}".`, error)
      }
    }
    return cookies
  }

  // Serialize cookies to headers
  public static async serialize(cookies: Cookies, headers: Headers, logger: Logger, options?: CookiesOptions): Promise<void> {
    const allOptions = this.getAllOptions(options)
    for (const cookie of cookies.data.values()) {
      const serialized: string[] = []
      try {
        // Encode cookie name and value if an encoder function is provided
        const name = allOptions.encode !== null ? await allOptions.encode(cookie.name) : cookie.name
        const value = allOptions.encode !== null ? await allOptions.encode(cookie.value) : cookie.value
        // Set the cookie
        serialized.push(`${name}=${value}`)
      } catch (error) {
        logger.error(`[Comet] Failed to encode cookie "${cookie.name}".`, error)
        continue
      }
      // Set cookie meta data
      if (cookie.meta?.domain) serialized.push(`Domain=${cookie.meta.domain}`)
      if (cookie.meta?.expires) serialized.push(`Expires=${new Date(cookie.meta.expires).toUTCString()}`)
      if (cookie.meta?.httpOnly) serialized.push('HttpOnly')
      if (cookie.meta?.maxAge) serialized.push(`Max-Age=${cookie.meta.maxAge}`)
      if (cookie.meta?.path) serialized.push(`Path=${cookie.meta.path}`)
      if (cookie.meta?.sameSite) serialized.push(`SameSite=${cookie.meta.sameSite}`)
      if (cookie.meta?.secure) serialized.push('Secure')
      // Append the cookie to the headers
      headers.append('Set-Cookie', serialized.join('; '))
    }
  }

  // Get all options with fallback to default options
  public static getAllOptions(options?: CookiesOptions): Required<CookiesOptions> {
    return { ...defaultCookiesOptions, ...options }
  }

}
