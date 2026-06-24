import type { HttpError } from "@shared/api/HttpError";

export function describeHttpError(error: HttpError): string {
  if (error.status === 0)
    return "No se pudo conectar con el servidor. Revisa tu conexión.";
  if (error.status === 401)
    return "Correo o contraseña incorrectos.";
  if (error.message.toLowerCase().includes("already registered"))
    return "Ese correo ya está registrado.";
  if (error.status >= 500)
    return "Ocurrió un error en el servidor. Inténtalo más tarde.";
  return "No pudimos completar la solicitud. Verifica los datos e inténtalo de nuevo.";
}
