export type SadhanaEntry = {
  id: string;
  date: string;
  chantingRounds: number;
  readingDurationMinutes: number;
  hearingDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type SadhanaExport = {
  version: number;
  exportedAt: string;
  entries: SadhanaEntry[];
};

export function createEntry(
  values: Omit<SadhanaEntry, 'id' | 'createdAt' | 'updatedAt'>,
): SadhanaEntry {
  const now = new Date().toISOString();
  return {...values, id: `${Date.now()}-${Math.random()}`, createdAt: now, updatedAt: now};
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
