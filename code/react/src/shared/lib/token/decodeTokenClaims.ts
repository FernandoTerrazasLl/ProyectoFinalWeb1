import { Result } from "ts-results-es";
import type { TokenClaims } from "@shared/lib/token/TokenClaims";

export function decodeTokenClaims(token: string): TokenClaims | null {
  const payloadSegment = token.split(".")[1];

  if (!payloadSegment)
    return null;

  const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = Result.wrap(() => JSON.parse(atob(base64)) as TokenClaims);

  return decoded.isOk() ? decoded.value : null;
}
