import { Block } from "@shared/lib/block/Block";
import type { BadgeProps } from "@shared/ui/Badge/BadgeProps";
import badgeTemplate from "@shared/ui/Badge/Badge.hbs?raw";
import "@shared/ui/Badge/Badge.css";

export class Badge extends Block<BadgeProps> {
  static componentName = "Badge";
  protected template = badgeTemplate;

  constructor(props: BadgeProps) {
    super({ tone: "neutral", ...props });
  }
}
