import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { GenderSelectProps } from "@shared/ui/GenderSelect/GenderSelectProps";
import genderSelectTemplate from "@shared/ui/GenderSelect/GenderSelect.hbs?raw";
import "@shared/ui/GenderSelect/GenderSelect.css";

export class GenderSelect extends Block<GenderSelectProps> {
  static componentName = "GenderSelect";
  protected template = genderSelectTemplate;
  protected events: EventListType = {
    click: (event) => {
      const option = (event.target as Element).closest("[data-option]");

      if (option)
        this.select(option.getAttribute("data-option") ?? "");
    },
  };

  protected componentDidMount() {
    this.highlight(this.props.value ?? "");
  }

  private select(value: string) {
    (this.element() as HTMLElement).dataset.value = value;
    this.highlight(value);
    this.element()?.dispatchEvent(new Event("input", { bubbles: true }));
  }

  private highlight(value: string) {
    this.element()
      ?.querySelectorAll("[data-option]")
      .forEach((option) =>
        option.classList.toggle("gender-select__option--active", option.getAttribute("data-option") === value),
      );
  }
}
