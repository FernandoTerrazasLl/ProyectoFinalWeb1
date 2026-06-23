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
      if (target.closest(".schedule-slot__cancel") && this.props.entry.appointmentId)
        this.props.onCancel(this.props.entry.appointmentId);
      if (target.closest(".schedule-slot__complete") && this.props.entry.appointmentId)
        this.props.onComplete(this.props.entry.appointmentId);
    },
  };

  constructor(props: ScheduleSlotProps) {
    const stateLabels = {
      available: "Libre para reserva",
      pending: "Pendiente",
      confirmed: "Confirmada",
      completed: "Completada",
      blocked: "Horario bloqueado",
      cancelled: "Cancelada",
    };

    super({
      isReserved:
        props.entry.state === "pending" ||
        props.entry.state === "confirmed" ||
        props.entry.state === "completed",
      isFree: props.entry.state === "available",
      isBlocked: props.entry.state === "blocked",
      canCancel: props.entry.state === "pending" || props.entry.state === "confirmed",
      canComplete: props.entry.state === "pending" || props.entry.state === "confirmed",
      stateLabel: stateLabels[props.entry.state],
      stateClass: `schedule-slot__state--${props.entry.state}`,
      stateBodyClass: `schedule-slot__body--${props.entry.state}`,
      ...props,
    });
  }
}
