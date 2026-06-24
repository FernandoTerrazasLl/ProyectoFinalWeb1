import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { bookAppointment } from "@entities/appointment";
import { hasActiveSession } from "@entities/user";
import { routerInstance } from "@shared/lib/router/routerInstance";
import type { BookAppointmentFormProps } from "@features/book-appointment/ui/BookAppointmentFormProps";
import bookAppointmentFormTemplate from "@features/book-appointment/ui/BookAppointmentForm.hbs?raw";
import "@features/book-appointment/ui/BookAppointmentForm.css";

export class BookAppointmentForm extends Block<BookAppointmentFormProps> {
  protected template = bookAppointmentFormTemplate;
  private date: string | null = null;
  private time: string | null = null;
  protected events: EventListType = {
    submit: (event) => {
      event.preventDefault();
      void this.confirm();
    },
  };

  selectSlot(date: string, time: string) {
    if (this.isPastSelection(date, time)) {
      this.date = null;
      this.time = null;
      this.setProps({ error: "Ese horario ya pasó. Elegí una fecha y hora disponible." });
      return;
    }

    this.date = date;
    this.time = time;
    const slot = this.element()?.querySelector(".book-appointment__slot");

    if (slot)
      slot.textContent = `Horario elegido: ${date} a las ${time}`;

    const submit = this.element()?.querySelector(".book-appointment__submit") as HTMLButtonElement | null;

    if (submit)
      submit.disabled = false;
  }

  private async confirm() {
    if (!hasActiveSession()) {
      routerInstance.navigate("/auth");
      return;
    }

    if (!this.date || !this.time)
      return;

    if (this.isPastSelection(this.date, this.time)) {
      this.setProps({ error: "No se puede agendar una cita en una fecha u hora pasada." });
      return;
    }

    const reason = (this.refs.reason as HTMLTextAreaElement).value;
    const result = await bookAppointment({ psychologistId: this.props.psychologistId, date: this.date, time: this.time, reason });

    if (result.isOk()) {
      this.setProps({ submitted: true });
      this.props.onBooked();
    } else {
      this.setProps({ error: "No pudimos agendar la cita. Intentá de nuevo." });
    }
  }

  private isPastSelection(date: string, time: string): boolean {
    const [hours = "0", minutes = "0"] = time.split(":");
    const selectedDate = new Date(`${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);

    return selectedDate.getTime() <= Date.now();
  }
}
