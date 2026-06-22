import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { getAvailability } from "@entities/appointment";
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

      if (slot)
        this.props.onSelectSlot(this.props.date ?? today(), slot.getAttribute("data-time") ?? "");
    },
  };

  constructor(props: BookingCalendarProps) {
    super({ date: today(), ...props });
    void this.loadSlots(this.props.date ?? today());
  }

  private async loadSlots(date: string) {
    this.setProps({ date, loading: true });

    const result = await getAvailability(this.props.psychologistId, date);

    this.setProps({ loading: false, slots: result.isOk() ? result.value : [] });
  }
}
