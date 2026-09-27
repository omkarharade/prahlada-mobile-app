import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ImageRequireSource,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountModal from '../components/CountModal';
import DateItem from '../components/DateItem';
import TaskItem from '../components/TaskItem';
import TimeSettingModal from '../components/TimeSettingModal';
import { icons } from '../constants/icons';
import { TYPOGRAPHY } from '../constants/typography';

type TimedPracticeId = 'hearing' | 'reading';

type Practice = {
  id: string;
  title: string;
  icon: ImageRequireSource;
  color: string;
  tagColor: string;
};

const practices: Practice[] = [
  { id: 'chanting', title: 'Chanting', icon: icons.MEDITATION, color: '#C72DA9', tagColor: '#F7DFF2' },
  { id: 'hearing', title: 'Hearing', icon: icons.HEADPHONE, color: '#9B4DE0', tagColor: '#EEE0F8' },
  { id: 'reading', title: 'Reading', icon: icons.READING, color: '#9B4DE0', tagColor: '#EEE0F8' },
];

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

export default function HomeScreen() {
  const [isChantingModalVisible, setChantingModalVisible] = useState(false);
  const [chantingRoundsByDate, setChantingRoundsByDate] = useState<Record<string, number>>({});
  const [activeTimePracticeId, setActiveTimePracticeId] = useState<TimedPracticeId | null>(null);
  const [timeSecondsByDate, setTimeSecondsByDate] = useState<
    Record<string, Partial<Record<TimedPracticeId, number>>>
  >({});

  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [completedByDate, setCompletedByDate] = useState<Record<string, string[]>>({});
  const dateKey = getLocalDateKey(selectedDate);
  const completed = completedByDate[dateKey] ?? [];
  const dates = useMemo(
    () => Array.from({ length: 22 }, (_, index) => shiftDate(today, index - 7)),
    [today],
  );
  const initialDateScrollX = Math.max(0, 18 + 7 * 92 - (width - 82) / 2);

  function onPressPractice(practiceId: string) {
    if (practiceId === 'chanting') {
      setChantingModalVisible(true);
    } else if (practiceId === 'hearing' || practiceId === 'reading') {
      setActiveTimePracticeId(practiceId);
    }
  }

  function saveChantingRounds(rounds: number) {
    setChantingRoundsByDate(current => ({
      ...current,
      [dateKey]: rounds,
    }));
    setCompletedByDate(current => {
      const selectedCompleted = current[dateKey] ?? [];
      const hasReachedGoal = rounds >= 16;
      const nextCompleted = hasReachedGoal
        ? selectedCompleted.includes('chanting')
          ? selectedCompleted
          : [...selectedCompleted, 'chanting']
        : selectedCompleted.filter(id => id !== 'chanting');
      return { ...current, [dateKey]: nextCompleted };
    });
    setChantingModalVisible(false);
  }

  function saveTimedPractice(seconds: number) {
    if (!activeTimePracticeId) {
      return;
    }
    const practiceId = activeTimePracticeId;
    const goalSeconds = practiceId === 'hearing' ? 30 * 60 : 20 * 60;
    setTimeSecondsByDate(current => ({
      ...current,
      [dateKey]: {...current[dateKey], [practiceId]: seconds},
    }));
    setCompletedByDate(current => {
      const selectedCompleted = current[dateKey] ?? [];
      const nextCompleted = seconds >= goalSeconds
        ? selectedCompleted.includes(practiceId)
          ? selectedCompleted
          : [...selectedCompleted, practiceId]
        : selectedCompleted.filter(id => id !== practiceId);
      return {...current, [dateKey]: nextCompleted};
    });
    setActiveTimePracticeId(null);
  }

  const listHeader = (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, TYPOGRAPHY.TITLE]}>
          {getLocalDateKey(selectedDate) === getLocalDateKey(new Date())
            ? 'Today'
            : selectedDate.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateList}
        contentOffset={{ x: initialDateScrollX, y: 0 }}>
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
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={practices}
        ListHeaderComponent={listHeader}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isCompleted = completed.includes(item.id);
          return (
            <TaskItem
              title={item.title}
              icon={item.icon}
              color={item.color}
              tagColor={item.tagColor}
              isCompleted={isCompleted}
              onPress={() => onPressPractice(item.id)}
            />
          );
        }}
        style={styles.practiceList}
        contentContainerStyle={styles.practiceListContent}
        ItemSeparatorComponent={PracticeSeparator}
      />

      <CountModal
        visible={isChantingModalVisible}
        title="Chanting"
        date={selectedDate}
        icon={icons.MEDITATION}
        value={chantingRoundsByDate[dateKey] ?? 0}
        unit="rounds"
        goal={16}
        onClose={() => setChantingModalVisible(false)}
        onSave={saveChantingRounds}
      />

      {activeTimePracticeId && (
        <TimeSettingModal
          visible
          title={`${activeTimePracticeId === 'hearing' ? 'Hearing' : 'Reading'} - Spiritual`}
          date={selectedDate}
          icon={activeTimePracticeId === 'hearing' ? icons.HEADPHONE : icons.READING}
          valueSeconds={timeSecondsByDate[dateKey]?.[activeTimePracticeId] ?? 0}
          goalSeconds={activeTimePracticeId === 'hearing' ? 30 * 60 : 20 * 60}
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
  title: { color: '#352F35' },
  dateList: { columnGap: 10, paddingHorizontal: 0, paddingBottom: 28 },
  practiceList: { flex: 1 },
  practiceListContent: { paddingHorizontal: 0 },
  separator: { backgroundColor: '#EFECF0', height: 1 },

});
