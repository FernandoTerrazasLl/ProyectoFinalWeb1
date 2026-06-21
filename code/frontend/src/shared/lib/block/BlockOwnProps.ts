import type { BlockChild } from "@shared/lib/block/BlockChild";

export interface BlockOwnProps {
  __children?: BlockChild[];
  __refs?: Record<string, Element>;
}
