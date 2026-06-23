import { Ok, Err, Result } from "ts-results-es";
import type { HttpError } from "@shared/api/HttpError";
import type { HttpMethod } from "@shared/api/HttpMethod";

export class HttpClient {
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private onAccessTokenRefreshed: ((token: string) => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  setOnAccessTokenRefreshed(listener: (token: string) => void) {
    this.onAccessTokenRefreshed = listener;
  }

  request<T>(method: HttpMethod, path: string, body?: unknown, signal?: AbortSignal): Promise<Result<T, HttpError>> {
    return this.send<T>(method, path, body, signal, true);
  }

  private async send<T>(
    method: HttpMethod,
    path: string,
    body: unknown,
    signal: AbortSignal | undefined,
    allowRefresh: boolean,
  ): Promise<Result<T, HttpError>> {
    const init: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      },
      ...(signal ? { signal } : {}),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };

    const sent = await Result.wrapAsync(() => fetch(`${this.baseUrl}${path}`, init));

    if (sent.isErr())
      return Err({ status: 0, message: "network_error" });

    const response = sent.value;

    if (response.status === 401 && allowRefresh && (await this.refreshAccessToken()))
      return this.send<T>(method, path, body, signal, false);
    if (!response.ok) {
      const errorBody = await Result.wrapAsync<{ detail?: string }>(() => response.json());
      const detail = errorBody.isOk() && typeof errorBody.value.detail === "string"
        ? errorBody.value.detail
        : response.statusText;
      return Err({ status: response.status, message: detail });
    }
    if (response.status === 204)
      return Ok(undefined as T);

    const parsed = await Result.wrapAsync<T>(() => response.json());

    return parsed.isErr() 
      ? Err({ status: response.status, message: "invalid_json" }) 
      : Ok(parsed.value);
  }

  async logout(): Promise<boolean> {
    if (!this.refreshToken)
      return false;

    const sent = await Result.wrapAsync(() =>
      fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Refresh-Token": this.refreshToken as string },
      }),
    );

    this.accessToken = null;
    this.refreshToken = null;

    return sent.isOk() && sent.value.ok;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken)
      return false;

    const sent = await Result.wrapAsync(() =>
      fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Refresh-Token": this.refreshToken as string },
      }),
    );

    if (sent.isErr() || !sent.value.ok)
      return false;

    const parsed = await Result.wrapAsync<{ access_token: string }>(() => sent.value.json());

    if (parsed.isErr())
      return false;

    this.accessToken = parsed.value.access_token;
    this.onAccessTokenRefreshed?.(parsed.value.access_token);

    return true;
  }
}
