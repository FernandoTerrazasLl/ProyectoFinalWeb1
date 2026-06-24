import { beforeEach, describe, expect, it, vi } from "vitest";
import { Ok } from "ts-results-es";
import { http } from "@shared/api/http";
import { getPsychologist } from "@entities/psychologist/api/getPsychologist";
import { listPsychologists } from "@entities/psychologist/api/listPsychologists";
import { getMyProviderProfile } from "@entities/psychologist/api/getMyProviderProfile";
import { updateProviderProfile } from "@entities/psychologist/api/updateProviderProfile";

vi.mock("@shared/api/http", () => ({ http: { request: vi.fn() } }));

const request = vi.mocked(http.request);

function buildPsychologistResponse(overrides = {}) {
  return {
    id: "p1",
    first_name: "Carlos",
    last_name: "Vega",
    specialty: "Terapia de Pareja",
    bio: "Soy Carlos Vega.",
    session_price: 100,
    average_rating: 4.5,
    review_count: 12,
    is_approved: true,
    ...overrides,
  };
}

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue(Ok(undefined));
});

describe("Detalle público de un psicólogo [US-API-04]", () => {
  it("pide el detalle por id y lo transforma al modelo de tarjeta [AC-1]", async () => {
    request.mockResolvedValue(Ok(buildPsychologistResponse()));

    const result = await getPsychologist("p1");

    expect(request).toHaveBeenCalledWith("GET", "/psychologists/p1");
    expect(result.unwrap().name).toBe("Carlos Vega");
  });
});

describe("Catálogo de psicólogos con filtros [US-API-02]", () => {
  it("arma la query con búsqueda, especialidad, tarifa y paginación [AC-2]", async () => {
    request.mockResolvedValue(Ok([buildPsychologistResponse()]));

    const result = await listPsychologists({ q: "ansiedad", specialty: "clinica", maxRate: 300, skip: 0, limit: 9 });

    expect(request).toHaveBeenCalledWith(
      "GET",
      "/psychologists/?q=ansiedad&specialty=clinica&maxRate=300&skip=0&limit=9",
      undefined,
      undefined,
    );
    expect(result.unwrap()[0]?.name).toBe("Carlos Vega");
  });

  it("consulta sin query string cuando no hay filtros [AC-1]", async () => {
    request.mockResolvedValue(Ok([]));

    await listPsychologists();

    expect(request).toHaveBeenCalledWith("GET", "/psychologists/", undefined, undefined);
  });
});

describe("Edición del perfil profesional [US-BKG-05]", () => {
  it("transforma la respuesta del backend al borrador del perfil [AC-1]", async () => {
    request.mockResolvedValue(
      Ok({
        first_name: "Marcos",
        last_name: "Vega",
        maternal_last_name: null,
        ci: "1234567",
        birth_date: null,
        gender: null,
        phone_number: "71234567",
        email: null,
        avatar_url: "",
        bio: "Bio",
        session_price: 250,
        tags: ["Ansiedad"],
        specialty: null,
        office_address: "Zona Sur",
      }),
    );

    const result = await getMyProviderProfile();

    expect(request).toHaveBeenCalledWith("GET", "/me/provider-profile");
    expect(result.unwrap().firstName).toBe("Marcos");
    expect(result.unwrap().birthDate).toBe("");
  });

  it("envía null en los campos opcionales vacíos al guardar [AC-2]", async () => {
    await updateProviderProfile({
      firstName: "Marcos",
      lastName: "Vega",
      maternalLastName: "",
      ci: "1234567",
      birthDate: "",
      gender: "",
      phoneNumber: "71234567",
      email: "",
      avatarUrl: "",
      bio: "Bio",
      sessionPrice: 250,
      tags: ["Ansiedad"],
      specialty: "",
      officeAddress: "Zona Sur",
    });

    expect(request).toHaveBeenCalledWith(
      "PUT",
      "/me/provider-profile",
      expect.objectContaining({ birth_date: null, gender: null, email: null, specialty: null, avatar_url: "" }),
    );
  });
});
