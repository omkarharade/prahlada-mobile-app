export type CountPracticeValue = {
  type: 'count';
  goal: number;
  value: number;
};

export type TimePracticeValue = {
  type: 'time';
  goalInSeconds: number;
  valueInSeconds: number;
};

export type DailyPracticeRecord = {
  date: string;
  chanting: CountPracticeValue;
  reading: TimePracticeValue;
  hearing: TimePracticeValue;
};

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isCountPracticeValue(value: unknown): value is CountPracticeValue {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return candidate.type === 'count'
    && isNonNegativeNumber(candidate.goal)
    && isNonNegativeNumber(candidate.value);
}

function isTimePracticeValue(value: unknown): value is TimePracticeValue {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return candidate.type === 'time'
    && isNonNegativeNumber(candidate.goalInSeconds)
    && isNonNegativeNumber(candidate.valueInSeconds);
}

function isDailyPracticeRecord(value: unknown): value is DailyPracticeRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return isDateKey(candidate.date)
    && isCountPracticeValue(candidate.chanting)
    && isTimePracticeValue(candidate.reading)
    && isTimePracticeValue(candidate.hearing);
}

export function parseDailyPracticeRecords(serialized: string): DailyPracticeRecord[] {
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.every(isDailyPracticeRecord)) {
    throw new Error('Stored daily practice data has an invalid format.');
  }
  const records = parsed as DailyPracticeRecord[];
  const uniqueDates = new Set(records.map(record => record.date));
  if (uniqueDates.size !== records.length) {
    throw new Error('Stored daily practice data contains duplicate dates.');
  }
  return [...records].sort((left, right) => left.date.localeCompare(right.date));
}

export function createDailyPracticeRecord(date: string): DailyPracticeRecord {
  return {
    date,
    chanting: {type: 'count', goal: 16, value: 0},
    reading: {type: 'time', goalInSeconds: 1200, valueInSeconds: 0},
    hearing: {type: 'time', goalInSeconds: 1800, valueInSeconds: 0},
  };
}

export function upsertDailyPracticeRecord(
  records: DailyPracticeRecord[],
  date: string,
  update: (record: DailyPracticeRecord) => DailyPracticeRecord,
): DailyPracticeRecord[] {
  const existing = records.find(record => record.date === date) ?? createDailyPracticeRecord(date);
  const updated = update(existing);
  return [
    ...records.filter(record => record.date !== date),
    updated,
  ].sort((left, right) => left.date.localeCompare(right.date));
}
