import { describe, expect, it, vi } from "vitest";
import { Store } from "@shared/lib/store/Store";

interface CounterState {
  count: number;
  label: string;
}

function buildStore(): Store<CounterState> {
  return new Store<CounterState>({ count: 0, label: "inicial" });
}

describe("Store observable de estado global [US-API-01]", () => {
  it("expone el estado inicial [AC-1]", () => {
    const store = buildStore();

    expect(store.getState()).toEqual({ count: 0, label: "inicial" });
  });

  it("combina el estado parcial al actualizar [AC-1]", () => {
    const store = buildStore();

    store.setState({ count: 5 });

    expect(store.getState()).toEqual({ count: 5, label: "inicial" });
  });

  it("notifica a los suscriptores con el nuevo estado [AC-2]", () => {
    const store = buildStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 1 });

    expect(listener).toHaveBeenCalledWith({ count: 1, label: "inicial" });
  });

  it("deja de notificar tras cancelar la suscripción [AC-2]", () => {
    const store = buildStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setState({ count: 2 });

    expect(listener).not.toHaveBeenCalled();
  });
});
