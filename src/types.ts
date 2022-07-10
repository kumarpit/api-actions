type Nullable<T> = T | null;

export const RSAA = '@@reax/RSAA';

export interface RSAAObject {
  path: string;
  method: HTTPMethod;
  body: object;
  onSuccess: ({ getState, dispatch }: any, res: any) => void;
  onFail: ({ getState, dispatch }: any, err: any) => void;
  types: string[];
}

export type HTTPMethod = 'get' | 'post';