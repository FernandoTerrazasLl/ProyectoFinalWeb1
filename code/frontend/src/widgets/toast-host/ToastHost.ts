import { Block } from "@shared/lib/block/Block";
import type { ToastHostProps } from "@widgets/toast-host/ToastHostProps";
import { toastStore } from "@shared/lib/toast/toastStore";
import toastHostTemplate from "@widgets/toast-host/ToastHost.hbs?raw";
import "@widgets/toast-host/ToastHost.css";

export class ToastHost extends Block<ToastHostProps> {
  protected template = toastHostTemplate;
  private unsubscribe: (() => void) | undefined;

  protected componentDidMount() {
    this.unsubscribe = toastStore.subscribe((state) => this.setProps({ toasts: state.toasts }));
  }

  protected componentWillUnmount() {
    this.unsubscribe?.();
  }
}
