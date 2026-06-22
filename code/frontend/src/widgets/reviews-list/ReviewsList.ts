import { Block } from "@shared/lib/block/Block";
import type { ReviewsListProps } from "@widgets/reviews-list/ReviewsListProps";
import reviewsListTemplate from "@widgets/reviews-list/ReviewsList.hbs?raw";
import "@widgets/reviews-list/ReviewsList.css";

export class ReviewsList extends Block<ReviewsListProps> {
  protected template = reviewsListTemplate;
}
