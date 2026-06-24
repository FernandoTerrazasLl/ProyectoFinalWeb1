import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { getScheduleRules, updateScheduleRules, type ScheduleRule } from "@entities/appointment";
import providerAvailabilitySettingsTemplate from "@features/provider-availability-settings/ui/ProviderAvailabilitySettings.hbs?raw";
import "@features/provider-availability-settings/ui/ProviderAvailabilitySettings.css";

interface ProviderAvailabilitySettingsProps extends BlockOwnProps {
  saved?: boolean;
  error?: string;
}

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "20:00";
const DEFAULT_INTERVAL_MINUTES = 60;
const ALL_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_BLOCKED_SLOTS = new Set(["12:00", "13:00"]);

function toMinutes(time: string): number {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

function toTime(totalMinutes: number): string {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function splitHour(start: string, end: string, minutes: number): string[] {
  const startMinutes = toMinutes(start);
  let endMinutes = toMinutes(end);
  const slots: string[] = [];

  if (endMinutes <= startMinutes)
    endMinutes += 24 * 60;

  for (let current = startMinutes; current < endMinutes; current += minutes)
    slots.push(toTime(current));

  return slots;
}

export class ProviderAvailabilitySettings extends Block<ProviderAvailabilitySettingsProps> {
  protected template = providerAvailabilitySettingsTemplate;
  private startTime = DEFAULT_START_TIME;
  private endTime = DEFAULT_END_TIME;
  private intervalMinutes = DEFAULT_INTERVAL_MINUTES;
  private blockedSlots = new Set<string>([...DEFAULT_BLOCKED_SLOTS]);
  private allSlots = splitHour(DEFAULT_START_TIME, DEFAULT_END_TIME, DEFAULT_INTERVAL_MINUTES);
  private rulesLoaded = false;
  protected events: EventListType = {
    click: (event) => {
      const target = event.target as Element;
      const slot = target.closest<HTMLElement>("[data-time]");

      if (slot) {
        this.toggleSlot(slot.dataset.time ?? "");
        return;
      }

      if (target.closest(".provider-availability-settings__save"))
        void this.save();
    },
    change: (event) => this.handleRangeChange(event),
  };

  protected componentDidMount() {
    this.syncRangeConntrols();
    this.renderSlots();

    if (!this.rulesLoaded)
      void this.loadRules();
  }

  private async loadRules() {
    const result = await getScheduleRules();
    this.rulesLoaded = true;

    if (result.isErr()) {
      this.setProps({ error: "No pudimos cargar tus preferencias de agenda." });
      return;
    }

    if (result.value.length === 0) {
      this.blockedSlots = new Set(DEFAULT_BLOCKED_SLOTS);
      this.renderSlots();
      return;
    }

    const availableEveryDay = new Set(
      this.allSlots.filter((slot) => ALL_DAYS.every((day) => result.value.some((rule) => rule.dayOfWeek === day && rule.startTime === slot))),
    );

    this.blockedSlots = new Set(this.allSlots.filter((slot) => !availableEveryDay.has(slot)));
    this.renderSlots();
  }

  private toggleSlot(time: string) {
    if (!time)
      return;

    if (this.blockedSlots.has(time))
      this.blockedSlots.delete(time);
    else
      this.blockedSlots.add(time);

    this.renderSlots();
  }

  private renderSlots() {
    this.refs.slots?.replaceChildren(...this.allSlots.map((slot) => this.createSlotButton(slot)));
  }

  private createSlotButton(time: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.time = time;
    button.className = `provider-availability-settings__slot${this.blockedSlots.has(time) ? " provider-availability-settings__slot--blocked" : ""}`;
    button.innerHTML = `${this.blockedSlots.has(time) ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" stroke-width="2"></path></svg>' : ""}<span>${time}</span>`;
    return button;
  }

  private syncRangeConntrols() {
    const startInput = this.refs.startTime as HTMLInputElement | undefined;
    const endInput = this.refs.endTime as HTMLInputElement | undefined;
    const intervalInput = this.refs.intervalMinutes as HTMLSelectElement | undefined;

    if (startInput)
      startInput.value = this.startTime;
    if (endInput)
      endInput.value = this.endTime;
    if (intervalInput)
      intervalInput.value = String(this.intervalMinutes);
  }

  private handleRangeChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;

    if (!target.closest(".provider-availability-settings__range-controls"))
      return;

    const startInput = this.refs.startTime as HTMLInputElement | undefined;
    const endInput = this.refs.endTime as HTMLInputElement | undefined;
    const intervalInput = this.refs.intervalMinutes as HTMLSelectElement | undefined;

    this.startTime = startInput?.value || DEFAULT_START_TIME;
    this.endTime = endInput?.value || DEFAULT_END_TIME;
    this.intervalMinutes = Number(intervalInput?.value || DEFAULT_INTERVAL_MINUTES);

    const nextSlots = splitHour(this.startTime, this.endTime, this.intervalMinutes);

    if (nextSlots.length === 0) {
      this.setProps({ saved: false, error: "Pon un rango horario validp" });
      return;
    }

    this.allSlots = nextSlots;
    this.blockedSlots = new Set([...this.blockedSlots].filter((slot) => this.allSlots.includes(slot)));
    this.renderSlots();
  }

  private async save() {
    const availableSlots = this.allSlots.filter((slot) => !this.blockedSlots.has(slot));
    const rules: ScheduleRule[] = ALL_DAYS.flatMap((day) => availableSlots.map((slot) => ({
      dayOfWeek: day,
      startTime: slot,
      endTime: toTime(toMinutes(slot) + this.intervalMinutes),
    })));
    const result = await updateScheduleRules(rules);

    if (result.isOk())
      this.setProps({ saved: true, error: "" });
    else
      this.setProps({ saved: false, error: "No pudimos guardar tus preferencias. Intentá de nuevo." });
  }
}
