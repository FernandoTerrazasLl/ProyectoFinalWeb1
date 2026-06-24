import { sessionStore } from "@entities/user/model/sessionStore";

export function updateSessionUserName(firstName: string, lastName: string) {
  const user = sessionStore.getState().user;

  if (!user)
    return;

  sessionStore.setState({ user: { ...user, name: `${firstName} ${lastName}` } });
}
