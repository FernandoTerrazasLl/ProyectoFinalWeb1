import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { TriageQuiz } from "@features/triage-quiz";
import { triageQuestions, triageResultStore, evaluateTriage } from "@entities/triage";
import { sessionStore } from "@entities/user";
import { routerInstance } from "@shared/lib/router/routerInstance";
import triagePageTemplate from "@pages/triage/TriagePage.hbs?raw";
import "@pages/triage/TriagePage.css";

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
          triageResultStore.setState({ result: result.value });
          routerInstance.navigate("/triage/result");
        }
      },
    }));
  }
}
