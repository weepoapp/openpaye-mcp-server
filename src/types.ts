export type OpenPayeMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface OpenPayeConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs: number;
}

export interface OpenPayeRequestInput {
  path: string;
  method: OpenPayeMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface OpenPayeToolResult {
  endpoint: string;
  method: OpenPayeMethod;
  data: unknown;
}
