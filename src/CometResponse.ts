export type IBody = Record<string, unknown>;
export type IHeaders = Record<string, string | number | string[]>;

export interface ICometResponse {
  statusCode: number;
  body?: IBody;
  headers?: IHeaders;
}
