import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ScanResult } from '@/hooks/use-scan';

interface Props {
  data: ScanResult;
  onFindStock: () => void;
  onScanAnother: () => void;
}

export function ExpiredCard({ data, onFindStock, onScanAnother }: Props) {
  const daysExpired = data.daysLeft ? Math.abs(data.daysLeft) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.warnCircle}>
          <ThemedText style={styles.warnIcon}>!</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.title}>EXPIRED</ThemedText>
      <ThemedText style={styles.subtitle}>This medicine has passed its expiry date</ThemedText>

      <View style={styles.card}>
        <ThemedText style={styles.sectionTitle}>Medicine Info</ThemedText>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Drug</ThemedText>
          <ThemedText style={styles.rowValue}>{data.drug}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Batch ID</ThemedText>
          <ThemedText style={styles.rowValue}>{data.batchId}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Expiry Date</ThemedText>
          <ThemedText style={[styles.rowValue, { color: '#dc2626' }]}>{data.expiryDate}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.rowLabel}>Days Expired</ThemedText>
          <ThemedText style={[styles.rowValue, { color: '#dc2626' }]}>{daysExpired} days ago</ThemedText>
        </View>
      </View>

      <View style={styles.warningBox}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>!</ThemedText>
        </View>
        <ThemedText style={styles.warningText}>Do not use this medicine. Expired drugs may be ineffective or harmful.</ThemedText>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onFindStock} activeOpacity={0.7}>
        <ThemedText style={styles.primaryBtnText}>Find Available Stock</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onScanAnother} activeOpacity={0.7}>
        <ThemedText style={styles.secondaryBtnText}>Scan Another</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  iconWrap: { marginTop: 10, marginBottom: 8 },
  warnCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#f59e0b' },
  warnIcon: { fontSize: 24, fontWeight: '800', color: '#f59e0b' },
  title: { fontSize: 26, fontWeight: '800', color: '#f59e0b', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20, textAlign: 'center' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { fontSize: 13, color: '#64748b' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  warningBox: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fef2f2', borderRadius: 14, borderWidth: 1, borderColor: '#fecaca', padding: 14, marginBottom: 20 },
  warningIcon: { fontSize: 20 },
  warningText: { flex: 1, fontSize: 13, color: '#991b1b', lineHeight: 18 },
  primaryBtn: { width: '100%', backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { width: '100%', borderWidth: 2, borderColor: '#0891b2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText: { color: '#0891b2', fontSize: 16, fontWeight: '700' },
});
