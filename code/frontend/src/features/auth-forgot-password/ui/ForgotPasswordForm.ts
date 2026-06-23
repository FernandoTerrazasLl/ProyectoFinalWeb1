import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { requestPasswordReset } from "@entities/user";
import type { ForgotPasswordFormProps } from "@features/auth-forgot-password/ui/ForgotPasswordFormProps";
import forgotPasswordFormTemplate from "@features/auth-forgot-password/ui/ForgotPasswordForm.hbs?raw";
import "@features/auth-forgot-password/ui/ForgotPasswordForm.css";

export class ForgotPasswordForm extends Block<ForgotPasswordFormProps> {
  protected template = forgotPasswordFormTemplate;
  protected events: EventListType = {
    submit: (event) => {
      event.preventDefault();
      void this.submit();
    },
  };

  private async submit() {
    const email = (this.refs.email as HTMLInputElement).value;
    const result = await requestPasswordReset(email);

    if (result.isOk())
      this.setProps({ submitted: true });
    else
      this.setProps({ error: "No pudimos procesar tu solicitud. Intentá de nuevo." });
  }
}
