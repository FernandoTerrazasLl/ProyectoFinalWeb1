import { Block } from "@shared/lib/block/Block";
import type { DashboardSidebarProps } from "@widgets/dashboard-sidebar/DashboardSidebarProps";
import dashboardSidebarTemplate from "@widgets/dashboard-sidebar/DashboardSidebar.hbs?raw";
import "@widgets/dashboard-sidebar/DashboardSidebar.css";

export class DashboardSidebar extends Block<DashboardSidebarProps> {
  protected template = dashboardSidebarTemplate;

  constructor(props: DashboardSidebarProps) {
    super({
      ...props,
      isSchedule: props.active === "schedule",
      isProfile: props.active === "profile",
    });
  }
}
