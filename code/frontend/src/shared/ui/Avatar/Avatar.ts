import { Block } from "@shared/lib/block/Block";
import type { AvatarProps } from "@shared/ui/Avatar/AvatarProps";
import avatarTemplate from "@shared/ui/Avatar/Avatar.hbs?raw";
import "@shared/ui/Avatar/Avatar.css";

export class Avatar extends Block<AvatarProps> {
  static componentName = "Avatar";
  protected template = avatarTemplate;

  constructor(props: AvatarProps) {
    super({ size: "md", ...props });
  }
}
