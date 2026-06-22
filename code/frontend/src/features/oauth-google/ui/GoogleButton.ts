import { Block } from "@shared/lib/block/Block";
import { env } from "@shared/config/env";
import type { GoogleButtonProps } from "@features/oauth-google/ui/GoogleButtonProps";
import { loadGoogleIdentity } from "@features/oauth-google/lib/loadGoogleIdentity";
import { authenticateWithGoogle } from "@features/oauth-google/model/authenticateWithGoogle";
import googleButtonTemplate from "@features/oauth-google/ui/GoogleButton.hbs?raw";
import "@features/oauth-google/ui/GoogleButton.css";

export class GoogleButton extends Block<GoogleButtonProps> {
  protected template = googleButtonTemplate;

  protected componentDidMount() {
    if (env.oauthClientId)
      void this.renderGoogleButton();
  }

  private async renderGoogleButton() {
    const identity = await loadGoogleIdentity();
    const container = this.refs.container as HTMLElement | undefined;

    if (!identity || !container)
      return;

    identity.initialize({
      client_id: env.oauthClientId,
      callback: (response) => void this.handleCredential(response.credential),
    });
    
    identity.renderButton(container, { type: "standard", theme: "outline", text: "continue_with", width: 320 });
  }

  private async handleCredential(idToken: string) {
    if (await authenticateWithGoogle(idToken))
      this.props.onAuthenticated();
  }
}
