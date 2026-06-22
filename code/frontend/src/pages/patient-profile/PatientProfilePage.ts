import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { AppointmentCard } from "@widgets/appointment-card";
import { Modal } from "@shared/ui/Modal/Modal";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { ReviewForm } from "@features/leave-review";
import { listMyAppointments, type PatientAppointment } from "@entities/appointment";
import { submitReview } from "@entities/review";
import { sessionStore } from "@entities/user";
import patientProfilePageTemplate from "@pages/patient-profile/PatientProfilePage.hbs?raw";
import "@pages/patient-profile/PatientProfilePage.css";

export class PatientProfilePage extends Block<BlockOwnProps> {
  protected template = patientProfilePageTemplate;

  protected componentDidMount() {
    this.replaceChildrenInto("list", [new Spinner({})]);
    void this.loadAppointments();
  }

  private async loadAppointments() {
    const result = await listMyAppointments();

    if (result.isErr() || result.value.length === 0) {
      this.replaceChildrenInto("list", [new EmptyState({ title: "Todavía no tenés citas agendadas" })]);
      return;
    }

    this.replaceChildrenInto(
      "list",
      result.value.map((appointment) => new AppointmentCard({ appointment, onReview: (target) => this.openReview(target) })),
    );
  }

  private openReview(appointment: PatientAppointment) {
    const reviewForm = new ReviewForm({
      onSubmit: async (draft) => {
        const userId = sessionStore.getState().user?.id ?? "";
        const result = await submitReview({ providerId: appointment.providerId, userId, ...draft });

        if (result.isOk())
          reviewForm.setProps({ submitted: true });
      },
    });

    const modal = new Modal({ title: "Dejá tu reseña", body: reviewForm, onClose: () => undefined });
    const element = modal.element();

    if (element)
      document.body.append(element);
  }
}
