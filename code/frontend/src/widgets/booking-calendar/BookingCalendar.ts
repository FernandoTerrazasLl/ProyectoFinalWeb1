import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { getAvailability, formatTimeLabel, formatDateLabel } from "@entities/appointment";
import type { BookingCalendarProps } from "@widgets/booking-calendar/BookingCalendarProps";
import bookingCalendarTemplate from "@widgets/booking-calendar/BookingCalendar.hbs?raw";
import "@widgets/booking-calendar/BookingCalendar.css";

function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isPastSlot(date: string, time: string): boolean {
  const [hours = "0", minutes = "0"] = time.split(":");
  const slotDate = new Date(`${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);

  return slotDate.getTime() <= Date.now();
}

export class BookingCalendar extends Block<BookingCalendarProps> {
  protected template = bookingCalendarTemplate;
  protected events: EventListType = {
    change: () => void this.handleDateChange(),
    input: () => void this.handleDateChange(),
    click: (event) => {
      const slot = (event.target as Element).closest("[data-time]");

      if (!slot)
        return;

      if (slot instanceof HTMLButtonElement && slot.disabled)
        return;

      slot.parentElement
        ?.querySelectorAll(".booking-calendar__slot--selected")
        .forEach((selected) => selected.classList.remove("booking-calendar__slot--selected"));
      slot.classList.add("booking-calendar__slot--selected");

      if (this.props.date)
        this.props.onSelectSlot(this.props.date, slot.getAttribute("data-time") ?? "");
    },
  };

  constructor(props: BookingCalendarProps) {
    const initialDate = props.date ?? "";

    super({
      date: initialDate,
      min: today(),
      dateLabel: initialDate ? formatDateLabel(initialDate) : "Elegir en el calendario",
      slots: [],
      ...props,
    });

    if (initialDate)
      void this.loadSlots(initialDate);
  }

  private async handleDateChange() {
    const dateInput = this.refs.date as HTMLInputElement;
    const selectedDate = dateInput.value;

    if (!selectedDate)
      return;

    await this.loadSlots(selectedDate < today() ? today() : selectedDate);
  }

  private async loadSlots(date: string) {
    this.setProps({ date, dateLabel: formatDateLabel(date), loading: true });

    const result = await getAvailability(this.props.psychologistId, date);
    const slots = result.isOk()
      ? result.value.map((slot) => {
        const past = isPastSlot(date, slot.time);

        return {
          ...slot,
          available: slot.available && !past,
          label: formatTimeLabel(slot.time),
          isPast: past,
          status: past ? "Horario pasado" : "",
        };
      })
      : [];

    this.setProps({ loading: false, slots });
  }
}
