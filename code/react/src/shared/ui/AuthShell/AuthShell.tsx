import type { ReactNode } from "react";
import "@shared/ui/AuthShell/AuthShell.css";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-shell__panel">
        <h1 className="auth-shell__title">{title}</h1>
        {subtitle ? <p className="auth-shell__subtitle">{subtitle}</p> : null}
        {children}
        {footer}
      </section>
    </main>
  );
}
