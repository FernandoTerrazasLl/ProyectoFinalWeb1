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

const DAY_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const NIGHT_SLOTS = ["20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"];
const ALL_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_BLOCKED_SLOTS = new Set(["12:00", "13:00", ...NIGHT_SLOTS]);

function addHour(time: string): string {
  const hour = Number(time.split(":")[0] ?? "0");
  return `${String((hour + 1) % 24).padStart(2, "0")}:00`;
}

export class ProviderAvailabilitySettings extends Block<ProviderAvailabilitySettingsProps> {
  protected template = providerAvailabilitySettingsTemplate;
  private blockedSlots = new Set<string>(DEFAULT_BLOCKED_SLOTS);
  private allSlots = [...DAY_SLOTS, ...NIGHT_SLOTS];
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
  };

  protected componentDidMount() {
    this.renderSlots();
    void this.loadRules();
  }

  private async loadRules() {
    const result = await getScheduleRules();

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
    this.refs.daySlots?.replaceChildren(...DAY_SLOTS.map((slot) => this.createSlotButton(slot)));
    this.refs.nightSlots?.replaceChildren(...NIGHT_SLOTS.map((slot) => this.createSlotButton(slot)));
  }

  private createSlotButton(time: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.time = time;
    button.className = `provider-availability-settings__slot${this.blockedSlots.has(time) ? " provider-availability-settings__slot--blocked" : ""}`;
    button.innerHTML = `${this.blockedSlots.has(time) ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" stroke-width="2"></path></svg>' : ""}<span>${time}</span>`;
    return button;
  }

  private async save() {
    const availableSlots = this.allSlots.filter((slot) => !this.blockedSlots.has(slot));
    const rules: ScheduleRule[] = ALL_DAYS.flatMap((day) => availableSlots.map((slot) => ({
      dayOfWeek: day,
      startTime: slot,
      endTime: addHour(slot),
    })));
    const result = await updateScheduleRules(rules);

    if (result.isOk())
      this.setProps({ saved: true, error: "" });
    else
      this.setProps({ saved: false, error: "No pudimos guardar tus preferencias. Intentá de nuevo." });
  }
}
