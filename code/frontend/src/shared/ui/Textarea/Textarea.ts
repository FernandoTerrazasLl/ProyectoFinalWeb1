import { Block } from "@shared/lib/block/Block";
import type { TextareaProps } from "@shared/ui/Textarea/TextareaProps";
import textareaTemplate from "@shared/ui/Textarea/Textarea.hbs?raw";
import "@shared/ui/Textarea/Textarea.css";

export class Textarea extends Block<TextareaProps> {
  static componentName = "Textarea";
  protected template = textareaTemplate;

  constructor(props: TextareaProps) {
    super({ rows: 4, ...props });
  }
}
