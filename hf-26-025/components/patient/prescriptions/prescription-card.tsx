import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { PrescriptionItem } from '@/hooks/use-prescriptions';
import type { StockBadge } from '@/hooks/use-drugs';

interface Props {
  item: PrescriptionItem;
  onPress: () => void;
}

const BADGE_MAP: Record<StockBadge, { label: string; color: string; bg: string }> = {
  in_stock: { label: 'In Stock', color: '#059669', bg: '#ecfdf5' },
  low: { label: 'Low Stock', color: '#d97706', bg: '#fffbeb' },
  critical: { label: 'Critical', color: '#dc2626', bg: '#fef2f2' },
  unavailable: { label: 'Unavailable', color: '#64748b', bg: '#f1f5f9' },
};

export function PrescriptionCard({ item, onPress }: Props) {
  const badge = BADGE_MAP[item.stockBadge];
  const refillsLeft = item.refillsTotal - item.refillsUsed;
  const refillPct = (item.refillsUsed / item.refillsTotal) * 100;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.drug}>{item.drug} {item.form}</ThemedText>
          <ThemedText style={styles.dosage}>{item.dosage}</ThemedText>
        </View>
        <View style={[styles.statusTag, { backgroundColor: item.status === 'active' ? '#dbeafe' : '#f1f5f9' }]}>
          <ThemedText style={[styles.statusText, { color: item.status === 'active' ? '#1d4ed8' : '#64748b' }]}>
            {item.status === 'active' ? 'Active' : 'Completed'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.info}>
        <ThemedText style={styles.infoText}>Dr. {item.doctor}</ThemedText>
        <ThemedText style={styles.infoText}>{item.prescribedDate}</ThemedText>
      </View>

      <View style={styles.refillRow}>
        <ThemedText style={styles.refillLabel}>Refills: {refillsLeft}/{item.refillsTotal} remaining</ThemedText>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${refillPct}%` }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <ThemedText style={[styles.badgeText, { color: badge.color }]}>{badge.label}</ThemedText>
        </View>
        {item.nextRefillDate && (
          <ThemedText style={styles.nextRefill}>Next refill: {item.nextRefillDate}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  drug: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  dosage: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  info: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  infoText: { fontSize: 13, color: '#64748b' },
  refillRow: { marginBottom: 10 },
  refillLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  progressBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#0891b2', borderRadius: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  nextRefill: { fontSize: 12, color: '#059669' },
});
