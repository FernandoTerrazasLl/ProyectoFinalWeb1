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
    const maxRate = Number((this.refs.maxRate as HTMLInputElement).value);
    const specialty = (this.refs.specialty as HTMLSelectElement).value;

    if (this.refs.currentRateLabel) {
      (this.refs.currentRateLabel as HTMLElement).innerText = `${maxRate} Bs.`;
    }

    this.props.onChange({
      specialty,
      maxRate,
    });
  }
}
