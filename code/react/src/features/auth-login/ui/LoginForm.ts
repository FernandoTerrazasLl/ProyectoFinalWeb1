import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { LoginFormProps } from "@features/auth-login/ui/LoginFormProps";
import loginFormTemplate from "@features/auth-login/ui/LoginForm.hbs?raw";
import "@features/auth-login/ui/LoginForm.css";

export class LoginForm extends Block<LoginFormProps> {
  protected template = loginFormTemplate;
  protected events: EventListType = {
    submit: (event) => {
      event.preventDefault();
      this.props.onSubmit({
        email: (this.refs.email as HTMLInputElement).value,
        password: (this.refs.password as HTMLInputElement).value,
      });
    },
  };
}
