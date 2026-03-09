import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ReorderAlert } from '@/hooks/use-forecast';

interface Props {
  alert: ReorderAlert;
  onPress?: () => void;
}

const URGENCY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: '#dc2626', bg: '#fef2f2', label: 'Urgent' },
  soon: { color: '#d97706', bg: '#fffbeb', label: 'Reorder Soon' },
  planned: { color: '#0891b2', bg: '#ecfeff', label: 'Planned' },
};

export function ReorderAlertCard({ alert, onPress }: Props) {
  const cfg = URGENCY_CONFIG[alert.urgency];

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: cfg.color }]} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.header}>
        <ThemedText style={styles.drug}>{alert.drug}</ThemedText>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <ThemedText style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</ThemedText>
        </View>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Current Stock</ThemedText>
        <ThemedText style={styles.value}>{alert.currentStock.toLocaleString()}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>30-Day Demand</ThemedText>
        <ThemedText style={styles.value}>{alert.predictedDemand30.toLocaleString()}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Days Until Stockout</ThemedText>
        <ThemedText style={[styles.value, alert.daysUntilStockout <= 7 && { color: '#dc2626' }]}>
          {alert.daysUntilStockout} days
        </ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Suggested Order</ThemedText>
        <ThemedText style={[styles.value, { color: '#0891b2' }]}>{alert.suggestedOrder.toLocaleString()} units</ThemedText>
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
  drug: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
