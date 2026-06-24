import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { PsychologistCardProps } from "@widgets/psychologist-card/PsychologistCardProps";
import psychologistCardTemplate from "@widgets/psychologist-card/PsychologistCard.hbs?raw";
import "@widgets/psychologist-card/PsychologistCard.css";

export class PsychologistCard extends Block<PsychologistCardProps> {
  protected template = psychologistCardTemplate;
  protected events: EventListType = {
    click: (event) => {
      if ((event.target as Element).closest(".psychologist-card__open")) 
        this.props.onOpen(this.props.psychologist.id);
    },
  };
}
