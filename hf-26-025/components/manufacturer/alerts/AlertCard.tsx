import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MFG, CardShadow } from '@/constants/theme';
import { AlertItem } from '@/hooks/use-alerts';

interface Props {
  alert: AlertItem;
  onPress: () => void;
}

const SEVERITY: Record<string, { label: string; bg: string; color: string; border: string }> = {
  high:   { label: 'HIGH',   bg: MFG.dangerBg,  color: MFG.danger,  border: MFG.danger },
  medium: { label: 'MEDIUM', bg: MFG.warningBg,  color: MFG.warning, border: MFG.warning },
  low:    { label: 'LOW',    bg: MFG.successBg,  color: MFG.success, border: MFG.success },
};

export function AlertCard({ alert, onPress }: Props) {
  const sev = SEVERITY[alert.severity];
  const isResolved = alert.status === 'resolved';

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: sev.border }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.pill, { backgroundColor: sev.bg }]}>
          <View style={[styles.dot, { backgroundColor: sev.color }]} />
          <ThemedText style={[styles.pillText, { color: sev.color }]}>{sev.label}</ThemedText>
        </View>
        {isResolved && (
          <View style={styles.resolvedPill}>
            <ThemedText style={styles.resolvedText}>RESOLVED</ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.type}>{alert.type}</ThemedText>
      <ThemedText style={styles.meta}>Batch: {alert.batchId}</ThemedText>
      <ThemedText style={styles.meta}>{alert.drug}  ·  {alert.region}</ThemedText>

      {!isResolved && (
        <View style={styles.confidenceRow}>
          <View style={styles.confBarBg}>
            <View style={[styles.confBarFill, { width: `${Math.round(alert.confidence * 100)}%`, backgroundColor: sev.color }]} />
          </View>
          <ThemedText style={[styles.confVal, { color: sev.color }]}>{(alert.confidence * 100).toFixed(0)}%</ThemedText>
        </View>
      )}

      <View style={styles.footer}>
        <ThemedText style={styles.time}>
          {isResolved ? `Resolved: ${alert.timestamp}` : alert.timestamp}
        </ThemedText>
        <ThemedText style={styles.viewLink}>Details →</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MFG.card, borderRadius: MFG.radius, padding: 16,
    borderLeftWidth: 4, gap: 4, ...CardShadow,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  resolvedPill: { backgroundColor: MFG.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: MFG.success },
  resolvedText: { fontSize: 11, fontWeight: '700', color: MFG.success },
  type: { fontSize: 16, fontWeight: '700', color: MFG.text },
  meta: { fontSize: 13, color: MFG.textMuted, fontFamily: 'monospace' },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  confBarBg: { flex: 1, height: 6, backgroundColor: MFG.borderLight, borderRadius: 3, overflow: 'hidden' },
  confBarFill: { height: '100%', borderRadius: 3 },
  confVal: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: MFG.borderLight },
  time: { fontSize: 12, color: MFG.textMuted },
  viewLink: { fontSize: 14, color: MFG.primary, fontWeight: '700' },
});
