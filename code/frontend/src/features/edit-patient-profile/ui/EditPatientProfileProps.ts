import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { PatientProfileDraft } from "@entities/user";

export interface EditPatientProfileProps extends BlockOwnProps {
  draft: PatientProfileDraft;
  saved?: boolean;
  error?: string;
}
