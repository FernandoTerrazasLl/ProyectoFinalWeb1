import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { HeaderProps } from "@widgets/header/HeaderProps";
import { sessionStore, logoutUser, clearStoredSession } from "@entities/user";
import { routerInstance } from "@shared/lib/router/routerInstance";
import headerTemplate from "@widgets/header/Header.hbs?raw";
import "@widgets/header/Header.css";

export class Header extends Block<HeaderProps> {
  protected template = headerTemplate;
  private unsubscribe: (() => void) | undefined;
  private closeOnOutsideClick = (event: MouseEvent) => {
    if (this.props.menuOpen && !(event.target as Element).closest(".header__profile"))
      this.setProps({ menuOpen: false });
  };

  protected events: EventListType = {
    click: (event) => this.handleClick(event),
  };

  constructor(props: HeaderProps = {}) {
    const initialState = sessionStore.getState();
    super({ 
      ...props, 
      userName: initialState.user?.name ?? null, 
      isProvider: initialState.role === "PROVIDER" 
    });
  }

  protected componentDidMount() {
    this.unsubscribe = sessionStore.subscribe((state) =>
      this.setProps({ userName: state.user?.name ?? null, isProvider: state.role === "PROVIDER" }),
    );
    document.addEventListener("mousedown", this.closeOnOutsideClick);
  }

  protected componentWillUnmount() {
    this.unsubscribe?.();
    document.removeEventListener("mousedown", this.closeOnOutsideClick);
  }

  private handleClick(event: Event) {
    const target = event.target as Element;

    if (target.closest(".header__logout")) {
      void this.logout();
      return;
    }
    if (target.closest(".header__avatar")) {
      this.setProps({ menuOpen: !this.props.menuOpen });
      return;
    }
    if (target.closest(".header__menu-item"))
      this.setProps({ menuOpen: false });
  }

  private async logout() {
    await logoutUser();
    clearStoredSession();
    sessionStore.setState({ accessToken: null, user: null, role: "guest" });
    routerInstance.navigate("/auth");
  }
}
