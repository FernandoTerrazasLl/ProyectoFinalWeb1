import { Store } from "@shared/lib/store/Store";
import type { ToastMessage } from "@shared/lib/toast/ToastMessage";

export const toastStore = new Store<{ toasts: ToastMessage[] }>({ toasts: [] });
