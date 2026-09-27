import React from 'react';
import { Image, ImageRequireSource, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { colors } from '../constants/theme';
import { icons } from '../constants/icons';

type TaskItemProps = {
  title: string;
  icon: ImageRequireSource;
  color: string;
  subtitle: string;
  progress: number;
  isCompleted: boolean;
  onPress: () => void;
};

export default function TaskItem({
  title,
  icon,
  color,
  subtitle,
  progress,
  isCompleted,
  onPress,
}: TaskItemProps) {
  const progressPercentage = Math.max(0, Math.min(100, progress));
  const progressColor = progressPercentage >= 100
    ? '#388E3C'
    : progressPercentage >= 80
      ? '#A5D6A7'
      : progressPercentage >= 25
        ? '#FFE08A'
        : '#F4B9B9';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}>
      <View style={styles.taskContent}>
        <View style={[styles.iconBackground, { backgroundColor: color }]}>
          <Image
            source={icon}
            style={styles.icon}
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.checkCircle, isCompleted && styles.checkedCircle]}>
          {isCompleted && <Image source={icons.CHECK} style={styles.checkmark} />}
        </View>
      </View>
      <View
        accessibilityLabel={`Progress ${Math.round(progressPercentage)} percent`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progressPercentage) }}
        style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: progressColor, width: `${progressPercentage}%` },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'center',
    minHeight: 92,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  taskContent: { alignItems: 'center', flexDirection: 'row', minHeight: 60 },
  pressedRow: { backgroundColor: COLORS.LIGHT_GREY },
  iconBackground: {
    alignItems: 'center',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  icon: { tintColor: '#FFFFFF', width: 30, height: 30 },
  details: { flex: 1, paddingLeft: 28, justifyContent: 'center' },
  title: { color: '#3F3940', fontSize: 18, fontWeight: '400' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  progressTrack: {
    backgroundColor: '#EAE2E8',
    borderRadius: 4,
    height: 6,
    marginTop: 9,
    overflow: 'hidden',
  },
  progressFill: { borderRadius: 4, height: '100%' },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: '#EDE9EE',
    borderRadius: 20,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  checkedCircle: { backgroundColor: COLORS.GREEN },
  checkmark: { tintColor: COLORS.WHITE, width: 20, height: 20 },
});
