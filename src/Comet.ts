import http from 'http';
import getRawBody from 'raw-body';
import { ICometRequest } from './CometRequest';
import { ICometResponse } from './CometResponse';

export type NextFunction = () => unknown;

export type Handler = (request: ICometRequest, response: ICometResponse, next: NextFunction) => unknown;

export class Comet {

  // Handle incoming requests and return responses
  private async handle(request: ICometRequest): Promise<ICometResponse> {
    console.log(request.body);
    return { statusCode: 200, body: { ok: true } };
  }

  // HTTP request/response parser
  public http(port: number) {
    http.createServer(async (req, res) => {
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
      if (response.body) {
        res.setHeader('content-type', 'application/json');
        res.write(JSON.stringify(response.body));
      }
      res.end();
    }).listen(port);
  }

}

export const comet = () => new Comet();
