import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { SelectProps } from "@shared/ui/Select/SelectProps";
import selectTemplate from "@shared/ui/Select/Select.hbs?raw";
import "@shared/ui/FormControl/FormControl.css";

export class Select extends Block<SelectProps> {
  static componentName = "Select";
  protected template = selectTemplate;
  protected events: EventListType = {
    change: (event) => this.props.onChange?.((event.target as HTMLSelectElement).value),
  };

  protected componentDidMount() {
    if (this.props.value !== undefined) 
      (this.element() as HTMLSelectElement).value = this.props.value;
  }
}
