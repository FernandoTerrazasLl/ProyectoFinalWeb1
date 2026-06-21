import { Block } from "@shared/lib/block/Block";
import type { StarRatingProps } from "@shared/ui/StarRating/StarRatingProps";
import starRatingTemplate from "@shared/ui/StarRating/StarRating.hbs?raw";
import "@shared/ui/StarRating/StarRating.css";

export class StarRating extends Block<StarRatingProps> {
  static componentName = "StarRating";
  protected template = starRatingTemplate;
}
