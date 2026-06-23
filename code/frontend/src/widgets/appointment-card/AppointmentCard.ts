import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { AppointmentState } from "@entities/appointment";
import type { AppointmentCardProps } from "@widgets/appointment-card/AppointmentCardProps";
import appointmentCardTemplate from "@widgets/appointment-card/AppointmentCard.hbs?raw";
import "@widgets/appointment-card/AppointmentCard.css";

const STATE_LABELS: Record<AppointmentState, string> = {
  available: "Disponible",
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  blocked: "Bloqueada",
  cancelled: "Cancelada",
};

const STATE_TONES: Record<AppointmentState, "neutral" | "success" | "warning" | "danger"> = {
  available: "neutral",
  pending: "neutral",
  confirmed: "success",
  completed: "success",
  blocked: "neutral",
  cancelled: "danger",
};

export class AppointmentCard extends Block<AppointmentCardProps> {
  protected template = appointmentCardTemplate;
  protected events: EventListType = {
    click: (event) => {
      if ((event.target as Element).closest(".appointment-card__review"))
        this.props.onReview(this.props.appointment);
      if ((event.target as Element).closest(".appointment-card__cancel"))
        this.props.onCancel(this.props.appointment);
    },
  };

  constructor(props: AppointmentCardProps) {
    super({
      stateLabel: STATE_LABELS[props.appointment.state],
      stateTone: STATE_TONES[props.appointment.state],
      canCancel: props.appointment.state === "pending" || props.appointment.state === "confirmed",
      ...props,
    });
  }
}
