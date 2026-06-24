import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { ProviderProfileDraft } from "@entities/psychologist";

export interface EditProviderProfileProps extends BlockOwnProps {
  draft: ProviderProfileDraft;
  saved?: boolean;
}
