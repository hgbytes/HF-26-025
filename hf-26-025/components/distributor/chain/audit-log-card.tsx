import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { AuditEntry, AuditAction } from '@/hooks/use-chain-history';

interface Props {
  entry: AuditEntry;
  onPress: () => void;
}

const ACTION_CONFIG: Record<AuditAction, { color: string; icon: string; label: string }> = {
  BATCH_CREATED: { color: '#059669', icon: '+', label: 'Batch Created' },
  TRANSFER_INITIATED: { color: '#0891b2', icon: 'T', label: 'Transfer Initiated' },
  TRANSFER_ACCEPTED: { color: '#059669', icon: 'A', label: 'Transfer Accepted' },
  TRANSFER_REJECTED: { color: '#dc2626', icon: 'R', label: 'Transfer Rejected' },
  BATCH_FLAGGED: { color: '#d97706', icon: '!', label: 'Batch Flagged' },
  BATCH_DEACTIVATED: { color: '#64748b', icon: 'D', label: 'Batch Deactivated' },
  EXPIRY_CHECK: { color: '#7c3aed', icon: 'E', label: 'Expiry Check' },
};

export function AuditLogCard({ entry, onPress }: Props) {
  const cfg = ACTION_CONFIG[entry.action];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.actionRow}>
          <ThemedText style={styles.actionIcon}>{cfg.icon}</ThemedText>
          <ThemedText style={[styles.actionLabel, { color: cfg.color }]}>{cfg.label}</ThemedText>
        </View>
        <ThemedText style={styles.timestamp}>{entry.timestamp}</ThemedText>
      </View>
      <ThemedText style={styles.drug}>{entry.drug}</ThemedText>
      <ThemedText style={styles.details} numberOfLines={2}>{entry.details}</ThemedText>
      <View style={styles.footer}>
        <ThemedText style={styles.actor}>{entry.actorRole}</ThemedText>
        <ThemedText style={styles.block}>Block #{entry.blockNumber}</ThemedText>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionIcon: { fontSize: 11, fontWeight: '800', color: '#0891b2', backgroundColor: '#ecfeff', width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, overflow: 'hidden' },
  actionLabel: { fontSize: 13, fontWeight: '700' },
  timestamp: { fontSize: 12, color: '#94a3b8' },
  drug: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  details: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  actor: { fontSize: 12, color: '#7c3aed', fontWeight: '600' },
  block: { fontSize: 12, color: '#94a3b8' },
});
