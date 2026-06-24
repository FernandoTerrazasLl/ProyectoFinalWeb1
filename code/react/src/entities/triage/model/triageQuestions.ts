import type { TriageQuestion } from "@entities/triage/model/TriageQuestion";

export const triageQuestions: TriageQuestion[] = [
  {
    id: 1,
    question: "¿Qué describe mejor lo que estás sintiendo últimamente?",
    options: [
      { id: "1a", text: "Ansiedad, tristeza o estrés personal", scores: { clinica: 3 } },
      { id: "1b", text: "Conflictos en mi relación de pareja", scores: { pareja: 3 } },
      { id: "1c", text: "Agotamiento o problemas en el trabajo", scores: { laboral: 3 } },
      { id: "1d", text: "Preocupación por un niño o adolescente", scores: { infantil: 3 } },
    ],
  },
  {
    id: 2,
    question: "¿En qué área buscás principalmente acompañamiento?",
    options: [
      { id: "2a", text: "Mi bienestar emocional individual", scores: { clinica: 2 } },
      { id: "2b", text: "La comunicación con mi pareja", scores: { pareja: 2 } },
      { id: "2c", text: "El equilibrio entre vida y trabajo", scores: { laboral: 2 } },
      { id: "2d", text: "El desarrollo de un menor a mi cargo", scores: { infantil: 2 } },
    ],
  },
  {
    id: 3,
    question: "¿Con qué frecuencia esto afecta tu día a día?",
    options: [
      { id: "3a", text: "Casi todos los días", scores: { clinica: 2, laboral: 1 } },
      { id: "3b", text: "Sobre todo cuando estoy con mi pareja", scores: { pareja: 2 } },
      { id: "3c", text: "Principalmente en horario laboral", scores: { laboral: 2 } },
      { id: "3d", text: "Cuando acompaño a un menor", scores: { infantil: 2 } },
    ],
  },
];
