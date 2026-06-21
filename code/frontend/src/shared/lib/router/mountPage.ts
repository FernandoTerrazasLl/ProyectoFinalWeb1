import type { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { RoutePage } from "@shared/lib/router/RoutePage";

export function mountPage<Props extends BlockOwnProps>(
  PageBlock: new (props: Props) => Block<Props>,
  props: Props,
): RoutePage {
  return {
    mount(root) {
      const element = new PageBlock(props).element();
      
      if (element) 
        root.replaceChildren(element);
    },
  };
}
