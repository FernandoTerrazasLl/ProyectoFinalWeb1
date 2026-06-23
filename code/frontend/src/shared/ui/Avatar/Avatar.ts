import { Block } from "@shared/lib/block/Block";
import type { AvatarProps } from "@shared/ui/Avatar/AvatarProps";
import avatarTemplate from "@shared/ui/Avatar/Avatar.hbs?raw";
import "@shared/ui/Avatar/Avatar.css";

const PIXEL_SIZES: Record<"sm" | "md" | "lg", number> = {
  sm: 32,
  md: 48,
  lg: 152,
};

function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export class Avatar extends Block<AvatarProps> {
  static componentName = "Avatar";
  protected template = avatarTemplate;

  constructor(props: AvatarProps) {
    const size = props.size ?? "md";

    super({ size, pixelSize: PIXEL_SIZES[size], ...props, initials: props.initials ? toInitials(props.initials) : "" });
  }
}
