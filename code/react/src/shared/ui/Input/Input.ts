import { Block } from "@shared/lib/block/Block";
import type { InputProps } from "@shared/ui/Input/InputProps";
import inputTemplate from "@shared/ui/Input/Input.hbs?raw";
import "@shared/ui/FormControl/FormControl.css";

export class Input extends Block<InputProps> {
  static componentName = "Input";
  protected template = inputTemplate;

  constructor(props: InputProps) {
    super({ type: "text", ...props });
  }
}
