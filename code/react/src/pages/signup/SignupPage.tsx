import { useCallback } from "react";
import { RegisterForm, submitRegister } from "@features/auth-register";
import { describeHttpError } from "@shared/api/describeHttpError";
import { BlockHost } from "@shared/lib/react/BlockHost";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { showToast } from "@shared/lib/toast/showToast";
import { ReactIcon } from "@shared/ui/Icon/ReactIcon";
import "@pages/signup/SignupPage.css";

export function SignupPage() {
  const createRegisterForm = useCallback(
    () =>
      new RegisterForm({
        onSubmit: async (request) => {
          const result = await submitRegister(request);

          if (result.isOk())
            routerInstance.navigate("/triage");
          else
            showToast(describeHttpError(result.error));
        },
      }),
    [],
  );

  return (
    <main className="signup-page">
      <div className="signup-page__intro">
        <ReactIcon name="heart-pulse" />
        <h1 className="signup-page__title">Crea tu cuenta de paciente</h1>
        <p className="signup-page__subtitle">
          Completa tus datos de identidad para acceder a servicios de telemedicina verificados y seguros.
        </p>
      </div>

      <section className="signup-page__panel">
        <BlockHost createBlock={createRegisterForm} />
        <p className="signup-page__login">
          ¿Ya tenés cuenta?{" "}
          <a className="signup-page__login-link" href={routerInstance.href("/auth")} data-link="">
            Iniciá sesión
          </a>
        </p>
      </section>
    </main>
  );
}
