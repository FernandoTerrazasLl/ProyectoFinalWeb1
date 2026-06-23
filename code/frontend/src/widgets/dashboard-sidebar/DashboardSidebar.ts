import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { DashboardSidebarProps } from "@widgets/dashboard-sidebar/DashboardSidebarProps";
import dashboardSidebarTemplate from "@widgets/dashboard-sidebar/DashboardSidebar.hbs?raw";
import "@widgets/dashboard-sidebar/DashboardSidebar.css";

export class DashboardSidebar extends Block<DashboardSidebarProps> {
  protected template = dashboardSidebarTemplate;
  protected events: EventListType = {
    click: (event) => {
      const target = event.target as Element;

      if (target.closest(".dashboard-sidebar-shell__toggle"))
        this.setProps({ isOpen: true });
      if (target.closest(".dashboard-sidebar-shell__close") || target.closest(".dashboard-sidebar-shell__scrim"))
        this.setProps({ isOpen: false });
    },
  };

  constructor(props: DashboardSidebarProps) {
    super({
      ...props,
      isSchedule: props.active === "schedule",
      isProfile: props.active === "profile",
      isOpen: false,
    });
  }
}
