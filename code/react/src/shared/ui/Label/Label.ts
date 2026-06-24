import { Block } from "@shared/lib/block/Block";
import type { LabelProps } from "@shared/ui/Label/LabelProps";
import labelTemplate from "@shared/ui/Label/Label.hbs?raw";
import "@shared/ui/Label/Label.css";

export class Label extends Block<LabelProps> {
  static componentName = "Label";
  protected template = labelTemplate;
}
