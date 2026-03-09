import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { BatchStock } from '@/hooks/use-inventory';

interface Props {
  batches: BatchStock[];
}

export function BatchBreakdownCard({ batches }: Props) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>Batch Breakdown</ThemedText>
      <View style={styles.headerRow}>
        <ThemedText style={[styles.headerCell, { flex: 2 }]}>Batch ID</ThemedText>
        <ThemedText style={styles.headerCell}>Qty</ThemedText>
        <ThemedText style={styles.headerCell}>Expiry</ThemedText>
      </View>
      {batches.map((b, i) => (
        <View key={b.batchId} style={[styles.row, i % 2 === 1 && styles.altRow]}>
          <ThemedText style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{b.batchId}</ThemedText>
          <ThemedText style={styles.cell}>{b.quantity.toLocaleString()}</ThemedText>
          <ThemedText style={styles.cell}>{b.expiryDate}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 4 },
  headerCell: { flex: 1, fontSize: 12, fontWeight: '600', color: '#64748b' },
  row: { flexDirection: 'row', paddingVertical: 8 },
  altRow: { backgroundColor: '#f8fafc' },
  cell: { flex: 1, fontSize: 13, color: '#0f172a' },
});
