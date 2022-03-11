export type IBody = Record<string, unknown>;

export interface ICometResponse {
  status: number;
  body?: IBody;
}
