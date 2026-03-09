import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  used: number;
  total: number;
}

export function RefillProgressBar({ used, total }: Props) {
  const remaining = total - used;
  const pct = (used / total) * 100;
  const color = remaining === 0 ? '#dc2626' : remaining <= 1 ? '#f59e0b' : '#0891b2';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>Refill Progress</ThemedText>
        <ThemedText style={styles.count}>{used} / {total} used</ThemedText>
      </View>
      <View style={styles.trackBg}>
        <View style={[styles.trackFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <ThemedText style={[styles.remaining, { color }]}>
        {remaining === 0 ? 'No refills remaining' : `${remaining} refill${remaining > 1 ? 's' : ''} remaining`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  count: { fontSize: 13, color: '#64748b' },
  trackBg: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5 },
  trackFill: { height: 10, borderRadius: 5 },
  remaining: { fontSize: 12, marginTop: 4 },
});
