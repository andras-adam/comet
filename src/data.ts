import { trace } from '@opentelemetry/api'
import { Cookies } from './cookies'
import type { Method, Options } from './types'


export class Data {

  private constructor(
    public readonly request: Request,
    public readonly method: Method,
    public readonly pathname: string,
    public readonly hostname: string,
    public readonly headers: Headers,
    public readonly cookies: Cookies,
    public query: unknown,
    public params: unknown,
    public body: unknown,
    public _raw: unknown | undefined,
    public readonly server: { name?: string }
  ) {}

  public static async fromRequest(request: Request, options: Options, serverName?: string): Promise<Data> {
    const url = new URL(request.url)
    const { raw, body } = await this.parseRequestBody(request)
    return new Data(
      request,
      request.method.toUpperCase() as Method,
      url.pathname,
      url.hostname.toLowerCase(),
      request.headers,
      await Cookies.parse(request.headers, options.cookies),
      Object.fromEntries(url.searchParams.entries()),
      {},
      body,
      raw,
      { name: serverName }
    )
  }

  private static async parseRequestBody(request: Request): Promise<{ raw?: unknown; body: unknown }> {
    const contentType = request.headers.get('content-type')?.split(';')[0]
    switch (contentType) {
      case 'application/json': {
        const text = await request.text()
        return { raw: text, body: JSON.parse(text) }
      }
      case 'multipart/form-data': {
        const formData = await request.formData()
        return { body: Object.fromEntries(formData.entries()) }
      }
      case 'application/x-www-form-urlencoded': {
        const text = await request.text()
        const entries = text.split('&').map(x => x.split('=').map(decodeURIComponent))
        return { body: Object.fromEntries(entries) }
      }
      default:
        return { body: undefined }
    }
  }

}
