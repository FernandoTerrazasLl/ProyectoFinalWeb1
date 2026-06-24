import { Block } from "@shared/lib/block/Block";
import type { PsychologistDetailProps } from "@widgets/psychologist-detail/PsychologistDetailProps";
import psychologistDetailTemplate from "@widgets/psychologist-detail/PsychologistDetail.hbs?raw";
import "@widgets/psychologist-detail/PsychologistDetail.css";

export class PsychologistDetail extends Block<PsychologistDetailProps> {
  protected template = psychologistDetailTemplate;
}
