import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MFG } from '@/constants/theme';
import { TransferRecord } from '@/hooks/use-distributors';

interface Props {
  transfer: TransferRecord;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  received: { label: 'Received', color: MFG.success, bg: MFG.successBg },
  pending:  { label: 'Pending',  color: MFG.warning, bg: MFG.warningBg },
  rejected: { label: 'Rejected', color: MFG.danger,  bg: MFG.dangerBg },
};

export function TransferRow({ transfer }: Props) {
  const st = STATUS_STYLE[transfer.status];
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <ThemedText style={styles.batchId} numberOfLines={1}>{transfer.batchId}</ThemedText>
        <ThemedText style={styles.meta}>{transfer.date}  ·  {transfer.quantity.toLocaleString()} units</ThemedText>
      </View>
      <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
        <View style={[styles.dot, { backgroundColor: st.color }]} />
        <ThemedText style={[styles.statusText, { color: st.color }]}>{st.label}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: MFG.borderLight,
  },
  left: { flex: 1, marginRight: 12 },
  batchId: { fontSize: 12, fontFamily: 'monospace', color: MFG.primary, fontWeight: '600' },
  meta: { fontSize: 13, color: MFG.textMuted, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
});
