import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing} from '../constants/theme';
import {useSadhana} from '../context/SadhanaContext';
import {formatDate, formatDuration} from '../utils/sadhana';

export default function HistoryScreen() {
  const {entries} = useSadhana();
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><Text style={styles.title}>History</Text></View>
    <FlatList data={entries} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Your saved practice will appear here.</Text>} renderItem={({item}) => (
      <View style={styles.row}><Text style={styles.date}>{formatDate(item.date)}</Text><View style={styles.values}><Text style={styles.value}>{item.chantingRounds} rounds</Text><Text style={styles.value}>{formatDuration(item.readingDurationMinutes)} read</Text><Text style={styles.value}>{formatDuration(item.hearingDurationMinutes)} heard</Text></View></View>
    )} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {backgroundColor: colors.background, flex: 1},
  header: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg},
  title: {color: colors.text, fontSize: 24, fontWeight: '800'},
  list: {paddingHorizontal: spacing.lg}, row: {backgroundColor: colors.surface, borderRadius: 14, marginBottom: spacing.sm, padding: spacing.md},
  date: {color: colors.text, fontSize: 16, fontWeight: '700'}, values: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm},
  value: {color: colors.muted, fontSize: 14}, empty: {color: colors.muted, padding: spacing.xl, textAlign: 'center'},
});
