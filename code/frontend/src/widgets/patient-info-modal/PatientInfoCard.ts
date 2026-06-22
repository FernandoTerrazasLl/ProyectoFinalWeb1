import { Block } from "@shared/lib/block/Block";
import type { PatientInfoCardProps } from "@widgets/patient-info-modal/PatientInfoCardProps";
import patientInfoCardTemplate from "@widgets/patient-info-modal/PatientInfoCard.hbs?raw";
import "@widgets/patient-info-modal/PatientInfoCard.css";

export class PatientInfoCard extends Block<PatientInfoCardProps> {
  protected template = patientInfoCardTemplate;
}
