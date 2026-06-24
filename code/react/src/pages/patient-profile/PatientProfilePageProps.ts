import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface PatientProfilePageProps extends BlockOwnProps {
  isDataTab?: boolean;
  isAppointmentsTab?: boolean;
}
