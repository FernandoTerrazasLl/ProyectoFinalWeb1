import { Block } from "@shared/lib/block/Block";
import { PsychologistDetail } from "@widgets/psychologist-detail";
import { BookingCalendar } from "@widgets/booking-calendar";
import { ReviewsList } from "@widgets/reviews-list";
import { BookAppointmentForm } from "@features/book-appointment";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { getPsychologist } from "@entities/psychologist";
import { listReviews } from "@entities/review";
import type { ProviderProfilePageProps } from "@pages/provider-profile/ProviderProfilePageProps";
import providerProfilePageTemplate from "@pages/provider-profile/ProviderProfilePage.hbs?raw";
import "@pages/provider-profile/ProviderProfilePage.css";

export class ProviderProfilePage extends Block<ProviderProfilePageProps> {
  protected template = providerProfilePageTemplate;
  private mounted = false;

  protected componentDidMount() {
    if (this.mounted)
      return;

    this.mounted = true;
    this.mountInto("detail", new Spinner({}));
    void this.loadProfile();
  }

  private async loadProfile() {
    const result = await getPsychologist(this.props.id);

    if (result.isErr()) {
      this.showNotFound();
      return;
    }

    const psychologist = result.value;

    this.setProps({ psychologist });
    this.mountInto("detail", new PsychologistDetail({ psychologist }));
    this.setupBooking();
    void this.loadReviews();
  }

  private setupBooking() {
    const bookForm = new BookAppointmentForm({ psychologistId: this.props.id, onBooked: () => undefined });

    this.mountInto("bookForm", bookForm);
    this.mountInto("calendar", new BookingCalendar({
      psychologistId: this.props.id,
      onSelectSlot: (date, time) => bookForm.selectSlot(date, time),
    }));
  }

  private async loadReviews() {
    const result = await listReviews(this.props.id);

    if (result.isOk() && result.value.length > 0)
      this.mountInto("reviewsList", new ReviewsList({ reviews: result.value }));
    else
      this.mountInto("reviewsList", new EmptyState({ title: "Todavía no hay reseñas" }));
  }

  private showNotFound() {
    this.setProps({ notFound: true });
    this.mountInto("detail", new EmptyState({
      title: "Profesional no encontrado",
      description: "Volvé al directorio para seguir buscando.",
    }));
  }
}
