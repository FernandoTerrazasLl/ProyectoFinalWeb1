import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { ChangePasswordForm } from "@features/change-password";
import changePasswordPageTemplate from "@pages/change-password/ChangePasswordPage.hbs?raw";
import "@pages/change-password/ChangePasswordPage.css";

export class ChangePasswordPage extends Block<BlockOwnProps> {
  protected template = changePasswordPageTemplate;

  protected componentDidMount() {
    this.mountInto("form", new ChangePasswordForm({}));
  }
}
