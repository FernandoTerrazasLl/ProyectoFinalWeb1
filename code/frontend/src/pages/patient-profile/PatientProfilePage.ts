import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { AppointmentCard } from "@widgets/appointment-card";
import { EditPatientProfile } from "@features/edit-patient-profile";
import { Modal } from "@shared/ui/Modal/Modal";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { ReviewForm } from "@features/leave-review";
import { listMyAppointments, cancelAppointment, type PatientAppointment } from "@entities/appointment";
import { submitReview } from "@entities/review";
import { sessionStore, getMyProfile } from "@entities/user";
import { routerInstance } from "@shared/lib/router/routerInstance";
import type { PatientProfilePageProps } from "@pages/patient-profile/PatientProfilePageProps";
import patientProfilePageTemplate from "@pages/patient-profile/PatientProfilePage.hbs?raw";
import "@pages/patient-profile/PatientProfilePage.css";

export class PatientProfilePage extends Block<PatientProfilePageProps> {
  protected template = patientProfilePageTemplate;
  protected events: EventListType = {
    click: (event) => {
      const tab = (event.target as Element).closest("[data-tab]")?.getAttribute("data-tab");

      if (tab === "data")
        this.setProps({ isDataTab: true, isAppointmentsTab: false });
      if (tab === "appointments")
        this.setProps({ isDataTab: false, isAppointmentsTab: true });
    },
  };

  constructor(props: PatientProfilePageProps) {
    super({ isDataTab: true, isAppointmentsTab: false, ...props });
  }

  protected componentDidMount() {
    if (this.props.isAppointmentsTab) {
      this.replaceChildrenInto("upcomingList", [new Spinner({})]);
      this.replaceChildrenInto("historyList", []);
      void this.loadAppointments();
    }
    if (this.props.isDataTab) {
      this.mountInto("profileForm", new Spinner({}));
      void this.loadProfile();
    }
  }

  private async loadAppointments() {
    const result = await listMyAppointments();

    if (result.isErr()) {
      this.replaceChildrenInto("upcomingList", [new EmptyState({ title: "No pudimos cargar tus citas" })]);
      this.replaceChildrenInto("historyList", []);
      return;
    }

    const upcoming = result.value.filter((appointment) => this.isUpcoming(appointment));
    const history = result.value.filter((appointment) => !this.isUpcoming(appointment));

    this.replaceChildrenInto(
      "upcomingList",
      upcoming.length > 0
        ? upcoming.map((appointment) =>
          new AppointmentCard({
            appointment,
            onReview: (target) => this.openReview(target),
            onCancel: (target) => void this.handleCancel(target),
            onBookAgain: (target) => routerInstance.navigate(`/profile/${target.providerId}`),
          }),
        )
        : [new EmptyState({ title: "No tenés citas próximas" })],
    );

    this.replaceChildrenInto(
      "historyList",
      history.length > 0
        ? history.map((appointment) =>
          new AppointmentCard({
            appointment,
            onReview: (target) => this.openReview(target),
            onCancel: (target) => void this.handleCancel(target),
            onBookAgain: (target) => routerInstance.navigate(`/profile/${target.providerId}`),
          }),
        )
        : [new EmptyState({ title: "Todavía no tenés historial de citas" })],
    );
  }

  private async handleCancel(appointment: PatientAppointment) {
    const result = await cancelAppointment(appointment.id);

    if (result.isOk())
      await this.loadAppointments();
  }

  private isUpcoming(appointment: PatientAppointment): boolean {
    if (appointment.state !== "pending" && appointment.state !== "confirmed")
      return false;

    return new Date(`${appointment.date}T${appointment.time}`).getTime() >= Date.now();
  }

  private async loadProfile() {
    const result = await getMyProfile();

    if (result.isErr()) {
      this.mountInto("profileForm", new EmptyState({ title: "No pudimos cargar tus datos" }));
      return;
    }

    this.mountInto("profileForm", new EditPatientProfile({ draft: result.value }));
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
