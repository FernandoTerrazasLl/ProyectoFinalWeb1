import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { TriageScores } from "@entities/triage";
import type { TriageQuizProps } from "@features/triage-quiz/ui/TriageQuizProps";
import triageQuizTemplate from "@features/triage-quiz/ui/TriageQuiz.hbs?raw";
import "@features/triage-quiz/ui/TriageQuiz.css";

export class TriageQuiz extends Block<TriageQuizProps> {
  protected template = triageQuizTemplate;
  private currentIndex = 0;
  private selectedOptionId: string | null = null;
  private scores: TriageScores = { clinica: 0, pareja: 0, laboral: 0, infantil: 0 };
  protected events: EventListType = {
    click: (event) => this.handleClick(event),
  };

  constructor(props: TriageQuizProps) {
    super(props);
    this.showCurrentQuestion();
  }

  private showCurrentQuestion() {
    const question = this.props.questions[this.currentIndex];

    if (!question)
      return;

    this.setProps({
      questionText: question.question,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        selected: option.id === this.selectedOptionId,
      })),
      progress: Math.round((this.currentIndex / this.props.questions.length) * 100),
      canContinue: this.selectedOptionId !== null,
    });
  }

  private handleClick(event: Event) {
    const target = event.target as Element;
    const optionButton = target.closest("[data-option-id]");

    if (optionButton) {
      this.selectedOptionId = optionButton.getAttribute("data-option-id");
      this.showCurrentQuestion();
      return;
    }

    if (target.closest(".triage-quiz__cancel"))
      this.props.onCancel();
    if (target.closest(".triage-quiz__continue") && this.selectedOptionId)
      this.goToNextQuestion();
  }

  private goToNextQuestion() {
    const question = this.props.questions[this.currentIndex];
    const selectedOption = question?.options.find((option) => option.id === this.selectedOptionId);

    if (selectedOption)
      this.addScores(selectedOption.scores);

    this.selectedOptionId = null;
    this.currentIndex += 1;

    if (this.currentIndex >= this.props.questions.length)
      this.props.onComplete(this.scores);
    else
      this.showCurrentQuestion();
  }

  private addScores(partial: Partial<TriageScores>) {
    this.scores = {
      clinica: this.scores.clinica + (partial.clinica ?? 0),
      pareja: this.scores.pareja + (partial.pareja ?? 0),
      laboral: this.scores.laboral + (partial.laboral ?? 0),
      infantil: this.scores.infantil + (partial.infantil ?? 0),
    };
  }
}
