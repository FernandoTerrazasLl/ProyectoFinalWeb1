import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { LoginForm, submitLogin } from "@features/auth-login";
import { GoogleButton } from "@features/oauth-google";
import { describeHttpError } from "@shared/api/describeHttpError";
import { showToast } from "@shared/lib/toast/showToast";
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
          showToast(describeHttpError(result.error));
      },
    });

    this.mountInto("form", loginForm);
    this.mountInto("google", new GoogleButton({ onAuthenticated: () => routerInstance.navigate("/directory") }));
  }
}
