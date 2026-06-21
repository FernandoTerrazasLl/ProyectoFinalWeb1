import type { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";

export interface ComponentClass<Props extends BlockOwnProps = BlockOwnProps> {
  componentName: string;
  new (props: Props): Block<Props>;
}
