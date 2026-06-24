import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { updateMyProfile } from "@entities/user";
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
    if (this.props.saved)
      return;

    const draft = this.props.draft;

    (this.refs.firstName as HTMLInputElement).value = draft.firstName;
    (this.refs.lastName as HTMLInputElement).value = draft.lastName;
    (this.refs.maternalLastName as HTMLInputElement).value = draft.maternalLastName;
    (this.refs.ci as HTMLInputElement).value = draft.ci;
    (this.refs.birthDate as HTMLInputElement).value = draft.birthDate;
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

  private handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)
      return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const preview = this.refs.avatarPreview as HTMLImageElement;
      const initial = this.refs.avatarInitial as HTMLElement;

      this.avatarUrl = String(reader.result);
      preview.src = this.avatarUrl;
      preview.style.display = "block";
      initial.style.display = "none";
    });
    reader.readAsDataURL(file);
  }

  private async save() {
    const result = await updateMyProfile({
      firstName: (this.refs.firstName as HTMLInputElement).value,
      lastName: (this.refs.lastName as HTMLInputElement).value,
      maternalLastName: (this.refs.maternalLastName as HTMLInputElement).value,
      ci: (this.refs.ci as HTMLInputElement).value,
      birthDate: (this.refs.birthDate as HTMLInputElement).value,
      gender: (this.refs.gender as HTMLElement).dataset.value ?? "",
      phoneNumber: (this.refs.phoneNumber as HTMLInputElement).value,
      email: this.props.draft.email,
      avatarUrl: this.avatarUrl,
    });

    if (result.isOk())
      this.setProps({ saved: true });
    else
      this.setProps({ error: "No pudimos guardar tus cambios. Intentá de nuevo." });
  }
}
