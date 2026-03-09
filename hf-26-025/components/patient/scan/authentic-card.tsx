import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ScanResult, CustodyEntry } from '@/hooks/use-scan';

interface Props {
  data: ScanResult;
  onScanAnother: () => void;
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText style={[styles.rowValue, valueColor ? { color: valueColor } : undefined]}>{value}</ThemedText>
    </View>
  );
}

function CustodyStepView({ entry }: { entry: CustodyEntry }) {
  return (
    <View style={styles.custodyStep}>
      <View style={styles.stepDot}>
        <ThemedText style={styles.stepNum}>①②③④⑤⑥⑦⑧⑨⑩</ThemedText>
      </View>
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepActor}>{entry.actor}</ThemedText>
        <ThemedText style={styles.stepAction}>{entry.action} · {entry.timestamp}</ThemedText>
      </View>
    </View>
  );
}

export function AuthenticCard({ data, onScanAnother }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.checkCircle}>
          <ThemedText style={styles.checkIcon}>OK</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.title}>AUTHENTIC</ThemedText>
      <ThemedText style={styles.subtitle}>Verified on blockchain</ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Medicine Details</ThemedText>
        <InfoRow label="Drug" value={data.drug || ''} />
        <InfoRow label="Form" value={data.form || ''} />
        <InfoRow label="Batch ID" value={data.batchId} />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Manufacturer</ThemedText>
        <InfoRow label="Name" value={data.manufacturer || ''} />
        <InfoRow label="Verified" value={data.manufacturerVerified ? 'Yes' : 'No'} />
        <InfoRow label="Registered" value={data.registeredDate || ''} />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Safety Check</ThemedText>
        <InfoRow label="Expiry Date" value={data.expiryDate} />
        <InfoRow label="Days left" value={`${data.daysLeft} days`} />
        <InfoRow label="Status" value="Safe to use" valueColor="#059669" />
      </View>

      {data.custody && data.custody.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Chain of Custody</ThemedText>
          {data.custody.map((c) => (
            <View key={c.step} style={styles.custodyStep}>
              <ThemedText style={styles.stepCircle}>{c.step}</ThemedText>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepActor}>{c.actor}</ThemedText>
                <ThemedText style={styles.stepAction}>{c.action} · {c.timestamp}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {data.txHash && (
        <View style={styles.txBox}>
          <ThemedText style={styles.txLabel}>Tx Hash: {data.txHash.slice(0, 10)}...{data.txHash.slice(-4)}</ThemedText>
          <ThemedText style={styles.txLabel}>Block: #{data.blockNumber}</ThemedText>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={onScanAnother} activeOpacity={0.7}>
        <ThemedText style={styles.btnText}>Scan Another</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  iconWrap: { marginTop: 10, marginBottom: 8 },
  checkCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#059669' },
  checkIcon: { fontSize: 18, fontWeight: '800', color: '#059669' },
  title: { fontSize: 26, fontWeight: '800', color: '#059669', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  section: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { fontSize: 13, color: '#64748b' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#0f172a', flexShrink: 1, textAlign: 'right' },
  custodyStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepDot: { display: 'none' },
  stepNum: { display: 'none' },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0891b2', color: '#fff', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  stepContent: { flex: 1 },
  stepActor: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  stepAction: { fontSize: 13, color: '#64748b' },
  txBox: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  txLabel: { fontSize: 12, color: '#0891b2', fontFamily: 'monospace', marginBottom: 2 },
  btn: { backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
