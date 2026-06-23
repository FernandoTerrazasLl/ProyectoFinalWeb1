import { Block } from "@shared/lib/block/Block";
import { env } from "@shared/config/env";
import type { GoogleButtonProps } from "@features/oauth-google/ui/GoogleButtonProps";
import { loadGoogleIdentity } from "@features/oauth-google/lib/loadGoogleIdentity";
import { authenticateWithGoogle } from "@features/oauth-google/model/authenticateWithGoogle";
import googleButtonTemplate from "@features/oauth-google/ui/GoogleButton.hbs?raw";
import "@features/oauth-google/ui/GoogleButton.css";

let identityInitialized = false;

function isOAuthConfigured(clientId: string | undefined): clientId is string {
  return !!clientId && !clientId.includes("your-");
}

export class GoogleButton extends Block<GoogleButtonProps> {
  protected template = googleButtonTemplate;

  protected componentDidMount() {
    if (isOAuthConfigured(env.oauthClientId))
      void this.renderGoogleButton(env.oauthClientId);
    else if (!this.props.error)
      this.setProps({ error: "Google no está configurado para este entorno." });
  }

  private async renderGoogleButton(clientId: string) {
    const identity = await loadGoogleIdentity();
    const container = this.refs.container as HTMLElement | undefined;

    if (!identity || !container)
      return;

    if (!identityInitialized) {
      identity.initialize({
        client_id: clientId,
        callback: (response) => void this.handleCredential(response.credential),
        ux_mode: "popup",
      });
      identityInitialized = true;
    }

    identity.renderButton(container, { type: "standard", theme: "outline", text: "continue_with", width: 320 });
  }

  private async handleCredential(idToken: string) {
    const result = await authenticateWithGoogle(idToken);

    if (result.isOk()) {
      this.props.onAuthenticated();
      return;
    }

    this.setProps({
      error: result.error.status === 401
        ? "Google rechazó el token. Revisá que el client ID del frontend coincida con el backend."
        : "No pudimos iniciar sesión con Google. Intentá de nuevo.",
    });
  }
}
