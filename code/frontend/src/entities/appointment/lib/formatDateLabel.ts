const formatter = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });

export function formatDateLabel(date: string): string {
  const [yearPart = "1970", monthPart = "1", dayPart = "1"] = date.split("-");
  const label = formatter.format(new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart)));

  return label.charAt(0).toUpperCase() + label.slice(1);
}
