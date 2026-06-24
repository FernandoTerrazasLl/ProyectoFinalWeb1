import { beforeEach, describe, expect, it, vi } from "vitest";
import { Ok } from "ts-results-es";
import { http } from "@shared/api/http";
import { listReviews } from "@entities/review/api/listReviews";
import { submitReview } from "@entities/review/api/submitReview";

vi.mock("@shared/api/http", () => ({ http: { request: vi.fn() } }));

const request = vi.mocked(http.request);

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue(Ok(undefined));
});

describe("Listado de reseñas de un psicólogo [US-UGC-02]", () => {
  it("pide las reseñas del psicólogo por id [AC-1]", async () => {
    await listReviews("p1");

    expect(request).toHaveBeenCalledWith("GET", "/psychologists/p1/reviews");
  });
});

describe("Calificación de la atención recibida [US-UGC-01]", () => {
  it("envía proveedor, usuario, puntaje y comentario al módulo UGC [AC-1]", async () => {
    await submitReview({ providerId: "p1", userId: "u1", rating: 5, comment: "Excelente" });

    expect(request).toHaveBeenCalledWith("POST", "/ugc/reviews", {
      provider_id: "p1",
      user_id: "u1",
      rating: 5,
      comment: "Excelente",
    });
  });
});
