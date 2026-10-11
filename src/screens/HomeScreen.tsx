import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageRequireSource,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountModal from '../components/CountModal';
import DateItem from '../components/DateItem';
import TaskItem from '../components/TaskItem';
import TimeSettingModal from '../components/TimeSettingModal';
import { icons } from '../constants/icons';
import { DAILY_PRACTICE_RECORDS_STORAGE_KEY } from '../constants/storage';
import { TYPOGRAPHY } from '../constants/typography';
import { useTheme } from '../context/ThemeContext';
import {
  createDailyPracticeRecord,
  DailyPracticeRecord,
  parseDailyPracticeRecords,
  upsertDailyPracticeRecord,
} from '../utils/dailyPracticeRecords';

type TimedPracticeId = 'hearing' | 'reading';

type Practice = {
  id: 'chanting' | TimedPracticeId;
  title: string;
  icon: ImageRequireSource;
  color: string;
};

const practices: Practice[] = [
  { id: 'chanting', title: 'Chanting', icon: icons.MEDITATION, color: '#C72DA9' },
  { id: 'hearing', title: 'Hearing', icon: icons.HEADPHONE, color: '#9B4DE0' },
  { id: 'reading', title: 'Reading', icon: icons.READING, color: '#9B4DE0' },
];

const DATE_CARD_WIDTH = 60;
const DATE_CARD_GAP = 10;
const TODAY_DATE_INDEX = 20;

