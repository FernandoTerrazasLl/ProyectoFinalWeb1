import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showToast } from "@shared/lib/toast/showToast";
import { toastStore } from "@shared/lib/toast/toastStore";

beforeEach(() => {
  vi.useFakeTimers();
  toastStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Notificaciones tipo toast [US-AUTH-02]", () => {
  it("agrega un toast con el texto y el tono indicados [AC-1]", () => {
    showToast("Sesión iniciada", "success");

    const toasts = toastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.text).toBe("Sesión iniciada");
    expect(toasts[0]?.tone).toBe("success");
  });

  it("usa el tono de error por defecto [AC-1]", () => {
    showToast("Algo salió mal");

    expect(toastStore.getState().toasts[0]?.tone).toBe("error");
  });

  it("retira el toast tras agotarse su duración [AC-2]", () => {
    showToast("Mensaje temporal");

    vi.advanceTimersByTime(4000);

    expect(toastStore.getState().toasts).toHaveLength(0);
  });
});
