import { useCallback } from "react";
import { LoginForm, submitLogin } from "@features/auth-login";
import { GoogleButton } from "@features/oauth-google";
import { describeHttpError } from "@shared/api/describeHttpError";
import { BlockHost } from "@shared/lib/react/BlockHost";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { showToast } from "@shared/lib/toast/showToast";
import { ReactIcon } from "@shared/ui/Icon/ReactIcon";
import "@pages/auth/AuthPage.css";

export function AuthPage() {
  const createLoginForm = useCallback(
    () =>
      new LoginForm({
        onSubmit: async (request) => {
          const result = await submitLogin(request);

          if (result.isOk())
            routerInstance.navigate("/directory");
          else
            showToast(describeHttpError(result.error));
        },
      }),
    [],
  );

  return (
    <main className="auth-page">
      <div className="auth-page__intro">
        <ReactIcon className="auth-page__logo" name="heart-pulse" />
        <h1 className="auth-page__title">Bienvenido a CuraMente</h1>
        <p className="auth-page__subtitle">Accede a tu cuenta para continuar</p>
      </div>

      <section className="auth-page__panel">
        <BlockHost createBlock={createLoginForm} />
        <a className="auth-page__forgot-link" href={routerInstance.href("/forgot-password")} data-link="">
          ¿Olvidaste tu contraseña?
        </a>

        <div className="auth-page__divider">
          <span>O continuar con</span>
        </div>
        <GoogleButton onAuthenticated={() => routerInstance.navigate("/directory")} />

        <p className="auth-page__signup">
          ¿No tenés cuenta?{" "}
          <a className="auth-page__signup-link" href={routerInstance.href("/signup")} data-link="">
            Registrate
          </a>
        </p>
      </section>
    </main>
  );
}
