import { Ok, Err, Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class HttpClient {
  private readonly baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<Result<T, HttpError>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
    };

    const init: RequestInit = {
      method,
      headers,
      ...(signal ? { signal } : {}),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };

    const sent = await Result.wrapAsync(() => fetch(`${this.baseUrl}${path}`, init));

    if (sent.isErr()) 
      return Err({ status: 0, message: "network_error" });

    const response = sent.value;

    if (!response.ok) 
      return Err({ status: response.status, message: response.statusText });
    if (response.status === 204) 
      return Ok(undefined as T);

    const parsed = await Result.wrapAsync<T>(() => response.json());
    
    return parsed.isErr()
      ? Err({ status: response.status, message: "invalid_json" })
      : Ok(parsed.value);
  }
}