function getLocalDateKey(date: Date): string {
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

function formatTimeValue(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`
    : `${minutes}:${pad(remainingSeconds)}`;
}

export default function HomeScreen() {
  const { isDark, theme, toggleTheme } = useTheme();
  const [isChantingModalVisible, setChantingModalVisible] = useState(false);
  const [activeTimePracticeId, setActiveTimePracticeId] = useState<TimedPracticeId | null>(null);
  const [records, setRecords] = useState<DailyPracticeRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const recordsRef = useRef<DailyPracticeRecord[]>([]);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const dateScrollRef = useRef<ScrollViewInstance | null>(null);
  const dateViewportWidth = useRef(0);
  const dateContentWidth = useRef(0);
  const hasPositionedDateStrip = useRef(false);
  const dateKey = getLocalDateKey(selectedDate);
  const selectedRecord = records.find(record => record.date === dateKey)
    ?? createDailyPracticeRecord(dateKey);
  const dates = useMemo(
    () => Array.from({ length: 41 }, (_, index) => shiftDate(today, index - 20)),
    [today],
  );
  function positionTodayDate() {
    const dateScrollView = dateScrollRef.current;
    if (
      hasPositionedDateStrip.current
      || !dateScrollView
      || dateViewportWidth.current === 0
      || dateContentWidth.current === 0
    ) {
      return;
    }
    const todayCardOffset = TODAY_DATE_INDEX * (DATE_CARD_WIDTH + DATE_CARD_GAP);
    const centeredOffset = todayCardOffset - (dateViewportWidth.current - DATE_CARD_WIDTH) / 2;
    const maxOffset = dateContentWidth.current - dateViewportWidth.current;
    dateScrollView.scrollTo({
      x: Math.max(0, Math.min(centeredOffset, maxOffset)),
      y: 0,
      animated: false,
    });
    hasPositionedDateStrip.current = true;
  }

  useEffect(() => {
    let isMounted = true;
    async function loadRecords() {
      try {
        const serializedRecords = await AsyncStorage.getItem(DAILY_PRACTICE_RECORDS_STORAGE_KEY);
        const loadedRecords = serializedRecords
          ? parseDailyPracticeRecords(serializedRecords)
          : [];
        if (isMounted) {
          recordsRef.current = loadedRecords;
          setRecords(loadedRecords);
        }
      } catch (error) {
        if (isMounted) {
          setStorageError(
            error instanceof Error
              ? error.message
              : 'Saved daily practice data could not be loaded.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecords(false);
        }
      }
    }
    loadRecords();
    return () => {
      isMounted = false;
    };
  }, []);

  async function saveRecord(
    update: (record: DailyPracticeRecord) => DailyPracticeRecord,
  ): Promise<boolean> {
    if (isLoadingRecords || storageError) {
      Alert.alert('Practice data unavailable', 'Saved practice data could not be loaded.');
      return false;
    }
    const pendingSave = saveQueueRef.current.then(async () => {
      const nextRecords = upsertDailyPracticeRecord(recordsRef.current, dateKey, update);
      await AsyncStorage.setItem(
        DAILY_PRACTICE_RECORDS_STORAGE_KEY,
        JSON.stringify(nextRecords),
      );
      recordsRef.current = nextRecords;
      setRecords(nextRecords);
      setStorageError(null);
    });
    saveQueueRef.current = pendingSave.catch(() => undefined);
    try {
      await pendingSave;
      return true;
    } catch {
      Alert.alert('Could not save practice', 'Your changes could not be saved. Please try again.');
      return false;
    }
  }

  function onPressPractice(practiceId: string) {
    if (practiceId === 'chanting') {
      setChantingModalVisible(true);
    } else if (practiceId === 'hearing' || practiceId === 'reading') {
      setActiveTimePracticeId(practiceId);
    }
  }

  async function saveChantingRounds(rounds: number) {
    const saved = await saveRecord(record => ({
      ...record,
      chanting: {...record.chanting, value: rounds},
    }));
    if (saved) {
      setChantingModalVisible(false);
    }
  }

  async function saveTimedPractice(seconds: number) {
    if (!activeTimePracticeId) {
      return;
    }
    const practiceId = activeTimePracticeId;
    const saved = await saveRecord(record => ({
      ...record,
      [practiceId]: {
        ...record[practiceId],
        valueInSeconds: seconds,
      },
    }));
    if (saved) {
      setActiveTimePracticeId(null);
    }
  }

  const listHeader = (
    <View>
      {storageError && <Text style={styles.storageError}>{storageError}</Text>}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[TYPOGRAPHY.TITLE, { color: theme.text }]}>
            {getLocalDateKey(selectedDate) === getLocalDateKey(new Date())
              ? 'Today'
              : selectedDate.toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <Text style={[styles.themeToggleIcon, { color: theme.text }]}>
              {isDark ? '☀' : '☾'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={dateScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateList}
        onLayout={event => {
          dateViewportWidth.current = event.nativeEvent.layout.width;
          positionTodayDate();
        }}
        onContentSizeChange={width => {
          dateContentWidth.current = width;
          positionTodayDate();
        }}>
        {dates.map(date => (
          <DateItem
            key={getLocalDateKey(date)}
            date={date}
            isActive={getLocalDateKey(date) === dateKey}
            onPress={() => setSelectedDate(date)}
          />
        ))}
      </ScrollView>
    </View>
  );


  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {isLoadingRecords ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#C72F5D" />
        </View>
      ) : (
      <FlatList
        data={practices}
        ListHeaderComponent={listHeader}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isCompleted = item.id === 'chanting'
            ? selectedRecord.chanting.value >= selectedRecord.chanting.goal
            : selectedRecord[item.id].valueInSeconds >= selectedRecord[item.id].goalInSeconds;
          const progress = item.id === 'chanting'
            ? selectedRecord.chanting.goal > 0
              ? (selectedRecord.chanting.value / selectedRecord.chanting.goal) * 100
              : 0
            : selectedRecord[item.id].goalInSeconds > 0
              ? (selectedRecord[item.id].valueInSeconds / selectedRecord[item.id].goalInSeconds) * 100
              : 0;
          const subtitle = item.id === 'chanting'
            ? `${selectedRecord.chanting.value} / ${selectedRecord.chanting.goal} rounds`
            : `${formatTimeValue(selectedRecord[item.id].valueInSeconds)} / ${formatTimeValue(selectedRecord[item.id].goalInSeconds)}`;
          return (
            <TaskItem
              title={item.title}
              icon={item.icon}
              color={item.color}
              subtitle={subtitle}
              progress={progress}
              isCompleted={isCompleted}
              onPress={() => onPressPractice(item.id)}
            />
          );
        }}
        style={styles.practiceList}
        contentContainerStyle={styles.practiceListContent}
        ItemSeparatorComponent={PracticeSeparator}
      />
      )}

      <CountModal
        visible={isChantingModalVisible}
        title="Chanting"
        date={selectedDate}
        icon={icons.MEDITATION}
        value={selectedRecord.chanting.value}
        unit="rounds"
        goal={16}
        onClose={() => setChantingModalVisible(false)}
        onSave={saveChantingRounds}
      />

      {activeTimePracticeId && (
        <TimeSettingModal
          visible
          title={`${activeTimePracticeId === 'hearing' ? 'Hearing' : 'Reading'}`}
          date={selectedDate}
          icon={activeTimePracticeId === 'hearing' ? icons.HEADPHONE : icons.READING}
          valueSeconds={selectedRecord[activeTimePracticeId].valueInSeconds}
          goalSeconds={selectedRecord[activeTimePracticeId].goalInSeconds}
          onClose={() => setActiveTimePracticeId(null)}
          onSave={saveTimedPractice}
        />
      )}
    </SafeAreaView>
  );
}

function PracticeSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#F5F5F5', flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
  },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  themeToggle: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  themeToggleIcon: { fontSize: 24, lineHeight: 28, textAlign: 'center' },
  dateList: { columnGap: DATE_CARD_GAP, paddingHorizontal: 0, paddingBottom: 28 },
  practiceList: { flex: 1 },
  practiceListContent: { paddingHorizontal: 0 },
  separator: { backgroundColor: '#EFECF0', height: 1 },
  loading: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  storageError: {color: '#A33D32', paddingHorizontal: 16, paddingVertical: 8},
});
