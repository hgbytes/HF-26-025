import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { StockStatus } from '@/hooks/use-inventory';

interface Props {
  drug: string;
  drugCode: string;
  totalQuantity: number;
  status: StockStatus;
  batchCount: number;
  onPress: () => void;
}

const STATUS_CONFIG: Record<StockStatus, { color: string; bg: string; label: string }> = {
  ok: { color: '#059669', bg: '#ecfdf5', label: 'OK' },
  low: { color: '#d97706', bg: '#fffbeb', label: 'Low' },
  critical: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
};

export function DrugStockCard({ drug, drugCode, totalQuantity, status, batchCount, onPress }: Props) {
  const cfg = STATUS_CONFIG[status];

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: cfg.color }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <ThemedText style={styles.drugName}>{drug}</ThemedText>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <ThemedText style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</ThemedText>
        </View>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Code</ThemedText>
        <ThemedText style={styles.value}>{drugCode}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Total Quantity</ThemedText>
        <ThemedText style={styles.value}>{totalQuantity.toLocaleString()}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Batches</ThemedText>
        <ThemedText style={styles.value}>{batchCount}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  drugName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
