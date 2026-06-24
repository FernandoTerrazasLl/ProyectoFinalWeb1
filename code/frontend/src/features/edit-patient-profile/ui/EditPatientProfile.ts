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
