import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { ForgotPasswordForm } from "@features/auth-forgot-password";
import forgotPasswordPageTemplate from "@pages/forgot-password/ForgotPasswordPage.hbs?raw";
import "@pages/forgot-password/ForgotPasswordPage.css";

export class ForgotPasswordPage extends Block<BlockOwnProps> {
  protected template = forgotPasswordPageTemplate;

  protected componentDidMount() {
    this.mountInto("form", new ForgotPasswordForm({}));
  }
}
