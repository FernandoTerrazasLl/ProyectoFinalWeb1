import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { changePassword } from "@entities/user";
import type { ChangePasswordFormProps } from "@features/change-password/ui/ChangePasswordFormProps";
import changePasswordFormTemplate from "@features/change-password/ui/ChangePasswordForm.hbs?raw";
import "@features/change-password/ui/ChangePasswordForm.css";

export class ChangePasswordForm extends Block<ChangePasswordFormProps> {
  protected template = changePasswordFormTemplate;
  protected events: EventListType = {
    submit: (event) => {
      event.preventDefault();
      void this.submit();
    },
  };

  private async submit() {
    const currentPassword = (this.refs.currentPassword as HTMLInputElement).value;
    const newPassword = (this.refs.newPassword as HTMLInputElement).value;
    const confirmPassword = (this.refs.confirmPassword as HTMLInputElement).value;

    if (newPassword.length < 8) {
      this.setProps({ error: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      this.setProps({ error: "Las contraseñas no coinciden." });
      return;
    }

    const result = await changePassword(currentPassword, newPassword);

    if (result.isOk())
      this.setProps({ saved: true });
    else
      this.setProps({ error: "No pudimos cambiar tu contraseña. Verificá tu contraseña actual." });
  }
}
