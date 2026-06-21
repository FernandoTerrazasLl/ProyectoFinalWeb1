import { Block } from "@shared/lib/block/Block";
import type { HeaderProps } from "@widgets/header/HeaderProps";
import { sessionStore } from "@entities/user";
import headerTemplate from "@widgets/header/Header.hbs?raw";
import "@widgets/header/Header.css";

export class Header extends Block<HeaderProps> {
  protected template = headerTemplate;
  private unsubscribe: (() => void) | undefined;

  protected componentDidMount() {
    this.unsubscribe = sessionStore.subscribe((state) => this.setProps({ userName: state.user?.name ?? null }));
  }

  protected componentWillUnmount() {
    this.unsubscribe?.();
  }
}
