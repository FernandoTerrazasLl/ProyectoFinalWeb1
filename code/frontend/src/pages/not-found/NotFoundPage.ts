import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import notFoundPageTemplate from "@pages/not-found/NotFoundPage.hbs?raw";
import "@pages/not-found/NotFoundPage.css";

export class NotFoundPage extends Block<BlockOwnProps> {
  protected template = notFoundPageTemplate;
}
