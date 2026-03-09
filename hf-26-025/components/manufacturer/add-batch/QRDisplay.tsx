import { StyleSheet, View, ScrollView, TouchableOpacity, Share } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC, CardShadow } from '@/constants/theme';
const MFG = HC;
import { BatchResult } from '@/hooks/use-batch';
import QRCode from 'react-native-qrcode-svg';

interface Props {
  batch: BatchResult;
  onRegisterAnother: () => void;
  onViewReceipt: () => void;
}

export function QRDisplay({ batch, onRegisterAnother, onViewReceipt }: Props) {
  const qrData = JSON.stringify({
    batchId: batch.batchId,
    drug: batch.drug,
    manufacturer: batch.manufacturer,
    expiryDate: batch.expiryDate,
    qrHash: batch.qrHash,
  });

  const handleShare = async () => {
    await Share.share({ message: `MedChain TN Batch\n${batch.batchId}\n\n${qrData}` });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success Banner */}
      <View style={styles.successCard}>
        <View style={styles.checkCircle}>
          <ThemedText style={styles.checkIcon}>✓</ThemedText>
        </View>
        <ThemedText style={styles.successTitle}>Batch Registered</ThemedText>
        <ThemedText style={styles.successSub}>Successfully recorded on blockchain</ThemedText>
      </View>

      {/* QR Code */}
      <View style={styles.qrCard}>
        <QRCode
          value={qrData}
          size={180}
          color={MFG.text}
          backgroundColor={MFG.card}
        />
        <ThemedText style={styles.qrLabel}>Scan to verify batch</ThemedText>
      </View>

      {/* Details */}
      <View style={styles.detailsCard}>
        <ThemedText style={styles.detailsTitle}>Batch Summary</ThemedText>
        <DetailRow label="Batch ID" value={batch.batchId} mono />
        <DetailRow label="Drug" value={batch.drug} />
        <DetailRow label="Quantity" value={`${batch.quantity.toLocaleString()} units`} />
        <DetailRow label="Expiry" value={batch.expiryDate} />
        <DetailRow label="Region" value={batch.region} />
        <DetailRow label="Distributor" value={batch.distributor} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.outlineBtn} onPress={onViewReceipt} activeOpacity={0.7}>
            <ThemedText style={styles.outlineText}>View Receipt</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleShare} activeOpacity={0.7}>
            <ThemedText style={styles.outlineText}>Share QR</ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRegisterAnother} activeOpacity={0.8}>
          <ThemedText style={styles.primaryText}>Register Another Batch</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={[styles.detailValue, mono && styles.mono]} numberOfLines={1}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: MFG.bg },
  container: { padding: 20, paddingBottom: 48, alignItems: 'center' },
  // Success
  successCard: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  checkCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: MFG.successBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2, borderColor: MFG.success,
  },
  checkIcon: { fontSize: 28, color: MFG.success, fontWeight: '700' },
  successTitle: { fontSize: 22, fontWeight: '800', color: MFG.text, letterSpacing: -0.3 },
  successSub: { fontSize: 14, color: MFG.textMuted, marginTop: 4 },
  // QR
  qrCard: {
    backgroundColor: MFG.card, borderRadius: MFG.radiusLg, padding: 24,
    alignItems: 'center', marginBottom: 24, width: '100%',
    ...CardShadow,
  },
  qrLabel: { fontSize: 13, color: MFG.textMuted, marginTop: 14, letterSpacing: 0.3 },
  // Details
  detailsCard: {
    backgroundColor: MFG.card, borderRadius: MFG.radiusLg, padding: 18,
    width: '100%', marginBottom: 24, ...CardShadow,
  },
  detailsTitle: { fontSize: 13, fontWeight: '700', color: MFG.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: MFG.borderLight,
  },
  detailLabel: { fontSize: 14, color: MFG.textMuted },
  detailValue: { fontSize: 14, fontWeight: '600', color: MFG.text, maxWidth: '55%', textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  // Actions
  actions: { width: '100%', gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  outlineBtn: {
    flex: 1, height: 48,
    borderWidth: 1.5, borderColor: MFG.primary, borderRadius: MFG.radius,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineText: { color: MFG.primary, fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    height: 54, backgroundColor: MFG.primary, borderRadius: MFG.radius,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: MFG.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
