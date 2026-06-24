import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { updateMyProfile } from "@entities/user";
import { showToast } from "@shared/lib/toast/showToast";
import { sessionStore } from "@entities/user";
import type { EditPatientProfileProps } from "@features/edit-patient-profile/ui/EditPatientProfileProps";
import editPatientProfileTemplate from "@features/edit-patient-profile/ui/EditPatientProfile.hbs?raw";
import "@features/edit-patient-profile/ui/EditPatientProfile.css";

export class EditPatientProfile extends Block<EditPatientProfileProps> {
  protected template = editPatientProfileTemplate;
  protected events: EventListType = {
    input: (event) => this.handleAvatarUrlInput(event),
    submit: (event) => {
      event.preventDefault();
      void this.save();
    },
  };

  protected componentDidMount() {
    const draft = this.props.draft;

    (this.refs.firstName as HTMLInputElement).value = draft.firstName;
    (this.refs.lastName as HTMLInputElement).value = draft.lastName;
    (this.refs.maternalLastName as HTMLInputElement).value = draft.maternalLastName;
    (this.refs.ci as HTMLInputElement).value = draft.ci;
    (this.refs.birthDate as HTMLInputElement).value = draft.birthDate;
    (this.refs.birthDate as HTMLInputElement).max = new Date().toISOString().substring(0, 10);
    (this.refs.phoneNumber as HTMLInputElement).value = draft.phoneNumber;
    (this.refs.avatarUrl as HTMLInputElement).value = draft.avatarUrl;
    this.setAvatarInitial();
  }

  private setAvatarInitial() {
    const initial = this.props.draft.firstName.trim().charAt(0).toUpperCase() || "P";
    const element = this.refs.avatarInitial as HTMLElement | undefined;
    const preview = this.refs.avatarPreview as HTMLImageElement | undefined;

    if (element)
      element.textContent = initial;
    if (element && preview && preview.getAttribute("src"))
      element.style.display = "none";
  }

  private handleAvatarUrlInput(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input !== this.refs.avatarUrl)
      return;

    this.syncAvatarPreview(input.value.trim());
  }

  private syncAvatarPreview(imageUrl: string) {
    const preview = this.refs.avatarPreview as HTMLImageElement;
    const initial = this.refs.avatarInitial as HTMLElement;

    preview.src = imageUrl;
    preview.style.display = imageUrl ? "block" : "none";
    initial.style.display = imageUrl ? "none" : "inline";
  }

  private async save() {
    const firstName = (this.refs.firstName as HTMLInputElement).value;
    const lastName = (this.refs.lastName as HTMLInputElement).value;

    const result = await updateMyProfile({
      firstName,
      lastName,
      maternalLastName: (this.refs.maternalLastName as HTMLInputElement).value,
      ci: (this.refs.ci as HTMLInputElement).value,
      birthDate: (this.refs.birthDate as HTMLInputElement).value,
      gender: (this.refs.gender as HTMLElement).dataset.value ?? "",
      phoneNumber: (this.refs.phoneNumber as HTMLInputElement).value,
      email: this.props.draft.email,
      avatarUrl: (this.refs.avatarUrl as HTMLInputElement).value.trim(),
    });

    if (result.isOk()) {
      showToast("Tus datos fueron actualizados.", "success", 1500);
      const user = sessionStore.getState().user;
      if (user) {
        sessionStore.setState({ user: { ...user, name: `${firstName} ${lastName}` } });
      }
    } else {
      this.setProps({ error: "No pudimos guardar tus cambios. Intentá de nuevo." });
    }
  }
}
