import { StyleSheet, View, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC, CardShadow } from '@/constants/theme';
const MFG = HC;
import { BatchResult } from '@/hooks/use-batch';

interface Props {
  batch: BatchResult;
  onBack: () => void;
}

export function TxReceipt({ batch, onBack }: Props) {
  const copyTxHash = () => {
    if (typeof Clipboard?.setString === 'function') {
      Clipboard.setString(batch.txHash);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.heading}>Transaction Receipt</ThemedText>

      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <ThemedText style={styles.label}>Status</ThemedText>
          <View style={styles.confirmedPill}>
            <ThemedText style={styles.confirmedText}>Confirmed</ThemedText>
          </View>
        </View>

        <View style={styles.statusRow}>
          <ThemedText style={styles.label}>Tx Hash</ThemedText>
          <View style={styles.hashRow}>
            <ThemedText style={styles.mono} numberOfLines={1}>
              {batch.txHash.slice(0, 16)}...{batch.txHash.slice(-4)}
            </ThemedText>
            <TouchableOpacity onPress={copyTxHash} style={styles.copyPill}>
              <ThemedText style={styles.copyText}>Copy</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />
        <InfoRow label="Block" value={`#${batch.blockNumber}`} />
        <InfoRow label="Timestamp" value={new Date(batch.timestamp).toLocaleString()} />
        <InfoRow label="Gas Used" value={batch.gasUsed.toLocaleString()} />
        <InfoRow label="Network" value="Ganache Local" />
      </View>

      {/* Batch Details Card */}
      <View style={styles.card}>
        <ThemedText style={styles.sectionLabel}>BATCH DETAILS</ThemedText>
        <InfoRow label="Drug" value={batch.drug} />
        <InfoRow label="Batch ID" value={batch.batchId} mono />
        <InfoRow label="Quantity" value={batch.quantity.toLocaleString()} />
        <InfoRow label="Expiry" value={batch.expiryDate} />
        <InfoRow label="Assigned" value={batch.distributor} />
        <InfoRow label="Region" value={batch.region} />
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <ThemedText style={styles.backText}>Back to QR</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, mono && styles.monoSmall]} numberOfLines={1}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: MFG.bg },
  container: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '800', color: MFG.text, letterSpacing: -0.3, marginBottom: 20 },
  // Card
  card: {
    backgroundColor: MFG.card, borderRadius: MFG.radiusLg, padding: 18,
    marginBottom: 16, ...CardShadow,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: MFG.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  divider: { height: 1, backgroundColor: MFG.borderLight, marginVertical: 4 },
  // Status
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, color: MFG.textMuted },
  confirmedPill: { backgroundColor: MFG.successBg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: MFG.success },
  confirmedText: { color: MFG.success, fontWeight: '700', fontSize: 13 },
  hashRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mono: { fontFamily: 'monospace', fontSize: 12, color: MFG.text },
  copyPill: { backgroundColor: MFG.primaryFaint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  copyText: { color: MFG.primary, fontWeight: '700', fontSize: 12 },
  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: MFG.borderLight },
  infoLabel: { fontSize: 14, color: MFG.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: MFG.text, maxWidth: '60%', textAlign: 'right' },
  monoSmall: { fontFamily: 'monospace', fontSize: 11 },
  // Back
  backBtn: {
    height: 48, borderWidth: 1.5, borderColor: MFG.primary, borderRadius: MFG.radius,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  backText: { color: MFG.primary, fontSize: 15, fontWeight: '600' },
});
