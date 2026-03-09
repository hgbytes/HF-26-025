import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ForecastItem } from '@/hooks/use-forecast';

interface Props {
  item: ForecastItem;
}

export function ForecastTrendChart({ item }: Props) {
  const maxVal = Math.max(item.forecast30, item.forecast60, item.forecast90, item.currentStock);
  const barHeight = (val: number) => maxVal > 0 ? Math.max((val / maxVal) * 120, 4) : 4;

  const TREND_CONFIG: Record<string, { color: string; label: string }> = {
    rising: { color: '#dc2626', label: '↑ Rising' },
    stable: { color: '#059669', label: '→ Stable' },
    declining: { color: '#0891b2', label: '↓ Declining' },
  };

  const trend = TREND_CONFIG[item.trend];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Demand Trend</ThemedText>
        <ThemedText style={[styles.trendBadge, { color: trend.color }]}>{trend.label}</ThemedText>
      </View>
      <View style={styles.chartRow}>
        <View style={styles.barCol}>
          <View style={[styles.bar, { height: barHeight(item.currentStock), backgroundColor: '#0891b2' }]} />
          <ThemedText style={styles.barLabel}>Now</ThemedText>
          <ThemedText style={styles.barValue}>{item.currentStock.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.barCol}>
          <View style={[styles.bar, { height: barHeight(item.forecast30), backgroundColor: '#94a3b8' }]} />
          <ThemedText style={styles.barLabel}>30d</ThemedText>
          <ThemedText style={styles.barValue}>{item.forecast30.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.barCol}>
          <View style={[styles.bar, { height: barHeight(item.forecast60), backgroundColor: '#94a3b8' }]} />
          <ThemedText style={styles.barLabel}>60d</ThemedText>
          <ThemedText style={styles.barValue}>{item.forecast60.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.barCol}>
          <View style={[styles.bar, { height: barHeight(item.forecast90), backgroundColor: '#64748b' }]} />
          <ThemedText style={styles.barLabel}>90d</ThemedText>
          <ThemedText style={styles.barValue}>{item.forecast90.toLocaleString()}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  trendBadge: { fontSize: 13, fontWeight: '600' },
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, paddingTop: 20 },
  barCol: { alignItems: 'center', gap: 4 },
  bar: { width: 36, borderRadius: 6 },
  barLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  barValue: { fontSize: 11, color: '#0f172a' },
});
