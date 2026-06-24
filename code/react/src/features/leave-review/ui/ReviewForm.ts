import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { ReviewFormProps } from "@features/leave-review/ui/ReviewFormProps";
import reviewFormTemplate from "@features/leave-review/ui/ReviewForm.hbs?raw";
import "@features/leave-review/ui/ReviewForm.css";

export class ReviewForm extends Block<ReviewFormProps> {
  protected template = reviewFormTemplate;
  private rating = 0;
  protected events: EventListType = {
    click: (event) => {
      const star = (event.target as Element).closest("[data-star]");

      if (star)
        this.selectRating(Number(star.getAttribute("data-star")));
    },
    submit: (event) => {
      event.preventDefault();

      if (this.rating > 0)
        this.props.onSubmit({ rating: this.rating, comment: (this.refs.comment as HTMLTextAreaElement).value });
    },
  };

  private selectRating(value: number) {
    this.rating = value;
    const root = this.element();

    root?.querySelectorAll(".review-form__star").forEach((star, index) => {
      star.classList.toggle("review-form__star--filled", index < value);
    });

    const submit = root?.querySelector(".review-form__submit") as HTMLButtonElement | null;

    if (submit)
      submit.disabled = false;
  }
}
