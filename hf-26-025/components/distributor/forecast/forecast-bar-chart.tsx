import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ForecastItem } from '@/hooks/use-forecast';

interface Props {
  items: ForecastItem[];
  horizon: 30 | 60 | 90;
}

function getBarWidth(value: number, max: number): number {
  return max > 0 ? Math.min((value / max) * 100, 100) : 0;
}

export function ForecastBarChart({ items, horizon }: Props) {
  const getDemand = (item: ForecastItem): number => {
    if (horizon === 30) return item.forecast30;
    if (horizon === 60) return item.forecast60;
    return item.forecast90;
  };

  const maxVal = Math.max(...items.map((i) => Math.max(getDemand(i), i.currentStock)));

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Stock vs {horizon}-Day Demand</ThemedText>
      {items.map((item) => {
        const demand = getDemand(item);
        const shortage = demand > item.currentStock;
        return (
          <View key={item.drugCode} style={styles.row}>
            <ThemedText style={styles.drugLabel} numberOfLines={1}>{item.drug}</ThemedText>
            <View style={styles.barContainer}>
              <View style={styles.barGroup}>
                <View style={[styles.bar, styles.stockBar, { width: `${getBarWidth(item.currentStock, maxVal)}%` }]} />
                <View style={[styles.bar, styles.demandBar, shortage && styles.demandBarDanger, { width: `${getBarWidth(demand, maxVal)}%` }]} />
              </View>
              <View style={styles.values}>
                <ThemedText style={styles.valText}>{item.currentStock.toLocaleString()}</ThemedText>
                <ThemedText style={[styles.valText, shortage && { color: '#dc2626' }]}>{demand.toLocaleString()}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0891b2' }]} />
          <ThemedText style={styles.legendText}>Current Stock</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#94a3b8' }]} />
          <ThemedText style={styles.legendText}>Predicted Demand</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  row: { marginBottom: 14 },
  drugLabel: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  barContainer: { gap: 2 },
  barGroup: { gap: 3 },
  bar: { height: 10, borderRadius: 5, minWidth: 4 },
  stockBar: { backgroundColor: '#0891b2' },
  demandBar: { backgroundColor: '#94a3b8' },
  demandBarDanger: { backgroundColor: '#dc2626' },
  values: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  valText: { fontSize: 11, color: '#64748b' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#64748b' },
});
