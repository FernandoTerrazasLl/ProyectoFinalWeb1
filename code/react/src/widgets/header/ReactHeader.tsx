import { useEffect, useRef, useState } from "react";
import { ReactIcon } from "@shared/ui/Icon/ReactIcon";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { useStore } from "@shared/lib/store/useStore";
import { clearStoredSession, logoutUser, sessionStore } from "@entities/user";
import "@widgets/header/Header.css";

export function ReactHeader() {
  const session = useStore(sessionStore);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const userName = session.user?.name ?? null;
  const isProvider = session.role === "PROVIDER";

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);

    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const logout = async () => {
    await logoutUser();
    clearStoredSession();
    sessionStore.setState({ accessToken: null, user: null, role: "guest" });
    routerInstance.navigate("/auth");
  };

  return (
    <header className="header">
      <a className="header__brand" href={routerInstance.href("/directory")} data-link="">
        <ReactIcon name="heart-pulse" />
        <span className="header__brand-name">CuraMente</span>
      </a>
      {userName ? (
        <div className="header__profile" ref={profileRef}>
          <button
            className="header__avatar"
            type="button"
            aria-label="Menú de perfil"
            aria-haspopup="true"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <ReactIcon name="user" />
          </button>
          {menuOpen ? (
            <div className="header__menu">
              <p className="header__menu-name">{userName}</p>
              <a
                className="header__menu-item"
                href={routerInstance.href("/patient-profile")}
                data-link=""
                onClick={() => setMenuOpen(false)}
              >
                <ReactIcon name="settings" />
                Mi Perfil
              </a>
              {isProvider ? (
                <a
                  className="header__menu-item"
                  href={routerInstance.href("/dashboard/profile")}
                  data-link=""
                  onClick={() => setMenuOpen(false)}
                >
                  <ReactIcon name="briefcase" />
                  Modo Psicólogo
                </a>
              ) : null}
              <button className="header__menu-item header__logout" type="button" onClick={() => void logout()}>
                <ReactIcon name="log-out" />
                Cerrar Sesión
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <a className="header__link" href={routerInstance.href("/auth")} data-link="">
          Iniciar sesión
        </a>
      )}
    </header>
  );
}
