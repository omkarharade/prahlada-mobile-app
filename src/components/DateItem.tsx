import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type DateItemProps = {
  date: Date;
  isActive: boolean;
  onPress: () => void;
};

export default function DateItem({ date, isActive, onPress }: DateItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={[styles.dateCard, isActive && styles.activeDateCard]}>
      <Text style={[styles.weekday, isActive && styles.activeWeekday]}>
        {date.toLocaleDateString(undefined, { weekday: 'short' })}
      </Text>
      <View style={[styles.dateNumberWrap, isActive && styles.activeNumberWrap]}>
        <Text style={[styles.dateNumber, isActive && styles.activeDateNumber]}>
          {date.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    backgroundColor: '#F0EDF1',
    borderRadius: 23,
    height: 85,
    overflow: 'hidden',
    width: 60,
  },
  activeDateCard: { backgroundColor: '#C72F5D' },
  weekday: { color: '#777078', fontSize: 12, paddingTop: 10, textAlign: 'center' },
  activeWeekday: { color: '#FFFFFF' },
  dateNumberWrap: {
    alignItems: 'center',
    backgroundColor: '#E9E5EA',
    flex: 1,
    justifyContent: 'center',
    marginTop: 6,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  activeNumberWrap: { backgroundColor: '#A91E4A' },
  dateNumber: { color: '#615A63', fontSize: 18 },
  activeDateNumber: { color: '#FFFFFF', fontWeight: '700' },
});
