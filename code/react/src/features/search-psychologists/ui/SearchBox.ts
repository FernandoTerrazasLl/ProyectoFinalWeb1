import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { SearchBoxProps } from "@features/search-psychologists/ui/SearchBoxProps";
import searchBoxTemplate from "@features/search-psychologists/ui/SearchBox.hbs?raw";
import "@features/search-psychologists/ui/SearchBox.css";

export class SearchBox extends Block<SearchBoxProps> {
  protected template = searchBoxTemplate;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  protected events: EventListType = {
    click: (event) => {
      if (!(event.target as Element).closest(".search-box__submit"))
        return;

      this.props.onSearch((this.refs.input as HTMLInputElement).value);
    },
    keydown: (event) => {
      const e = event as KeyboardEvent;
      if (e.key === "Enter") {
        this.props.onSearch((this.refs.input as HTMLInputElement).value);
      }
    }
  };

  protected componentWillUnmount() {
    clearTimeout(this.debounceTimer);
  }
}
