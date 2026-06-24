import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { Review } from "@entities/review";

export interface ReviewsListProps extends BlockOwnProps {
  reviews: Review[];
}
