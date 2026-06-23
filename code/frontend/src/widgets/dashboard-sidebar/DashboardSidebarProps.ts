import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface DashboardSidebarProps extends BlockOwnProps {
  active: "schedule" | "profile";
  isSchedule?: boolean;
  isProfile?: boolean;
  isOpen?: boolean;
}
