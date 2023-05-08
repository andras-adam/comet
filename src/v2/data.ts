import { Options } from './types'
import { Cookies } from './cookies'
import { Logger } from './logger'

export class Data {

  private constructor(
    public readonly method: string,
    public readonly pathname: string,
    public readonly hostname: string,
    public readonly headers: Headers,
    public readonly cookies: Cookies,
    public query: unknown,
    public params: unknown,
    public body: unknown
  ) {}

  public static async fromRequest(request: Request, options: Options, logger: Logger): Promise<Data> {
    const url = new URL(request.url)
    return new Data(
      request.method.toUpperCase(),
      url.pathname,
      url.hostname.toLowerCase(),
      request.headers,
      await Cookies.parse(request.headers, logger, options.cookies),
      Object.fromEntries(url.searchParams.entries()),
      {},
      await this.parseRequestBody(request)
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
