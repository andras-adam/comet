import { Cookies } from './cookies'
import type { Method, Options } from './types'
import type { Logger } from './logger'


export class Data {

  private constructor(
    public readonly method: Method,
    public readonly pathname: string,
    public readonly hostname: string,
    public readonly headers: Headers,
    public readonly cookies: Cookies,
    public query: unknown,
    public params: unknown,
    public body: unknown,
    public readonly server: { name?: string }
  ) {}

  public static async fromRequest(request: Request, options: Options, logger: Logger, serverName?: string): Promise<Data> {
    const url = new URL(request.url)
    return new Data(
      request.method.toUpperCase() as Method,
      url.pathname,
      url.hostname.toLowerCase(),
      request.headers,
      await Cookies.parse(request.headers, logger, options.cookies),
      Object.fromEntries(url.searchParams.entries()),
      {},
      await this.parseRequestBody(request),
      { name: serverName }
    )
  }

  private static async parseRequestBody(request: Request): Promise<unknown> {
    const contentType = request.headers.get('content-type')?.split(';')[0]
    switch (contentType) {
      case 'application/json':
        return await request.json()
      case 'multipart/form-data': {
        const formData = await request.formData()
        return Object.fromEntries(formData.entries())
      }
      case 'application/x-www-form-urlencoded': {
        const text = await request.text()
        const entries = text.split('&').map(x => x.split('=').map(decodeURIComponent))
        return Object.fromEntries(entries)
      }
      default:
        return
    }
  }

}
