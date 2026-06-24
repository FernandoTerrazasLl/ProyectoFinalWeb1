import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { ReviewDraft } from "@features/leave-review/ui/ReviewDraft";

export interface ReviewFormProps extends BlockOwnProps {
  onSubmit: (draft: ReviewDraft) => void;
  submitted?: boolean;
}
