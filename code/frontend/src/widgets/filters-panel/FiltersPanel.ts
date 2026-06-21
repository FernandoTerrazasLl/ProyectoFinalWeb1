import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { FiltersPanelProps } from "@widgets/filters-panel/FiltersPanelProps";
import filtersPanelTemplate from "@widgets/filters-panel/FiltersPanel.hbs?raw";
import "@widgets/filters-panel/FiltersPanel.css";

export class FiltersPanel extends Block<FiltersPanelProps> {
  protected template = filtersPanelTemplate;
  protected events: EventListType = {
    change: () => this.emitChange(),
    input: () => this.emitChange(),
  };

  private emitChange() {
    this.props.onChange({
      specialty: (this.refs.specialty as HTMLSelectElement).value,
      maxRate: Number((this.refs.maxRate as HTMLInputElement).value),
    });
  }
}
