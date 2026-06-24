import type { TriageScores } from "@entities/triage/model/TriageScores";

export interface TriageOption {
  id: string;
  text: string;
  scores: Partial<TriageScores>;
}
