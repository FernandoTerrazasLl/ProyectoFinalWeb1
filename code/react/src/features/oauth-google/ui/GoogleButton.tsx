import { useCallback, useEffect, useRef, useState } from "react";
import { env } from "@shared/config/env";
import { loadGoogleIdentity } from "@features/oauth-google/lib/loadGoogleIdentity";
import { authenticateWithGoogle } from "@features/oauth-google/model/authenticateWithGoogle";
import "@features/oauth-google/ui/GoogleButton.css";

type GoogleButtonProps = {
  onAuthenticated: () => void;
};

function isOAuthConfigured(clientId: string | undefined): clientId is string {
  return !!clientId && !clientId.includes("your-");
}

export function GoogleButton({ onAuthenticated }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = isOAuthConfigured(env.oauthClientId) ? env.oauthClientId : null;
  const [error, setError] = useState<string | null>(
    clientId ? null : "Google no está configurado para este entorno.",
  );

  const handleCredential = useCallback(
    async (idToken: string) => {
      const result = await authenticateWithGoogle(idToken);

      if (result.isOk()) {
        onAuthenticated();
        return;
      }

      setError(
        result.error.status === 401
          ? "Google rechazó el token. Revisá que el client ID del frontend coincida con el backend."
          : "No pudimos iniciar sesión con Google. Intentá de nuevo.",
      );
    },
    [onAuthenticated],
  );

  useEffect(() => {
    if (!clientId)
      return;

    const renderGoogleButton = async () => {
      const identity = await loadGoogleIdentity();
      const container = containerRef.current;

      if (!identity || !container)
        return;

      identity.initialize({
        client_id: clientId,
        callback: (response) => void handleCredential(response.credential),
        ux_mode: "popup",
      });

      identity.renderButton(container, { type: "standard", theme: "outline", text: "continue_with", width: 320 });
    };

    void renderGoogleButton();
  }, [clientId, handleCredential]);

  return (
    <div className="google-button">
      <div className="google-button__control" ref={containerRef} />
      {error ? <p className="google-button__error">{error}</p> : null}
    </div>
  );
}
