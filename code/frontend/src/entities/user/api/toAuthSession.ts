import { decodeTokenClaims } from "@shared/lib/token/decodeTokenClaims";
import type { Role } from "@entities/user/model/Role";
import type { AuthSession } from "@entities/user/api/AuthSession";
import type { AuthTokensResponse } from "@entities/user/api/AuthTokensResponse";

export function toAuthSession(tokens: AuthTokensResponse): AuthSession | null {
  const claims = decodeTokenClaims(tokens.access_token);

  if (!claims)
    return null;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    user: { id: claims.sub, name: claims.sub, email: claims.sub, role: claims.role as Role },
  };
}
