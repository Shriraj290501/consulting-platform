export interface IApiMeta {
  timestamp: string;
  version: string;
}

export interface IApiResponse<T> {
  data: T;
  meta: IApiMeta;
}

export interface IApiError {
  error: {
    code: string;
    message: string;
  };
  meta: IApiMeta;
}
