import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { getAvailability, formatTimeLabel, formatDateLabel } from "@entities/appointment";
import type { BookingCalendarProps } from "@widgets/booking-calendar/BookingCalendarProps";
import bookingCalendarTemplate from "@widgets/booking-calendar/BookingCalendar.hbs?raw";
import "@widgets/booking-calendar/BookingCalendar.css";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class BookingCalendar extends Block<BookingCalendarProps> {
  protected template = bookingCalendarTemplate;
  protected events: EventListType = {
    change: () => this.loadSlots((this.refs.date as HTMLInputElement).value),
    click: (event) => {
      const slot = (event.target as Element).closest("[data-time]");

      if (!slot)
        return;

      slot.parentElement
        ?.querySelectorAll(".booking-calendar__slot--selected")
        .forEach((selected) => selected.classList.remove("booking-calendar__slot--selected"));
      slot.classList.add("booking-calendar__slot--selected");

      this.props.onSelectSlot(this.props.date ?? today(), slot.getAttribute("data-time") ?? "");
    },
  };

  constructor(props: BookingCalendarProps) {
    const initialDate = props.date ?? today();

    super({ date: initialDate, min: today(), dateLabel: formatDateLabel(initialDate), ...props });
    void this.loadSlots(initialDate);
  }

  private async loadSlots(date: string) {
    this.setProps({ date, dateLabel: formatDateLabel(date), loading: true });

    const result = await getAvailability(this.props.psychologistId, date);
    const slots = result.isOk()
      ? result.value.map((slot) => ({ ...slot, label: formatTimeLabel(slot.time) }))
      : [];

    this.setProps({ loading: false, slots });
  }
}
