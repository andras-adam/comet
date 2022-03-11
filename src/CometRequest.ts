export type IBody = Record<string, unknown>;
export type IParams = Record<string, unknown>;
export type IQuery = Record<string, unknown>;
export type IHeaders = Record<string, unknown>;

export interface ICometRequest {
  path: string;
  method: string;
  body: IBody;
  query: IQuery;
  params: IParams;
  headers: IHeaders;
}
