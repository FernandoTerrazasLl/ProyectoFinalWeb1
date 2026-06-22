import type { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { RoutePage } from "@shared/lib/router/RoutePage";

export function mountPage<Props extends BlockOwnProps>(
  PageBlock: new (props: Props) => Block<Props>,
  buildProps: (params: Record<string, string>) => NoInfer<Props>,
): RoutePage {
  return {
    mount(root, match) {
      const element = new PageBlock(buildProps(match.params)).element();

      if (element)
        root.replaceChildren(element);
    },
  };
}
