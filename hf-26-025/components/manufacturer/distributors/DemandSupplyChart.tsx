import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MFG } from '@/constants/theme';
import { DemandSupplyItem } from '@/hooks/use-distributors';

interface Props {
  data: DemandSupplyItem[];
}

const DEMAND_COLOR = '#f97316';

export function DemandSupplyChart({ data }: Props) {
  const maxVal = Math.max(...data.flatMap((d) => [d.demand, d.supply]), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>Demand vs Supply</ThemedText>
        <ThemedText style={styles.subtitle}>30 days</ThemedText>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: DEMAND_COLOR }]} />
          <ThemedText style={styles.legendText}>Demand</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MFG.primary }]} />
          <ThemedText style={styles.legendText}>Supply</ThemedText>
        </View>
      </View>
      {data.map((item, i) => {
        const demandWidth = (item.demand / maxVal) * 100;
        const supplyWidth = (item.supply / maxVal) * 100;
        const gap = item.supply < item.demand;
        return (
          <View key={i} style={styles.barGroup}>
            <ThemedText style={styles.drugLabel}>{item.drug}</ThemedText>
            <View style={styles.barRow}>
              <View style={styles.barBg}>
                <View style={[styles.bar, { width: `${demandWidth}%`, backgroundColor: DEMAND_COLOR }]} />
              </View>
              <ThemedText style={styles.barValue}>{item.demand.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.barRow}>
              <View style={styles.barBg}>
                <View style={[styles.bar, { width: `${supplyWidth}%`, backgroundColor: gap ? MFG.danger : MFG.primary }]} />
              </View>
              <ThemedText style={[styles.barValue, gap && { color: MFG.danger, fontWeight: '700' }]}>{item.supply.toLocaleString()}</ThemedText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontSize: 15, fontWeight: '700', color: MFG.text },
  subtitle: { fontSize: 12, color: MFG.textMuted },
  legend: { flexDirection: 'row', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: MFG.textMuted },
  barGroup: { gap: 4, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: MFG.borderLight },
  drugLabel: { fontSize: 13, fontWeight: '600', color: MFG.textSecondary },
  barRow: { flexDirection: 'row', alignItems: 'center', height: 20, gap: 8 },
  barBg: { flex: 1, height: 12, backgroundColor: MFG.borderLight, borderRadius: 6, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 6, minWidth: 4 },
  barValue: { fontSize: 11, color: MFG.textMuted, width: 48, textAlign: 'right' },
});
