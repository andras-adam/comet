import http from 'node:http';
import getRawBody from 'raw-body';
import { match } from 'path-to-regexp';
import { ICometRequest, IParams } from './CometRequest';
import { ICometResponse, IResponder, Responder } from './CometResponse';

export type NextFunction = () => unknown;

export type Handler = (request: ICometRequest, response: IResponder, next: NextFunction) => unknown;

export class Comet {

  private routes: Record<string, Record<string, Handler[]>> = {};

  public all(path: string, ...handlers: Handler[]) {
    this.registerRoute('ALL', path, handlers);
  }

  public get(path: string, ...handlers: Handler[]) {
    this.registerRoute('GET', path, handlers);
  }

  public post(path: string, ...handlers: Handler[]) {
    this.registerRoute('POST', path, handlers);
  }

  public delete(path: string, ...handlers: Handler[]) {
    this.registerRoute('DELETE', path, handlers);
  }

  public use(path: string, ...handlers: Handler[]) {
    this.registerRoute('ALL', path + '(.*)', handlers);
  }

  // Register a new route
  private registerRoute(method: string, path: string, handlers: Handler[]) {
    const safePath = path.startsWith('/') ? path : '/' + path;
    if (!this.routes[safePath]) this.routes[safePath] = {};
    if (!this.routes[safePath][method]) this.routes[safePath][method] = [];
    this.routes[safePath][method].push(...handlers);
  }

  // Reset the router and unset all routes
  public reset() {
    this.routes = {};
  }

  // Handle incoming requests and return responses
  private async handle(request: ICometRequest): Promise<ICometResponse> {
    const responder = new Responder();
    let handlerCount = 0;
    for (const route in this.routes) {
      const matches = match<IParams>(route)(request.path);
      if (!matches) continue;
      if (!this.routes[route][request.method] && !this.routes[route]['ALL']) {
        const allow = Object.keys(this.routes[route]).join(',');
        return responder.notAcceptable({ success: false }, { allow });
      } else {
        request.params = Object.assign({}, matches.params);
        for (const method in this.routes[route]) {
          if (method !== request.method && method !== 'ALL') continue;
          for (const handler of this.routes[route][method]) {
            const response = await new Promise<ICometResponse | undefined>(resolve => {
              responder.resolver = resolve;
              handler(request, responder, () => resolve(undefined));
            });
            handlerCount++;
            if (response) return response;
          }
        }
      }
    }
    if (handlerCount) {
      return responder.internalServerError({ success: false, message: 'No response was returned from any handlers.' });
    } else {
      return responder.notFound({ success: false, message: 'Route not found.' });
    }
  }

  // HTTP request/response parser
  public http(port: number) {
    return http.createServer(async (req, res) => {
      let body: any;
      switch (req.headers['content-type']) {
        case 'application/json': {
          const raw = await getRawBody(req, { encoding: 'utf-8' });
          body = JSON.parse(raw);
          break;
        }
        default: {
          body = undefined;
          break;
        }
      }
      const url = new URL(req.url as string, `http://${req.headers.host}`);
      const request: ICometRequest = {
        method: req.method as string,
        path: url.pathname,
        headers: req.headers,
        query: Object.fromEntries(url.searchParams.entries()),
        params: {},
        body,
      };
      const response = await this.handle(request);
      res.statusCode = response.statusCode;
      if (response.headers) {
        Object.entries(response.headers).forEach(([name, value]) => res.setHeader(name, value));
      }
      if (response.body) {
        res.setHeader('content-type', 'application/json');
        res.write(JSON.stringify(response.body));
      }
      res.end();
    }).listen(port);
  }

}

export const comet = () => new Comet();
