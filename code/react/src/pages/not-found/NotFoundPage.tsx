import { routerInstance } from "@shared/lib/router/routerInstance";
import "@pages/not-found/NotFoundPage.css";

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <h1 className="not-found-page__code">404</h1>
      <p className="not-found-page__description">No encontramos esta página.</p>
      <a className="button button--primary" href={routerInstance.href("/directory")} data-link="">
        Volver al directorio
      </a>
    </main>
  );
}
