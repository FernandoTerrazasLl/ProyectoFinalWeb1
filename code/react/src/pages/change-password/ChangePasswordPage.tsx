import { useCallback } from "react";
import { ChangePasswordForm } from "@features/change-password";
import { BlockHost } from "@shared/lib/react/BlockHost";
import { AuthShell } from "@shared/ui/AuthShell";

export function ChangePasswordPage() {
  const createChangePasswordForm = useCallback(() => new ChangePasswordForm({}), []);

  return (
    <AuthShell title="Cambiar contraseña">
      <BlockHost createBlock={createChangePasswordForm} />
    </AuthShell>
  );
}
