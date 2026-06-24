import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpClient } from "@shared/api/HttpClient";

interface FakeResponseInit {
  ok: boolean;
  status: number;
  statusText?: string;
  json?: () => Promise<unknown>;
}

function fakeResponse(init: FakeResponseInit) {
  return {
    ok: init.ok,
    status: init.status,
    statusText: init.statusText ?? "",
    json: init.json ?? (() => Promise.resolve({})),
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe("Cliente HTTP: peticiones exitosas [US-API-01]", () => {
  it("devuelve el cuerpo parseado en una respuesta correcta [AC-1]", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, status: 200, json: () => Promise.resolve({ id: "p1" }) }));
    const client = new HttpClient("/api");

    const result = await client.request("GET", "/psychologists/p1");

    expect(fetchMock).toHaveBeenCalledWith("/api/psychologists/p1", expect.objectContaining({ method: "GET" }));
    expect(result.unwrap()).toEqual({ id: "p1" });
  });

  it("no incluye encabezado de autorización sin token [AC-2]", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, status: 200 }));
    const client = new HttpClient("/api");

    await client.request("GET", "/specialties/");

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("incluye el token Bearer y serializa el cuerpo cuando hay sesión [AC-2]", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, status: 200 }));
    const client = new HttpClient("/api");
    client.setTokens("access-1", "refresh-1");

    await client.request("POST", "/appointments/", { time: "08:00" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer access-1");
    expect(init.body).toBe(JSON.stringify({ time: "08:00" }));
  });

  it("devuelve Ok vacío en una respuesta 204 [AC-3]", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, status: 204 }));
    const client = new HttpClient("/api");

    const result = await client.request("PATCH", "/appointments/a1/cancel");

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
  });
});

describe("Cliente HTTP: manejo de errores [US-API-01]", () => {
  it("usa el detalle del backend como mensaje de error [AC-1]", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: false, status: 400, json: () => Promise.resolve({ detail: "Datos inválidos" }) }),
    );
    const client = new HttpClient("/api");

    const result = await client.request("POST", "/appointments/");

    expect(result.unwrapErr()).toEqual({ status: 400, message: "Datos inválidos" });
  });

  it("recurre al statusText cuando el cuerpo de error no es JSON [AC-2]", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: false, status: 500, statusText: "Server Error", json: () => Promise.reject(new Error("x")) }),
    );
    const client = new HttpClient("/api");

    const result = await client.request("GET", "/psychologists/");

    expect(result.unwrapErr().message).toBe("Server Error");
  });

  it("reporta error de red cuando fetch falla [AC-3]", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    const client = new HttpClient("/api");

    const result = await client.request("GET", "/psychologists/");

    expect(result.unwrapErr()).toEqual({ status: 0, message: "network_error" });
  });

  it("reporta JSON inválido en una respuesta correcta [AC-4]", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: true, status: 200, json: () => Promise.reject(new Error("bad json")) }),
    );
    const client = new HttpClient("/api");

    const result = await client.request("GET", "/psychologists/");

    expect(result.unwrapErr().message).toBe("invalid_json");
  });
});

describe("Cliente HTTP: refresco de token [US-AUTH-02]", () => {
  it("renueva el token tras un 401 y reintenta la petición [AC-1]", async () => {
    fetchMock
      .mockResolvedValueOnce(fakeResponse({ ok: false, status: 401 }))
      .mockResolvedValueOnce(fakeResponse({ ok: true, status: 200, json: () => Promise.resolve({ access_token: "access-2" }) }))
      .mockResolvedValueOnce(fakeResponse({ ok: true, status: 200, json: () => Promise.resolve({ data: 1 }) }));
    const client = new HttpClient("/api");
    client.setTokens("access-1", "refresh-1");
    const onRefreshed = vi.fn();
    client.setOnAccessTokenRefreshed(onRefreshed);

    const result = await client.request("GET", "/me/appointments");

    expect(result.unwrap()).toEqual({ data: 1 });
    expect(onRefreshed).toHaveBeenCalledWith("access-2");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("devuelve el error 401 cuando no hay token de refresco [AC-2]", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 401, json: () => Promise.resolve({ detail: "expirado" }) }));
    const client = new HttpClient("/api");

    const result = await client.request("GET", "/me/appointments");

    expect(result.unwrapErr().status).toBe(401);
  });
});

describe("Cliente HTTP: cierre de sesión [US-AUTH-02]", () => {
  it("cierra sesión enviando el refresh token y limpia las credenciales [AC-1]", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: true, status: 200 }));
    const client = new HttpClient("/api");
    client.setTokens("access-1", "refresh-1");

    const ok = await client.logout();

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ method: "POST" }));
  });

  it("no intenta cerrar sesión sin token de refresco [AC-2]", async () => {
    const client = new HttpClient("/api");

    const ok = await client.logout();

    expect(ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
