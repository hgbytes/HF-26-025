import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { TransferResult } from '@/hooks/use-transfers';

interface Props {
  result: TransferResult;
  onDone: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
}

export function TxConfirmation({ result, onDone }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrap}>
        <ThemedText style={styles.checkIcon}>✓</ThemedText>
      </View>
      <ThemedText style={styles.title}>Transfer Submitted</ThemedText>
      <ThemedText style={styles.subtitle}>The transfer has been recorded on-chain</ThemedText>

      <View style={styles.card}>
        <InfoRow label="Transfer ID" value={result.transferId} />
        <InfoRow label="Batch ID" value={result.batchId} />
        <InfoRow label="Tx Hash" value={`${result.txHash.slice(0, 18)}...`} />
        <InfoRow label="Block" value={`#${result.blockNumber}`} />
        <InfoRow label="Gas Used" value={result.gasUsed.toLocaleString()} />
        <InfoRow label="Timestamp" value={new Date(result.timestamp).toLocaleString()} />
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.7}>
        <ThemedText style={styles.doneText}>Back to Transfers</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  checkIcon: { fontSize: 32, color: '#059669' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 24 },
  card: {
    width: '100%',
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a', flexShrink: 1, textAlign: 'right' },
  doneBtn: { marginTop: 28, backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  doneText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
