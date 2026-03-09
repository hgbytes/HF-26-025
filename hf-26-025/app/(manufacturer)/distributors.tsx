import { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { DistributorCard } from '@/components/manufacturer/distributors/DistributorCard';
import { StockTable } from '@/components/manufacturer/distributors/StockTable';
import { DemandSupplyChart } from '@/components/manufacturer/distributors/DemandSupplyChart';
import { TransferRow } from '@/components/manufacturer/distributors/TransferRow';
import { useDistributors } from '@/hooks/use-distributors';
import { MFG, CardShadow } from '@/constants/theme';

type Filter = 'all' | 'low' | 'critical' | 'inactive';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low Stock' },
  { key: 'critical', label: 'Critical' },
  { key: 'inactive', label: 'Inactive' },
];

export default function DistributorsScreen() {
  const { distributors, filter, setFilter, getDetail } = useDistributors();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const detail = getDetail(selectedId);
    if (!detail) {
      setSelectedId(null);
      return null;
    }
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.backBtn}>
            <ThemedText style={styles.backText}>Back to Distributors</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.detailName}>{detail.name}</ThemedText>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <ThemedText style={styles.metaPillText}>{detail.region}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.wallet} numberOfLines={1}>{detail.wallet}</ThemedText>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionLabel}>CURRENT STOCK</ThemedText>
            <StockTable items={detail.stock} />
          </View>

          <View style={styles.sectionCard}>
            <DemandSupplyChart data={detail.demandVsSupply} />
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionLabel}>RECENT TRANSFERS</ThemedText>
            {detail.recentTransfers.map((t, i) => (
              <TransferRow key={i} transfer={t} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterActive]}
              onPress={() => setFilter(f.key)}>
              <ThemedText style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cardList}>
          {distributors.map((d) => (
            <DistributorCard key={d.id} distributor={d} onPress={() => setSelectedId(d.id)} />
          ))}
          {distributors.length === 0 && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No distributors match this filter.</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MFG.bg },
  listContainer: { padding: 20, paddingBottom: 48 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: MFG.border, backgroundColor: MFG.card,
  },
  filterActive: { backgroundColor: MFG.primary, borderColor: MFG.primary },
  filterText: { fontSize: 13, color: MFG.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  cardList: { gap: 12 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: MFG.textMuted, fontSize: 15 },
  // Detail
  detailContainer: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 16 },
  backText: { color: MFG.primary, fontSize: 15, fontWeight: '600' },
  detailName: { fontSize: 24, fontWeight: '800', color: MFG.text, letterSpacing: -0.3, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  metaPill: { backgroundColor: MFG.primaryFaint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  metaPillText: { fontSize: 13, color: MFG.primary, fontWeight: '600' },
  wallet: { fontSize: 12, fontFamily: 'monospace', color: MFG.textMuted, marginBottom: 20 },
  sectionCard: {
    backgroundColor: MFG.card, borderRadius: MFG.radiusLg, padding: 16,
    marginBottom: 16, ...CardShadow,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: MFG.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
});
