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
  protected events: EventListType = {
    click: (event) => {
      if ((event.target as Element).closest(".header__logout"))
        void this.logout();
    },
  };

  protected componentDidMount() {
    this.unsubscribe = sessionStore.subscribe((state) => this.setProps({ userName: state.user?.name ?? null }));
  }

  protected componentWillUnmount() {
    this.unsubscribe?.();
  }

  private async logout() {
    await logoutUser();
    clearStoredSession();
    sessionStore.setState({ accessToken: null, user: null, role: "guest" });
    routerInstance.navigate("/auth");
  }
}
