import { Block } from "@shared/lib/block/Block";
import type { IconProps } from "@shared/ui/Icon/IconProps";
import { iconPaths } from "@shared/ui/Icon/iconPaths";
import iconTemplate from "@shared/ui/Icon/Icon.hbs?raw";
import "@shared/ui/Icon/Icon.css";

export class Icon extends Block<IconProps> {
  static componentName = "Icon";
  protected template = iconTemplate;

  constructor(props: IconProps) {
    super({ ...props, paths: iconPaths[props.name] ?? "" });
  }
}
