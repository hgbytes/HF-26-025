import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { TransferItem } from '@/hooks/use-transfers';

interface Props {
  transfer: TransferItem;
  onPress: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#d97706', bg: '#fffbeb', label: 'Pending' },
  accepted: { color: '#059669', bg: '#ecfdf5', label: 'Accepted' },
  rejected: { color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
  cancelled: { color: '#64748b', bg: '#f1f5f9', label: 'Cancelled' },
};

export function TransferHistoryCard({ transfer, onPress }: Props) {
  const cfg = STATUS_CONFIG[transfer.status];
  const isIncoming = transfer.direction === 'incoming';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.directionBadge}>
          <ThemedText style={[styles.directionText, { color: isIncoming ? '#059669' : '#0891b2' }]}>
            {isIncoming ? '↓ IN' : '↑ OUT'}
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <ThemedText style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.drug}>{transfer.drug}</ThemedText>
      <View style={styles.row}>
        <ThemedText style={styles.label}>{isIncoming ? 'From' : 'To'}</ThemedText>
        <ThemedText style={styles.value}>{isIncoming ? transfer.from : transfer.to}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Quantity</ThemedText>
        <ThemedText style={styles.value}>{transfer.quantity.toLocaleString()}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Date</ThemedText>
        <ThemedText style={styles.value}>{transfer.completedDate || transfer.initiatedDate}</ThemedText>
      </View>
    </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  directionBadge: { paddingHorizontal: 8, paddingVertical: 2 },
  directionText: { fontSize: 13, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  drug: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
