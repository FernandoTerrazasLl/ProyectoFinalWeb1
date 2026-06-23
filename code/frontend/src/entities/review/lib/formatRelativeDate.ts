const DAY_MS = 1000 * 60 * 60 * 24;

export function formatRelativeDate(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY_MS);

  if (days <= 0) 
    return "Hoy";
  if (days === 1) 
    return "Hace 1 día";
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
