import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { TriageQuiz } from "@features/triage-quiz";
import { triageQuestions, evaluateTriage } from "@entities/triage";
import { sessionStore } from "@entities/user";
import { routerInstance } from "@shared/lib/router/routerInstance";
import { Modal } from "@shared/ui/Modal/Modal";
import triagePageTemplate from "@pages/triage/TriagePage.hbs?raw";
import "@pages/triage/TriagePage.css";

interface TriageResultBodyProps extends BlockOwnProps {
  specialty: string;
  onContinue: () => void;
}

class TriageResultBody extends Block<TriageResultBodyProps> {
  protected template = `
    <div style="padding: 1.5rem; text-align: center;">
      <h2 style="font-family: var(--font-sans); font-size: 1.5rem; font-weight: 700; color: var(--color-text); margin-bottom: 1rem;">Evaluación Completada</h2>
      <p style="font-family: var(--font-sans); font-size: 1rem; color: var(--color-muted); margin-bottom: 1.5rem;">
        Según tus respuestas, te recomendamos buscar un especialista en <strong>{{specialty}}</strong>.
      </p>
      <button id="btn-continue" style="padding: 0.75rem 1.5rem; background-color: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-family: var(--font-sans); font-weight: 500; cursor: pointer; width: 100%;">
        Ver Especialistas
      </button>
    </div>
  `;
  protected events = {
    click: (e: Event) => {
      if ((e.target as Element).id === "btn-continue") {
         this.props.onContinue();
      }
    }
  };
}

export class TriagePage extends Block<BlockOwnProps> {
  protected template = triagePageTemplate;

  protected componentDidMount() {
    const userId = sessionStore.getState().user?.id ?? "";

    this.mountInto("quiz", new TriageQuiz({
      questions: triageQuestions,
      onCancel: () => routerInstance.navigate("/directory"),
      onComplete: async (scores) => {
        const result = await evaluateTriage(userId, scores);

        if (result.isOk()) {
          const specialtyRaw = result.value.recommendedSpecialty;
          const SPECIALTY_LABELS: Record<string, string> = {
            clinica: "Psicologia Clinica",
            pareja: "Terapia de Pareja",
            laboral: "Psicologia Laboral",
            infantil: "Psicologia Infantil",
          };
          const mappedSpecialty = SPECIALTY_LABELS[specialtyRaw] ?? specialtyRaw;

          const body = new TriageResultBody({ 
            specialty: mappedSpecialty, 
            onContinue: () => {
              modal.element()?.remove();
              routerInstance.navigate("/directory?specialty=" + encodeURIComponent(mappedSpecialty));
            }
          });

          const modal = new Modal({
            title: "Resultado de Evaluación",
            body,
            onClose: () => {
               routerInstance.navigate("/directory?specialty=" + encodeURIComponent(mappedSpecialty));
            }
          });

          document.body.appendChild(modal.element()!);
        }
      },
    }));
  }
}
