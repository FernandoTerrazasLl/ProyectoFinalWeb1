import { toastStore } from "@shared/lib/toast/toastStore";
import { useStore } from "@shared/lib/store/useStore";
import "@widgets/toast-host/ToastHost.css";

export function ReactToastHost() {
  const { toasts } = useStore(toastStore);

  return (
    <div className="toast-host">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.tone}`} role="status" key={toast.id}>
          {toast.text}
        </div>
      ))}
    </div>
  );
}
