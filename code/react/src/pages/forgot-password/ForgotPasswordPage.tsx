import { useCallback } from "react";
import { ForgotPasswordForm } from "@features/auth-forgot-password";
import { BlockHost } from "@shared/lib/react/BlockHost";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { AuthShell } from "@shared/ui/AuthShell";

export function ForgotPasswordPage() {
  const createForgotPasswordForm = useCallback(() => new ForgotPasswordForm({}), []);

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Ingresá tu correo y te enviaremos instrucciones para restablecer tu contraseña."
      footer={
        <a className="auth-shell__link" href={routerInstance.href("/auth")} data-link="">
          Volver a iniciar sesión
        </a>
      }
    >
      <BlockHost createBlock={createForgotPasswordForm} />
    </AuthShell>
  );
}
