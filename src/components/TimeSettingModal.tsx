import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  ImageRequireSource,
  Modal,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TimeSettingModalProps = {
  visible: boolean;
  title: string;
  date: Date;
  icon: ImageRequireSource;
  valueSeconds: number;
  goalSeconds: number;
  onClose: () => void;
  onSave: (seconds: number) => void;
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  return `${pad(totalMinutes)}:${pad(seconds % 60)}`;
}

function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export default function TimeSettingModal({
  visible,
  title,
  date,
  icon,
  valueSeconds,
  goalSeconds,
  onClose,
  onSave,
}: TimeSettingModalProps) {
  const [draftSeconds, setDraftSeconds] = useState(valueSeconds);
  const [isTimerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftSeconds(valueSeconds);
      setTimerRunning(false);
    }
  }, [valueSeconds, visible]);

  useEffect(() => {
    if (!visible || !isTimerRunning) {
      return;
    }
    const interval = setInterval(() => {
      setDraftSeconds(seconds => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, visible]);

  function setUnit(unit: 'hours' | 'minutes' | 'seconds', value: number) {
    setDraftSeconds(current => {
      const hours = Math.floor(current / 3600);
      const minutes = Math.floor((current % 3600) / 60);
      const seconds = current % 60;
      if (unit === 'hours') {
        return value * 3600 + minutes * 60 + seconds;
      }
      if (unit === 'minutes') {
        return hours * 3600 + value * 60 + seconds;
      }
      return hours * 3600 + minutes * 60 + value;
    });
  }

  const hours = Math.floor(draftSeconds / 3600);
  const minutes = Math.floor((draftSeconds % 3600) / 60);
  const seconds = draftSeconds % 60;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.date}>{formatDate(date)}</Text>
            </View>
            <View style={styles.iconBackground}>
              <Image source={icon} style={styles.icon} />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.timePicker}>
              <TimeUnitPicker
                label="hours"
                value={hours}
                maxValue={23}
                onChange={value => setUnit('hours', value)}
              />
              <Text style={styles.colon}>:</Text>
              <TimeUnitPicker
                label="minutes"
                value={minutes}
                maxValue={59}
                onChange={value => setUnit('minutes', value)}
              />
              <Text style={styles.colon}>:</Text>
              <TimeUnitPicker
                label="seconds"
                value={seconds}
                maxValue={59}
                onChange={value => setUnit('seconds', value)}
              />
            </View>
            <View style={styles.progress}>
              <Text style={styles.progressLabel}>Today</Text>
              <Text style={styles.progressValue}>
                {formatDuration(draftSeconds)} / {formatDuration(goalSeconds)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.action}>
              <Text style={styles.closeText}>CLOSE</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isTimerRunning ? 'Pause timer' : 'Start timer'}
              onPress={() => setTimerRunning(running => !running)}
              style={[styles.action, styles.timerAction]}>
              <Text style={[styles.timerIcon, isTimerRunning && styles.timerActive]}>
                ◷
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSave(draftSeconds)}
              style={[styles.action, styles.confirmAction]}>
              <Text style={styles.confirmText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TimeUnitPicker({
  label,
  value,
  maxValue,
  onChange,
}: {
  label: string;
  value: number;
  maxValue: number;
  onChange: (value: number) => void;
}) {
  const valueCount = maxValue + 1;
  const values = Array.from({length: valueCount * 2}, (_, index) => index % valueCount);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const lastPickerValue = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(valueCount + value);

  useEffect(() => {
    if (lastPickerValue.current === value) {
      lastPickerValue.current = null;
      return;
    }
    const index = valueCount + value;
    setSelectedIndex(index);
    scrollRef.current?.scrollTo({
      x: 0,
      y: index * PICKER_ITEM_HEIGHT,
      animated: false,
    });
  }, [value, valueCount]);

  function selectScrollPosition(offsetY: number) {
    const index = Math.max(
      0,
      Math.min(values.length - 1, Math.round(offsetY / PICKER_ITEM_HEIGHT)),
    );
    selectIndex(index);
  }

  function selectIndex(index: number, scrollToIndex = false) {
    const boundedIndex = Math.max(0, Math.min(values.length - 1, index));
    if (boundedIndex === selectedIndex) {
      return;
    }
    const selectedValue = values[boundedIndex];
    setSelectedIndex(boundedIndex);
    lastPickerValue.current = selectedValue;
    onChange(selectedValue);
    if (scrollToIndex) {
      scrollRef.current?.scrollTo({
        x: 0,
        y: boundedIndex * PICKER_ITEM_HEIGHT,
        animated: true,
      });
    }
  }

  return (
    <View style={styles.unit}>
      <ScrollView
        ref={scrollRef}
        accessibilityLabel={`${label}, ${pad(value)}`}
        accessibilityRole="adjustable"
        contentContainerStyle={styles.pickerContent}
        decelerationRate="fast"
        onMomentumScrollEnd={event =>
          selectScrollPosition(event.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={event =>
          selectScrollPosition(event.nativeEvent.contentOffset.y)
        }
        style={styles.pickerScroll}
        snapToInterval={PICKER_ITEM_HEIGHT}
        showsVerticalScrollIndicator={false}
        contentOffset={{x: 0, y: (valueCount + value) * PICKER_ITEM_HEIGHT}}
        nestedScrollEnabled>
        {values.map((item, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            onPress={() => selectIndex(index, true)}
            style={styles.pickerItem}>
            <Text
              style={[
                styles.pickerText,
                index === selectedIndex ? styles.selectedPickerText : styles.adjacentPickerText,
              ]}>
              {pad(item)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.unitLabel}>{label}</Text>
    </View>
  );
}

const PICKER_ITEM_HEIGHT = 52;

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modal: {
    backgroundColor: '#F8F6F8',
    borderRadius: 28,
    maxWidth: 480,
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#EEE9ED',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heading: {gap: 5},
  title: {color: '#493E47', fontSize: 16, fontWeight: '700'},
  date: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2D8ED',
    borderRadius: 4,
    color: '#A84A9C',
    fontSize: 13,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  iconBackground: {
    alignItems: 'center',
    backgroundColor: '#9B4DE0',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  icon: {height: 23, tintColor: '#FFFFFF', width: 23},
  content: {
    borderBottomColor: '#EEE9ED',
    borderBottomWidth: 1,
    gap: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  timePicker: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  unit: {alignItems: 'center', flex: 1},
  pickerScroll: {height: PICKER_ITEM_HEIGHT * 3, width: '100%'},
  pickerContent: {paddingVertical: PICKER_ITEM_HEIGHT},
  pickerItem: {
    alignItems: 'center',
    borderBottomColor: '#EAE2E8',
    borderBottomWidth: 1,
    height: PICKER_ITEM_HEIGHT,
    justifyContent: 'center',
  },
  pickerText: {fontSize: 28},
  selectedPickerText: {color: '#493E47'},
  adjacentPickerText: {color: '#A49AA2'},
  colon: {color: '#6B5765', fontSize: 30, marginBottom: 35},
  unitLabel: {color: '#A49AA2', fontSize: 12, marginTop: 12},
  progress: {
    alignItems: 'center',
    backgroundColor: '#F4EEF2',
    borderColor: '#EAE2E8',
    borderRadius: 14,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
  },
  progressLabel: {color: '#938791', fontSize: 12},
  progressValue: {color: '#817580', fontSize: 15, marginTop: 1},
  actions: {flexDirection: 'row', height: 56},
  action: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  timerAction: {borderLeftColor: '#EEE9ED', borderLeftWidth: 1, borderRightColor: '#EEE9ED', borderRightWidth: 1},
  closeText: {color: '#493E47', fontSize: 14, fontWeight: '600'},
  timerIcon: {color: '#6B5765', fontSize: 24},
  timerActive: {color: '#9B4DE0'},
  confirmAction: {},
  confirmText: {color: '#9B4DE0', fontSize: 14, fontWeight: '700'},
});
