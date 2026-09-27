import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DAILY_PRACTICE_RECORDS_STORAGE_KEY} from '../constants/storage';
import {TYPOGRAPHY} from '../constants/typography';
import {DailyPracticeRecord, parseDailyPracticeRecords} from '../utils/dailyPracticeRecords';

type HistoryDay = {
  date: Date;
  dateKey: string;
  record?: DailyPracticeRecord;
};

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDate(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`;
}

export default function HistoryScreen() {
  const [records, setRecords] = useState<DailyPracticeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({length: 21}, (_, index) => {
      const date = shiftDate(today, index - 20);
      return {date, dateKey: getDateKey(date)};
    });
  }, []);
  const dateRange = `${days[0].date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} - ${days[days.length - 1].date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`;

  useEffect(() => {
    let isMounted = true;
    async function loadRecords() {
      try {
        const serialized = await AsyncStorage.getItem(DAILY_PRACTICE_RECORDS_STORAGE_KEY);
        const savedRecords = serialized ? parseDailyPracticeRecords(serialized) : [];
        if (isMounted) {
          setRecords(savedRecords);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'History could not be loaded.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadRecords();
    return () => {
      isMounted = false;
    };
  }, []);

  const recordByDate = useMemo(
    () => new Map(records.map(record => [record.date, record])),
    [records],
  );
  const historyDays: HistoryDay[] = days.map(day => ({
    ...day,
    record: recordByDate.get(day.dateKey),
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={styles.title.color} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, TYPOGRAPHY.TITLE]}>History</Text>
        <Text style={[styles.subtitle, TYPOGRAPHY.SECONDARY]}>{dateRange}</Text>
      </View>

      {error ? (
        <Text style={[styles.error, TYPOGRAPHY.BODY]}>{error}</Text>
      ) : (
        <FlatList
          data={historyDays}
          keyExtractor={item => item.dateKey}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <HistoryRow item={item} />
          )}
          ItemSeparatorComponent={HistorySeparator}
        />
      )}
    </SafeAreaView>
  );
}

function HistoryRow({item}: {item: HistoryDay}) {
  const {date, record} = item;
  const hasChanting = record !== undefined && record.chanting.value > 0;
  const hasReading = record !== undefined && record.reading.valueInSeconds > 0;
  const hasHearing = record !== undefined && record.hearing.valueInSeconds > 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.dateBadge}>
          <Text style={[styles.weekday, TYPOGRAPHY.CAPTION]}>
            {date.toLocaleDateString(undefined, {weekday: 'short'})}
          </Text>
          <Text style={[styles.dayNumber, TYPOGRAPHY.HEADING]}>{date.getDate()}</Text>
        </View>
        <View style={styles.values}>
          <HistoryValue
            label="Chanting"
            value={hasChanting ? `${record.chanting.value} / ${record.chanting.goal} rounds` : '--'}
          />
          <HistoryValue
            label="Reading"
            value={
              hasReading
                ? `${formatDuration(record.reading.valueInSeconds)} / ${formatDuration(record.reading.goalInSeconds)}`
                : '--'
            }
          />
          <HistoryValue
            label="Hearing"
            value={
              hasHearing
                ? `${formatDuration(record.hearing.valueInSeconds)} / ${formatDuration(record.hearing.goalInSeconds)}`
                : '--'
            }
          />
        </View>
      </View>
    </View>
  );
}

function HistoryValue({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.valueRow}>
      <Text style={[styles.valueLabel, TYPOGRAPHY.CAPTION]}>{label}</Text>
      <Text style={[styles.value, TYPOGRAPHY.SECONDARY]}>{value}</Text>
    </View>
  );
}

function HistorySeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: {backgroundColor: '#F5F5F5', flex: 1},
  header: {paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12},
  title: {color: '#352F35'},
  subtitle: {color: '#817580', marginTop: 4},
  list: {paddingHorizontal: 12, paddingBottom: 12},
  row: {
    backgroundColor: '#F8F6F8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowContent: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 92,
  },
  dateBadge: {
    alignItems: 'center',
    backgroundColor: '#F0EDF1',
    borderRadius: 14,
    height: 62,
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    width: 54,
  },
  weekday: {color: '#777078'},
  dayNumber: {color: '#493E47', marginTop: 2},
  values: {flex: 1, gap: 3},
  valueRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  valueLabel: {color: '#777078'},
  value: {color: '#493E47', textAlign: 'right'},
  separator: {height: 6},
  centered: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  error: {color: '#A33D32', padding: 20},
});
