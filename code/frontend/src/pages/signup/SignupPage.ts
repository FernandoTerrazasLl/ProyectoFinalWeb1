import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { RegisterForm, submitRegister } from "@features/auth-register";
import { routerInstance } from "@shared/lib/router/routerInstance";
import signupPageTemplate from "@pages/signup/SignupPage.hbs?raw";
import "@pages/signup/SignupPage.css";

export class SignupPage extends Block<BlockOwnProps> {
  protected template = signupPageTemplate;

  protected componentDidMount() {
    const registerForm = new RegisterForm({
      onSubmit: async (request) => {
        const result = await submitRegister(request);
 
        if (result.isOk()) 
          routerInstance.navigate("/directory");
        else 
          registerForm.setProps({ error: result.error.message });
      },
    });

    const formSlot = this.refs.form;
    const formElement = registerForm.element();

    if (formSlot && formElement) 
      formSlot.replaceWith(formElement);
  }
}
