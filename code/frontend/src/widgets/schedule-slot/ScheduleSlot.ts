import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { ScheduleSlotProps } from "@widgets/schedule-slot/ScheduleSlotProps";
import scheduleSlotTemplate from "@widgets/schedule-slot/ScheduleSlot.hbs?raw";
import "@widgets/schedule-slot/ScheduleSlot.css";

export class ScheduleSlot extends Block<ScheduleSlotProps> {
  protected template = scheduleSlotTemplate;
  protected events: EventListType = {
    click: (event) => {
      const target = event.target as Element;

      if (target.closest(".schedule-slot__info") && this.props.entry.appointmentId)
        this.props.onViewInfo(this.props.entry.appointmentId);
      if (target.closest(".schedule-slot__block"))
        this.props.onBlock(this.props.entry.time);
    },
  };

  constructor(props: ScheduleSlotProps) {
    super({
      isReserved: props.entry.state === "pending" || props.entry.state === "completed",
      isFree: props.entry.state === "available",
      isBlocked: props.entry.state === "blocked",
      ...props,
    });
  }
}
