import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { RegisterForm, submitRegister } from "@features/auth-register";
import { describeHttpError } from "@shared/api/describeHttpError";
import { showToast } from "@shared/lib/toast/showToast";
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
          routerInstance.navigate("/triage");
        else
          showToast(describeHttpError(result.error));
      },
    });

    this.mountInto("form", registerForm);
  }
}
