import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ScanResult } from '@/hooks/use-scan';

interface Props {
  data: ScanResult;
  onReport: () => void;
  onScanAgain: () => void;
}

export function InvalidCard({ data, onReport, onScanAgain }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.errorCircle}>
          <ThemedText style={styles.errorIcon}>X</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.title}>WARNING</ThemedText>
      <ThemedText style={styles.subtitle}>Batch not found on blockchain</ThemedText>

      <View style={styles.card}>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Batch ID</ThemedText>
          <ThemedText style={styles.rowValue}>{data.batchId}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Reason</ThemedText>
          <ThemedText style={[styles.rowValue, { color: '#dc2626' }]}>{data.reason || 'Not registered'}</ThemedText>
        </View>
      </View>

      <View style={styles.warningBox}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>!</ThemedText>
        </View>
        <View style={styles.warningContent}>
          <ThemedText style={styles.warningTitle}>Do not use this medicine</ThemedText>
          <ThemedText style={styles.warningText}>
            This batch could not be verified. It may be counterfeit, recalled, or not yet registered.
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity style={styles.reportBtn} onPress={onReport} activeOpacity={0.7}>
        <ThemedText style={styles.reportBtnText}>Report Suspicious Medicine</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onScanAgain} activeOpacity={0.7}>
        <ThemedText style={styles.secondaryBtnText}>Scan Again</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  iconWrap: { marginTop: 10, marginBottom: 8 },
  errorCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#dc2626' },
  errorIcon: { fontSize: 22, fontWeight: '800', color: '#dc2626' },
  title: { fontSize: 26, fontWeight: '800', color: '#dc2626', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { fontSize: 13, color: '#64748b' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#0f172a', flexShrink: 1, textAlign: 'right' },
  warningBox: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fef2f2', borderRadius: 14, borderWidth: 1, borderColor: '#fecaca', padding: 14, marginBottom: 20 },
  warningIcon: { fontSize: 20, marginTop: 2 },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#991b1b', marginBottom: 4 },
  warningText: { fontSize: 13, color: '#991b1b', lineHeight: 18 },
  reportBtn: { width: '100%', backgroundColor: '#dc2626', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  reportBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { width: '100%', borderWidth: 2, borderColor: '#0891b2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText: { color: '#0891b2', fontSize: 16, fontWeight: '700' },
});
