import type { TriageScores } from "@entities/triage/model/TriageScores";

export class TriageScoring {
  private scores: TriageScores = { clinica: 0, pareja: 0, laboral: 0, infantil: 0 };

  add(partial: Partial<TriageScores>) {
    this.scores = {
      clinica: this.scores.clinica + (partial.clinica ?? 0),
      pareja: this.scores.pareja + (partial.pareja ?? 0),
      laboral: this.scores.laboral + (partial.laboral ?? 0),
      infantil: this.scores.infantil + (partial.infantil ?? 0),
    };
  }

  total(): TriageScores {
    return { ...this.scores };
  }
}
