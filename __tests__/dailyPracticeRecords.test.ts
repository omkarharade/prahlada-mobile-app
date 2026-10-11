import {
  createDailyPracticeRecord,
  parseDailyPracticeRecords,
  upsertDailyPracticeRecord,
} from '../src/utils/dailyPracticeRecords';

test('parses records in ascending date order', () => {
  const laterRecord = createDailyPracticeRecord('2026-09-27');
  const earlierRecord = createDailyPracticeRecord('2026-09-26');

  expect(parseDailyPracticeRecords(JSON.stringify([laterRecord, earlierRecord]))).toEqual([
    earlierRecord,
    laterRecord,
  ]);
});

test('upserts a date without discarding other dates and preserves sorting', () => {
  const records = [createDailyPracticeRecord('2026-09-27')];
  const nextRecords = upsertDailyPracticeRecord(records, '2026-09-26', record => ({
    ...record,
    chanting: {...record.chanting, value: 18},
  }));

  expect(nextRecords.map(record => record.date)).toEqual(['2026-09-26', '2026-09-27']);
  expect(nextRecords[0].chanting).toEqual({type: 'count', goal: 16, value: 18});
  expect(nextRecords[1]).toEqual(records[0]);
});
