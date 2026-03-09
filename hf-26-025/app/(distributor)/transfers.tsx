import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransferHistoryCard } from '@/components/distributor/transfers/transfer-history-card';
import { InitiateForm } from '@/components/distributor/transfers/initiate-form';
import { TransferSummary } from '@/components/distributor/transfers/transfer-summary';
import { TxConfirmation } from '@/components/distributor/transfers/tx-confirmation';
import { useTransfers, type InitiateTransferData, type TransferResult } from '@/hooks/use-transfers';

type TransferView = 'list' | 'initiate' | 'confirmation';

const DIR_FILTERS = ['all', 'incoming', 'outgoing'] as const;
const STATUS_FILTERS = ['all', 'pending', 'accepted', 'rejected'] as const;

export default function TransfersScreen() {
  const { transfers, pending, directionFilter, setDirectionFilter, statusFilter, setStatusFilter, getTransfer, initiateTransfer, acceptTransfer, rejectTransfer } = useTransfers();
  const [view, setView] = useState<TransferView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<TransferResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (view === 'confirmation' && txResult) {
    return (
      <ThemedView style={styles.container}>
        <TxConfirmation result={txResult} onDone={() => { setView('list'); setTxResult(null); }} />
      </ThemedView>
    );
  }

  if (view === 'initiate') {
    return (
      <ThemedView style={styles.container}>
        <InitiateForm
          loading={loading}
          onCancel={() => setView('list')}
          onSubmit={async (data: InitiateTransferData) => {
            setLoading(true);
            try {
              const result = await initiateTransfer(data);
              setTxResult(result);
              setView('confirmation');
            } finally {
              setLoading(false);
            }
          }}
        />
      </ThemedView>
    );
  }

  // Detail view for selected transfer
  if (selectedId) {
    const t = getTransfer(selectedId);
    if (!t) return null;

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setSelectedId(null)}>
            <ThemedText style={styles.backLink}>← Back to Transfers</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>{t.drug}</ThemedText>

          <TransferSummary data={{ batchId: t.batchId, drug: t.drug, quantity: t.quantity, toWallet: '', toName: t.direction === 'incoming' ? t.from : t.to }} />

          <View style={{ height: 12 }} />

          <View style={styles.detailCard}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Direction</ThemedText>
              <ThemedText style={[styles.value, { color: t.direction === 'incoming' ? '#16a34a' : '#0a7ea4' }]}>
                {t.direction === 'incoming' ? '↓ Incoming' : '↑ Outgoing'}
              </ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Status</ThemedText>
              <ThemedText style={styles.value}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Initiated</ThemedText>
              <ThemedText style={styles.value}>{t.initiatedDate}</ThemedText>
            </View>
            {t.completedDate && (
              <View style={styles.row}>
                <ThemedText style={styles.label}>Completed</ThemedText>
                <ThemedText style={styles.value}>{t.completedDate}</ThemedText>
              </View>
            )}
            {t.txHash && (
              <View style={styles.row}>
                <ThemedText style={styles.label}>Tx Hash</ThemedText>
                <ThemedText style={[styles.value, { fontFamily: 'monospace', fontSize: 12 }]}>{t.txHash}</ThemedText>
              </View>
            )}
          </View>

          {t.status === 'pending' && t.direction === 'incoming' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => { acceptTransfer(t.id); setSelectedId(null); }} activeOpacity={0.7}>
                <ThemedText style={styles.acceptText}>Accept</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => { rejectTransfer(t.id); setSelectedId(null); }} activeOpacity={0.7}>
                <ThemedText style={styles.rejectText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>Transfers</ThemedText>
          <TouchableOpacity style={styles.initiateBtn} onPress={() => setView('initiate')} activeOpacity={0.7}>
            <ThemedText style={styles.initiateBtnText}>+ New</ThemedText>
          </TouchableOpacity>
        </View>

        {pending.length > 0 && (
          <View style={styles.pendingBanner}>
            <ThemedText style={styles.pendingText}>
              {pending.length} pending transfer{pending.length > 1 ? 's' : ''}
            </ThemedText>
          </View>
        )}

        <View style={styles.filterRow}>
          {DIR_FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, directionFilter === f && styles.filterActive]} onPress={() => setDirectionFilter(f)}>
              <ThemedText style={[styles.filterText, directionFilter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, statusFilter === f && styles.filterActive]} onPress={() => setStatusFilter(f)}>
              <ThemedText style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.list}>
          {transfers.map((t) => (
            <TransferHistoryCard key={t.id} transfer={t} onPress={() => setSelectedId(t.id)} />
          ))}
          {transfers.length === 0 && (
            <ThemedText style={styles.empty}>No transfers match the current filters</ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { marginBottom: 16, color: '#0f172a', letterSpacing: -0.3 },
  backLink: { color: '#7c3aed', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  initiateBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  initiateBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  pendingBanner: { backgroundColor: '#fffbeb', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#fef3c7' },
  pendingText: { fontSize: 13, fontWeight: '600', color: '#92400e' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  list: { gap: 12, marginTop: 8 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
  detailCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a', flexShrink: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  acceptBtn: { flex: 1, backgroundColor: '#059669', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  rejectText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
});
