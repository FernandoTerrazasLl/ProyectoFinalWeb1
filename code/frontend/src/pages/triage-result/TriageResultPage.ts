import { Block } from "@shared/lib/block/Block";
import { PsychologistCard } from "@widgets/psychologist-card";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { triageResultStore } from "@entities/triage";
import { listPsychologists } from "@entities/psychologist";
import { routerInstance } from "@shared/lib/router/routerInstance";
import type { TriageResultPageProps } from "@pages/triage-result/TriageResultPageProps";
import triageResultPageTemplate from "@pages/triage-result/TriageResultPage.hbs?raw";
import "@pages/triage-result/TriageResultPage.css";

const SPECIALTY_LABELS: Record<string, string> = {
  clinica: "Psicología Clínica",
  pareja: "Terapia de Pareja",
  laboral: "Psicología Laboral",
  infantil: "Psicología Infantil",
};

const RISK_LABELS: Record<string, string> = {
  Low: "bajo",
  Moderate: "moderado",
  Severe: "alto",
};

export class TriageResultPage extends Block<TriageResultPageProps> {
  protected template = triageResultPageTemplate;
  private readonly specialty: string;

  constructor(props: TriageResultPageProps) {
    super(props);

    const result = triageResultStore.getState().result;
    this.specialty = result?.recommendedSpecialty ?? "";

    if (!result) {
      routerInstance.navigate("/triage");
      return;
    }

    this.setProps({
      specialtyLabel: SPECIALTY_LABELS[result.recommendedSpecialty] ?? result.recommendedSpecialty,
      riskLabel: RISK_LABELS[result.riskLevel] ?? result.riskLevel,
    });
  }

  protected componentDidMount() {
    if (this.specialty)
      void this.loadRecommended();
  }

  private async loadRecommended() {
    this.replaceChildrenInto("results", [new Spinner({})]);

    const result = await listPsychologists({ specialty: this.specialty });

    if (result.isErr() || result.value.length === 0) {
      this.replaceChildrenInto("results", [new EmptyState({ title: "Sin especialistas disponibles por ahora" })]);
      return;
    }

    this.replaceChildrenInto(
      "results",
      result.value.map((psychologist) =>
        new PsychologistCard({ psychologist, onOpen: (id) => routerInstance.navigate(`/profile/${id}`) }),
      ),
    );
  }
}
