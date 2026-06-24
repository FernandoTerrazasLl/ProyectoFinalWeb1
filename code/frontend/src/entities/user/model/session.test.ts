import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applySession } from "@entities/user/model/applySession";
import { saveSession } from "@entities/user/model/saveSession";
import { loadStoredSession } from "@entities/user/model/loadStoredSession";
import { clearStoredSession } from "@entities/user/model/clearStoredSession";
import { hasActiveSession } from "@entities/user/model/hasActiveSession";
import { isProvider } from "@entities/user/model/isProvider";
import { sessionStore } from "@entities/user/model/sessionStore";
import type { AuthSession } from "@entities/user/api/AuthSession";

const STORAGE_KEY = "curamente.session";

function buildSession(role: "PATIENT" | "PROVIDER" = "PATIENT"): AuthSession {
  return {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    user: { id: "ana@correo.com", name: "ana@correo.com", email: "ana@correo.com", role },
  };
}

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

beforeEach(() => {
  globalThis.localStorage = createMemoryStorage();
  sessionStore.setState({ accessToken: null, user: null, role: "guest" });
});

afterEach(() => {
  sessionStore.setState({ accessToken: null, user: null, role: "guest" });
});

describe("Persistencia de la sesión [US-AUTH-02]", () => {
  it("guarda la sesión en el almacenamiento local [AC-1]", () => {
    const session = buildSession();

    saveSession(session);

    expect(localStorage.getItem(STORAGE_KEY)).toContain("access-token");
  });

  it("recupera la sesión guardada [AC-1]", () => {
    saveSession(buildSession());

    const stored = loadStoredSession();

    expect(stored?.accessToken).toBe("access-token");
  });

  it("devuelve null cuando no hay sesión guardada [AC-2]", () => {
    const stored = loadStoredSession();

    expect(stored).toBeNull();
  });

  it("devuelve null cuando la sesión guardada está corrupta [AC-2]", () => {
    localStorage.setItem(STORAGE_KEY, "{ no es json");

    const stored = loadStoredSession();

    expect(stored).toBeNull();
  });

  it("elimina la sesión al cerrar sesión [AC-3]", () => {
    saveSession(buildSession());

    clearStoredSession();

    expect(loadStoredSession()).toBeNull();
  });
});

describe("Estado global de la sesión [US-AUTH-02]", () => {
  it("aplica la sesión al store y la persiste [AC-1]", () => {
    applySession(buildSession("PATIENT"));

    expect(sessionStore.getState().role).toBe("PATIENT");
    expect(loadStoredSession()?.accessToken).toBe("access-token");
  });

  it("reconoce una sesión activa cuando hay token de acceso [AC-2]", () => {
    applySession(buildSession());

    expect(hasActiveSession()).toBe(true);
  });

  it("identifica el rol de psicólogo [AC-3]", () => {
    applySession(buildSession("PROVIDER"));

    expect(isProvider()).toBe(true);
  });

  it("no reconoce sesión activa sin token [AC-2]", () => {
    expect(hasActiveSession()).toBe(false);
    expect(isProvider()).toBe(false);
  });
});
