import type { Block } from "@shared/lib/block/Block";
import type { Result } from "ts-results-es";

export interface BlockChild {
  component: Block;
  embed(fragment: DocumentFragment): Result<void, string>;
}
