import { toastStore } from "@shared/lib/toast/toastStore";
import type { ToastMessage } from "@shared/lib/toast/ToastMessage";

export function showToast(text: string, tone: ToastMessage["tone"] = "error", duration: number = 4000) {
  const toast: ToastMessage = { id: Date.now() + Math.random(), text, tone };
  toastStore.setState({ toasts: [...toastStore.getState().toasts, toast] });

  setTimeout(() => {
    toastStore.setState({ toasts: toastStore.getState().toasts.filter((item) => item.id !== toast.id) });
  }, duration);
}
