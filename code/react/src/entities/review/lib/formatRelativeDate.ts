const DAY_MS = 1000 * 60 * 60 * 24;

export function formatRelativeDate(isoDate: string): string {
  const reviewDate = new Date(isoDate);
  const today = new Date();
  const days = Math.floor((startOfDay(today) - startOfDay(reviewDate)) / DAY_MS);

  if (days <= 0) 
    return "Hoy";
  if (days === 1) 
    return "Ayer";
  if (days < 7) 
    return `Hace ${days} días`;

  const weeks = Math.floor(days / 7);

  if (weeks === 1) 
    return "Hace 1 semana";
  if (weeks < 4) 
    return `Hace ${weeks} semanas`;

  const months = Math.floor(days / 30);

  if (months === 1) 
    return "Hace 1 mes";
  if (months < 12) 
    return `Hace ${months} meses`;

  const years = Math.floor(days / 365);

  return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
