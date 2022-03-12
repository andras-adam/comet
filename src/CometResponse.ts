export type IBody = Record<string, unknown>;

export interface ICometResponse {
  statusCode: number;
  body?: IBody;
}
