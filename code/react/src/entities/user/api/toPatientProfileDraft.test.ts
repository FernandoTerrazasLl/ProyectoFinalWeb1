import { describe, expect, it } from "vitest";
import { toPatientProfileDraft } from "@entities/user/api/toPatientProfileDraft";
import type { MyProfileResponse } from "@entities/user/api/MyProfileResponse";

function buildResponse(overrides: Partial<MyProfileResponse> = {}): MyProfileResponse {
  return {
    first_name: "Ana",
    last_name: "López",
    maternal_last_name: "Vargas",
    ci: "1234567",
    birth_date: "1990-01-01",
    gender: "F",
    phone_number: "70000000",
    email: "ana@correo.com",
    avatar_url: "",
    ...overrides,
  };
}

describe("Borrador del perfil del paciente [US-AUTH-01]", () => {
  it("mapea los campos snake_case del backend a camelCase [AC-1]", () => {
    const response = buildResponse();

    const draft = toPatientProfileDraft(response);

    expect(draft.firstName).toBe("Ana");
    expect(draft.maternalLastName).toBe("Vargas");
    expect(draft.phoneNumber).toBe("70000000");
  });
});
