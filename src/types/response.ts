export interface ApiResponse<TData = undefined> {
  success: boolean;
  message: string;
  data?: TData;
  error?: {
    message: string;
  } | null;
}

export interface ControllerResponse<TData = undefined> {
  statusCode: number;
  body: ApiResponse<TData>;
}
