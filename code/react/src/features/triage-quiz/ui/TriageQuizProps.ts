import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { TriageQuestion, TriageScores } from "@entities/triage";
import type { QuizOptionView } from "@features/triage-quiz/ui/QuizOptionView";

export interface TriageQuizProps extends BlockOwnProps {
  questions: TriageQuestion[];
  onComplete: (scores: TriageScores) => void;
  onCancel: () => void;
  questionText?: string;
  options?: QuizOptionView[];
  progress?: number;
  canContinue?: boolean;
}
