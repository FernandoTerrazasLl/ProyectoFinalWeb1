import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { TagProps } from "@shared/ui/Tag/TagProps";
import tagTemplate from "@shared/ui/Tag/Tag.hbs?raw";
import "@shared/ui/Tag/Tag.css";

export class Tag extends Block<TagProps> {
  static componentName = "Tag";
  protected template = tagTemplate;
  protected events: EventListType = {
    click: (event) => {
      if ((event.target as Element).closest(".tag__remove")) 
        this.props.onRemove?.();
    },
  };
}
