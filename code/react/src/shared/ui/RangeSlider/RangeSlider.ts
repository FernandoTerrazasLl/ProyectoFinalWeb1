import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { RangeSliderProps } from "@shared/ui/RangeSlider/RangeSliderProps";
import rangeSliderTemplate from "@shared/ui/RangeSlider/RangeSlider.hbs?raw";
import "@shared/ui/RangeSlider/RangeSlider.css";

export class RangeSlider extends Block<RangeSliderProps> {
  static componentName = "RangeSlider";
  protected template = rangeSliderTemplate;
  protected events: EventListType = {
    input: (event) => this.props.onChange?.(Number((event.target as HTMLInputElement).value)),
  };
}
