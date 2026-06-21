import { Store } from "@shared/lib/store/Store";
import type { ToastState } from "@shared/lib/store/ToastState";

export const toastStore = new Store<ToastState>({ toasts: [] });
