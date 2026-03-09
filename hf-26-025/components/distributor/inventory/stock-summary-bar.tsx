import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  total: number;
  ok: number;
  low: number;
  critical: number;
}

export function StockSummaryBar({ total, ok, low, critical }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <ThemedText style={styles.count}>{total}</ThemedText>
        <ThemedText style={styles.label}>Total Drugs</ThemedText>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <ThemedText style={[styles.count, { color: '#059669' }]}>{ok}</ThemedText>
        <ThemedText style={styles.label}>OK</ThemedText>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <ThemedText style={[styles.count, { color: '#d97706' }]}>{low}</ThemedText>
        <ThemedText style={styles.label}>Low</ThemedText>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <ThemedText style={[styles.count, { color: '#dc2626' }]}>{critical}</ThemedText>
        <ThemedText style={styles.label}>Critical</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  item: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#e2e8f0' },
  count: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 11, color: '#64748b', marginTop: 2 },
});
