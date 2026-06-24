import type { TriageOption } from "@entities/triage/model/TriageOption";

export interface TriageQuestion {
  id: number;
  question: string;
  options: TriageOption[];
}
