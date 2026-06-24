import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { prepareProfileImage } from "@shared/lib/image/prepareProfileImage";
import { updateMyProfile } from "@entities/user";
import { showToast } from "@shared/lib/toast/showToast";
import { sessionStore } from "@entities/user";
import type { EditPatientProfileProps } from "@features/edit-patient-profile/ui/EditPatientProfileProps";
import editPatientProfileTemplate from "@features/edit-patient-profile/ui/EditPatientProfile.hbs?raw";
import "@features/edit-patient-profile/ui/EditPatientProfile.css";

export class EditPatientProfile extends Block<EditPatientProfileProps> {
  protected template = editPatientProfileTemplate;
  private avatarUrl = "";
  protected events: EventListType = {
    click: (event) => {
      if ((event.target as Element).closest(".edit-patient-profile__photo-button"))
        (this.refs.avatarInput as HTMLInputElement).click();
    },
    change: (event) => this.handlePhotoChange(event),
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
    this.avatarUrl = draft.avatarUrl;
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

  private async handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return;

    const imageUrl = await prepareProfileImage(file);

    if (!imageUrl)
      return;

    const preview = this.refs.avatarPreview as HTMLImageElement;
    const initial = this.refs.avatarInitial as HTMLElement;

    this.avatarUrl = imageUrl;
    preview.src = this.avatarUrl;
    preview.style.display = "block";
    initial.style.display = "none";
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
      avatarUrl: this.avatarUrl,
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
