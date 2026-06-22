import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { bookAppointment } from "@entities/appointment";
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
    if (!this.date || !this.time)
      return;

    const reason = (this.refs.reason as HTMLTextAreaElement).value;
    const result = await bookAppointment({ psychologistId: this.props.psychologistId, date: this.date, time: this.time, reason });

    if (result.isOk()) {
      this.setProps({ submitted: true });
      this.props.onBooked();
    } else {
      this.setProps({ error: "No pudimos agendar la cita. Intentá de nuevo." });
    }
  }
}
