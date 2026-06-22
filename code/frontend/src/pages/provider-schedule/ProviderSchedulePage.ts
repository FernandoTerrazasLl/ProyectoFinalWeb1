import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { EventListType } from "@shared/lib/block/EventListType";
import { ScheduleSlot } from "@widgets/schedule-slot";
import { PatientInfoCard } from "@widgets/patient-info-modal";
import { Modal } from "@shared/ui/Modal/Modal";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { getProviderSchedule, getAppointmentPatient, blockSlot } from "@entities/appointment";
import providerSchedulePageTemplate from "@pages/provider-schedule/ProviderSchedulePage.hbs?raw";
import "@pages/provider-schedule/ProviderSchedulePage.css";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class ProviderSchedulePage extends Block<BlockOwnProps> {
  protected template = providerSchedulePageTemplate;
  protected events: EventListType = {
    change: () => void this.loadSchedule((this.refs.date as HTMLInputElement).value),
  };

  protected componentDidMount() {
    (this.refs.date as HTMLInputElement).value = today();
    void this.loadSchedule(today());
  }

  private async loadSchedule(date: string) {
    this.replaceChildrenInto("list", [new Spinner({})]);

    const result = await getProviderSchedule(date);

    if (result.isErr() || result.value.length === 0) {
      this.replaceChildrenInto("list", [new EmptyState({ title: "No hay horarios para este día" })]);
      return;
    }

    this.replaceChildrenInto(
      "list",
      result.value.map((entry) =>
        new ScheduleSlot({
          entry,
          onViewInfo: (appointmentId) => void this.viewPatient(appointmentId),
          onBlock: (time) => void this.blockTime(date, time),
        }),
      ),
    );
  }

  private async viewPatient(appointmentId: string) {
    const result = await getAppointmentPatient(appointmentId);

    if (result.isErr())
      return;

    const modal = new Modal({
      title: "Información del paciente",
      body: new PatientInfoCard({ info: result.value }),
      onClose: () => undefined,
    });
    const element = modal.element();

    if (element)
      document.body.append(element);
  }

  private async blockTime(date: string, time: string) {
    const result = await blockSlot(date, time);

    if (result.isOk())
      await this.loadSchedule(date);
  }
}
