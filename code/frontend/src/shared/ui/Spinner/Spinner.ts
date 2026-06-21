import { Block } from "@shared/lib/block/Block";
import type { SpinnerProps } from "@shared/ui/Spinner/SpinnerProps";
import spinnerTemplate from "@shared/ui/Spinner/Spinner.hbs?raw";
import "@shared/ui/Spinner/Spinner.css";

export class Spinner extends Block<SpinnerProps> {
  static componentName = "Spinner";
  protected template = spinnerTemplate;

  constructor(props: SpinnerProps) {
    super({ size: "md", ...props });
  }
}
