import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface DashboardSidebarProps extends BlockOwnProps {
  active: "schedule" | "profile" | "configuration";
  isSchedule?: boolean;
  isProfile?: boolean;
  isConfiguration?: boolean;
  isOpen?: boolean;
}
