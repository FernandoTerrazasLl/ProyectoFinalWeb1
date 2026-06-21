import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { LoginForm, submitLogin } from "@features/auth-login";
import { routerInstance } from "@shared/lib/router/routerInstance";
import authPageTemplate from "@pages/auth/AuthPage.hbs?raw";
import "@pages/auth/AuthPage.css";

export class AuthPage extends Block<BlockOwnProps> {
  protected template = authPageTemplate;

  protected componentDidMount() {
    const loginForm = new LoginForm({
      onSubmit: async (request) => {
        const result = await submitLogin(request);

        if (result.isOk()) 
          routerInstance.navigate("/directory");
        else 
          loginForm.setProps({ error: result.error.message });
      },
    });

    const formSlot = this.refs.form;
    const formElement = loginForm.element();

    if (formSlot && formElement) 
      formSlot.replaceWith(formElement);
  }
}
