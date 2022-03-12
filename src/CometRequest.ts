export type IBody = Record<string, any>;
export type IParams = Record<string, string>;
export type IQuery = Record<string, string>;
export type IHeaders = Record<string, string | string[] | undefined>;

export interface ICometRequest {
  path: string;
  method: string;
  body: IBody;
  query: IQuery;
  params: IParams;
  headers: IHeaders;
}
