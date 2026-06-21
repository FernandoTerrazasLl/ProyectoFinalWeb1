import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { SearchBoxProps } from "@features/search-psychologists/ui/SearchBoxProps";
import searchBoxTemplate from "@features/search-psychologists/ui/SearchBox.hbs?raw";
import "@features/search-psychologists/ui/SearchBox.css";

export class SearchBox extends Block<SearchBoxProps> {
  protected template = searchBoxTemplate;
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  protected events: EventListType = {
    input: (event) => {
      clearTimeout(this.debounceTimer);
      const value = (event.target as HTMLInputElement).value;
      this.debounceTimer = setTimeout(() => this.props.onSearch(value), 350);
    },
  };

  protected componentWillUnmount() {
    clearTimeout(this.debounceTimer);
  }
}
