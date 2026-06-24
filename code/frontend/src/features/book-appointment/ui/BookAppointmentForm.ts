import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { bookAppointment } from "@entities/appointment";
import { clearStoredSession, hasActiveSession, sessionStore } from "@entities/user";
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
    } else if (result.error.status === 401) {
      clearStoredSession();
      sessionStore.setState({ accessToken: null, user: null, role: "guest" });
      routerInstance.navigate("/auth");
    } else {
      this.setProps({ error: this.bookingError(result.error.message) });
    }
  }

  private bookingError(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("already booked"))
      return "Ese horario ya fue reservado. Elegí otro horario disponible.";
    if (lowerMessage.includes("outside provider"))
      return "Ese horario está fuera de la agenda del psicólogo.";
    if (lowerMessage.includes("blocked"))
      return "Ese horario fue bloqueado por el psicólogo.";
    if (lowerMessage.includes("contigo mismo"))
      return "No podés agendar una cita contigo mismo.";

    return "No pudimos agendar la cita. Intentá de nuevo.";
  }

  private isPastSelection(date: string, time: string): boolean {
    const [hours = "0", minutes = "0"] = time.split(":");
    const selectedDate = new Date(`${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);

    return selectedDate.getTime() <= Date.now();
  }
}
