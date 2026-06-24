import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { ButtonProps } from "@shared/ui/Button/ButtonProps";
import buttonTemplate from "@shared/ui/Button/Button.hbs?raw";
import "@shared/ui/Button/Button.css";

export class Button extends Block<ButtonProps> {
  static componentName = "Button";
  protected template = buttonTemplate;
  protected events: EventListType = {
    click: (event) => this.props.onClick?.(event),
  };

  constructor(props: ButtonProps) {
    super({ variant: "primary", ...props });
  }
}
