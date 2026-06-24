import { Block } from "@shared/lib/block/Block";
import type { PatientInfoCardProps } from "@widgets/patient-info-modal/PatientInfoCardProps";
import patientInfoCardTemplate from "@widgets/patient-info-modal/PatientInfoCard.hbs?raw";
import "@widgets/patient-info-modal/PatientInfoCard.css";

export class PatientInfoCard extends Block<PatientInfoCardProps> {
  protected template = patientInfoCardTemplate;

  constructor(props: PatientInfoCardProps) {
    const initial = props.info.name.trim().charAt(0).toUpperCase() || "P";
    const timeLabel = props.info.time?.slice(0, 5) ?? "--:--";

    super({ ...props, initial, timeLabel });
  }
}
