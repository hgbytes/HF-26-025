import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StockSummaryBar } from '@/components/distributor/inventory/stock-summary-bar';
import { DrugStockCard } from '@/components/distributor/inventory/drug-stock-card';
import { BatchBreakdownCard } from '@/components/distributor/inventory/batch-breakdown-card';
import { IncomingShipmentCard } from '@/components/distributor/inventory/incoming-shipment-card';
import { RejectReasonSheet } from '@/components/distributor/inventory/reject-reason-sheet';
import { useInventory } from '@/hooks/use-inventory';

type InventoryView = 'dashboard' | 'drugDetail' | 'incoming';

const FILTERS = ['all', 'ok', 'low', 'critical'] as const;

export default function InventoryScreen() {
  const { stock, incoming, filter, setFilter, summary, getDrug, acceptShipment, rejectShipment } = useInventory();
  const [view, setView] = useState<InventoryView>('dashboard');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  if (view === 'drugDetail' && selectedDrug) {
    const drug = getDrug(selectedDrug);
    if (!drug) return null;

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setView('dashboard')}>
            <ThemedText style={styles.backLink}>← Back to Inventory</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>{drug.drug}</ThemedText>

          <View style={styles.row}>
            <ThemedText style={styles.label}>Drug Code</ThemedText>
            <ThemedText style={styles.value}>{drug.drugCode}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Total Quantity</ThemedText>
            <ThemedText style={styles.value}>{drug.totalQuantity.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Status</ThemedText>
            <ThemedText style={[styles.value, { color: drug.status === 'ok' ? '#16a34a' : drug.status === 'low' ? '#ca8a04' : '#dc2626' }]}>
              {drug.status.toUpperCase()}
            </ThemedText>
          </View>

          <View style={{ height: 16 }} />
          <BatchBreakdownCard batches={drug.batches} />
        </ScrollView>
      </ThemedView>
    );
  }

  if (view === 'incoming') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setView('dashboard')}>
            <ThemedText style={styles.backLink}>← Back to Inventory</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Incoming Shipments</ThemedText>
          <ThemedText style={styles.subtitle}>{incoming.length} pending shipments</ThemedText>

          <View style={styles.list}>
            {incoming.map((s) => (
              <IncomingShipmentCard
                key={s.transferId}
                shipment={s}
                onAccept={() => acceptShipment(s.transferId)}
                onReject={() => setRejectTarget(s.transferId)}
              />
            ))}
          </View>

          <RejectReasonSheet
            visible={!!rejectTarget}
            onSubmit={(reason) => {
              if (rejectTarget) rejectShipment(rejectTarget, reason);
              setRejectTarget(null);
            }}
            onCancel={() => setRejectTarget(null)}
          />
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>Inventory</ThemedText>
        <StockSummaryBar {...summary} />

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}>
              <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {incoming.length > 0 && (
          <TouchableOpacity style={styles.incomingBanner} onPress={() => setView('incoming')} activeOpacity={0.7}>
            <ThemedText style={styles.incomingText}>
              {incoming.length} incoming shipment{incoming.length > 1 ? 's' : ''} pending
            </ThemedText>
            <ThemedText style={styles.incomingArrow}>→</ThemedText>
          </TouchableOpacity>
        )}

        <View style={styles.list}>
          {stock.map((item) => (
            <DrugStockCard
              key={item.drugCode}
              drug={item.drug}
              drugCode={item.drugCode}
              totalQuantity={item.totalQuantity}
              status={item.status}
              batchCount={item.batches.length}
              onPress={() => { setSelectedDrug(item.drugCode); setView('drugDetail'); }}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { marginBottom: 16, color: '#0f172a', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  backLink: { color: '#7c3aed', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  incomingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  incomingText: { fontSize: 13, fontWeight: '600', color: '#6d28d9' },
  incomingArrow: { fontSize: 16, color: '#6d28d9', fontWeight: '700' },
  list: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
