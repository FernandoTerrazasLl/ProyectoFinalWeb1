import { http } from "@shared/api/http";
import { sessionStore } from "@entities/user/model/sessionStore";
import type { AuthSession } from "@entities/user/api/AuthSession";

export function applySession(session: AuthSession) {
  http.setTokens(session.accessToken, session.refreshToken);
  http.setOnAccessTokenRefreshed((accessToken) => sessionStore.setState({ accessToken }));
  sessionStore.setState({ accessToken: session.accessToken, user: session.user, role: session.user.role });
}
