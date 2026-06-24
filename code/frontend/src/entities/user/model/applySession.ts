import { http } from "@shared/api/http";
import { sessionStore } from "@entities/user/model/sessionStore";
import { saveSession } from "@entities/user/model/saveSession";
import type { AuthSession } from "@entities/user/api/AuthSession";

export function applySession(session: AuthSession) {
  http.setTokens(session.accessToken, session.refreshToken);
  http.setOnAccessTokenRefreshed((accessToken) => {
    sessionStore.setState({ accessToken });
    const currentSession = sessionStore.getState();
    if (currentSession.user) {
      saveSession({
        accessToken,
        refreshToken: session.refreshToken,
        user: currentSession.user
      });
    }
  });
  sessionStore.setState({ accessToken: session.accessToken, user: session.user, role: session.user.role });
  saveSession(session);
}
