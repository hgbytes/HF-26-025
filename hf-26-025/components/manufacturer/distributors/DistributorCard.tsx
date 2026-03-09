import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC, CardShadow } from '@/constants/theme';
const MFG = HC;
import { DistributorSummary } from '@/hooks/use-distributors';

interface Props {
  distributor: DistributorSummary;
  onPress: () => void;
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  healthy:  { label: 'Healthy',  color: MFG.success, bg: MFG.successBg },
  low:      { label: 'Low',      color: MFG.warning, bg: MFG.warningBg },
  critical: { label: 'Critical', color: MFG.danger,  bg: MFG.dangerBg },
};

export function DistributorCard({ distributor, onPress }: Props) {
  const badge = STATUS[distributor.stockStatus];
  const transferAge =
    distributor.lastTransferDays <= 5 ? MFG.success
    : distributor.lastTransferDays <= 10 ? MFG.warning
    : MFG.danger;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <ThemedText style={styles.name}>{distributor.name}</ThemedText>
        <ThemedText style={styles.arrow}>›</ThemedText>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <ThemedText style={styles.metricVal}>{distributor.activeBatches}</ThemedText>
          <ThemedText style={styles.metricLabel}>Batches</ThemedText>
        </View>
        <View style={[styles.metric, styles.metricBorder]}>
          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: badge.color }]} />
            <ThemedText style={[styles.statusText, { color: badge.color }]}>{badge.label}</ThemedText>
          </View>
          <ThemedText style={styles.metricLabel}>Stock</ThemedText>
        </View>
        <View style={[styles.metric, styles.metricBorder]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={[styles.statusDot, { backgroundColor: transferAge }]} />
            <ThemedText style={styles.metricVal}>{distributor.lastTransferDays}d</ThemedText>
          </View>
          <ThemedText style={styles.metricLabel}>Last Transfer</ThemedText>
        </View>
      </View>

      {distributor.alertCount > 0 && (
        <View style={styles.alertRow}>
          <View style={[styles.statusDot, { backgroundColor: MFG.danger }]} />
          <ThemedText style={styles.alertText}>{distributor.alertCount} alert{distributor.alertCount > 1 ? 's' : ''} pending</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MFG.card, borderRadius: MFG.radius, padding: 16,
    ...CardShadow,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  name: { fontSize: 17, fontWeight: '700', color: MFG.text },
  arrow: { fontSize: 24, color: MFG.primary, fontWeight: '300' },
  metrics: { flexDirection: 'row', marginBottom: 4 },
  metric: { flex: 1, alignItems: 'center', gap: 4 },
  metricBorder: { borderLeftWidth: 1, borderLeftColor: MFG.borderLight },
  metricVal: { fontSize: 16, fontWeight: '800', color: MFG.text },
  metricLabel: { fontSize: 11, color: MFG.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: MFG.borderLight },
  alertText: { fontSize: 13, color: MFG.danger, fontWeight: '600' },
});
