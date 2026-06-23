import { toastStore } from "@shared/lib/toast/toastStore";
import type { ToastMessage } from "@shared/lib/toast/ToastMessage";

const TOAST_DURATION = 4000;

export function showToast(text: string, tone: ToastMessage["tone"] = "error") {
  const toast: ToastMessage = { id: Date.now() + Math.random(), text, tone };
  toastStore.setState({ toasts: [...toastStore.getState().toasts, toast] });

  setTimeout(() => {
    toastStore.setState({ toasts: toastStore.getState().toasts.filter((item) => item.id !== toast.id) });
  }, TOAST_DURATION);
}
