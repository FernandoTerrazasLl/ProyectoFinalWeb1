import { Store } from "@shared/lib/store/Store";
import type { TriageResult } from "@entities/triage/model/TriageResult";

export const triageResultStore = new Store<{ result: TriageResult | null }>({ result: null });
