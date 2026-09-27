import React from 'react';
import { Image, ImageRequireSource, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { colors } from '../constants/theme';
import { icons } from '../constants/icons';

type TaskItemProps = {
  title: string;
  icon: ImageRequireSource;
  color: string;
  tagColor: string;
  isCompleted: boolean;
  onPress: () => void;
};

export default function TaskItem({
  title,
  icon,
  color,
  tagColor,
  isCompleted,
  onPress,
}: TaskItemProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}>
      <View style={[styles.iconBackground, { backgroundColor: color }]}>
        <Image
          source={icon}
          style={styles.icon}
        />
      </View>
      <View style={styles.details}>
        <Text style={[styles.title]}>{title}</Text>
      </View>
      <View style={[styles.checkCircle, isCompleted && styles.checkedCircle]}>
        {isCompleted && <Image source={icons.CHECK} style={styles.checkmark} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 80,
    paddingHorizontal: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: '#EDE9EE',
  },

  pressedRow: { backgroundColor: COLORS.LIGHT_GREY },
  iconBackground: {
    alignItems: 'center',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  icon: { tintColor: '#FFFFFF', width: 30, height: 30 },
  details: { flex: 1, paddingLeft: 28 },
  title: { color: '#3F3940', fontSize: 18, fontWeight: '400' },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    color: '#A34D9A',
    fontSize: 14,
    marginTop: 7,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
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
