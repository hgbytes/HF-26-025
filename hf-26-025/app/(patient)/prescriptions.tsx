import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrescriptionCard } from '@/components/patient/prescriptions/prescription-card';
import { RefillProgressBar } from '@/components/patient/prescriptions/refill-progress-bar';
import { NearbyFacilityRow } from '@/components/patient/prescriptions/nearby-facility-row';
import { usePrescriptions } from '@/hooks/use-prescriptions';
import type { PrescriptionDetail } from '@/hooks/use-prescriptions';
import type { StockBadge } from '@/hooks/use-drugs';

type PrescriptionView = 'list' | 'detail';

const FILTERS = ['all', 'active', 'past'] as const;

const BADGE_MAP: Record<StockBadge, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: '#16a34a' },
  low: { label: 'Low Stock', color: '#ca8a04' },
  critical: { label: 'Critical', color: '#dc2626' },
  unavailable: { label: 'Unavailable', color: '#64748b' },
};

export default function PrescriptionsScreen() {
  const { prescriptions, filter, setFilter, getDetail } = usePrescriptions();
  const [view, setView] = useState<PrescriptionView>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PrescriptionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (view === 'detail' && selectedId) {
      setDetailLoading(true);
      getDetail(selectedId)
        .then((d) => setDetail(d || null))
        .finally(() => setDetailLoading(false));
    }
  }, [view, selectedId, getDetail]);

  if (view === 'detail' && selectedId) {
    if (detailLoading || !detail) {
      return (
        <ThemedView style={styles.container}>
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        </ThemedView>
      );
    }
    const badge = BADGE_MAP[detail.stockBadge];

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setView('list')}>
            <ThemedText style={styles.backLink}>← Back to Prescriptions</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>{detail.drug} {detail.form}</ThemedText>
          <ThemedText style={styles.dosageDetail}>{detail.dosage} · {detail.duration}</ThemedText>

          <View style={styles.card}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Doctor</ThemedText>
              <ThemedText style={styles.value}>{detail.doctor}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Hospital</ThemedText>
              <ThemedText style={styles.value}>{detail.hospital}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Prescribed</ThemedText>
              <ThemedText style={styles.value}>{detail.prescribedDate}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Status</ThemedText>
              <ThemedText style={[styles.value, { color: detail.status === 'active' ? '#1d4ed8' : '#64748b' }]}>
                {detail.status === 'active' ? 'Active' : 'Completed'}
              </ThemedText>
            </View>
          </View>

          {detail.refillsTotal > 0 && (
            <View style={styles.card}>
              <RefillProgressBar used={detail.refillsUsed} total={detail.refillsTotal} />
              {detail.nextRefillDate && (
                <ThemedText style={styles.nextRefill}>Next refill: {detail.nextRefillDate}</ThemedText>
              )}
            </View>
          )}

          <View style={styles.card}>
            <ThemedText style={styles.sectionHeader}>Availability</ThemedText>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Stock Status</ThemedText>
              <ThemedText style={[styles.value, { color: badge.color }]}>{badge.label}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Stock Qty</ThemedText>
              <ThemedText style={styles.value}>{detail.stockQty.toLocaleString()}</ThemedText>
            </View>
          </View>

          {detail.nearbyFacilities.length > 0 && (
            <View style={styles.card}>
              <ThemedText style={styles.sectionHeader}>
                Nearby Facilities ({detail.nearbyFacilities.length})
              </ThemedText>
              {detail.nearbyFacilities.map((f) => (
                <NearbyFacilityRow key={f.name} name={f.name} distanceKm={f.distanceKm} />
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>Prescriptions</ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ThemedText style={styles.resultCount}>{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}</ThemedText>

        {prescriptions.map((rx) => (
          <PrescriptionCard
            key={rx.id}
            item={rx}
            onPress={() => {
              setSelectedId(rx.id);
              setView('detail');
            }}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { marginBottom: 12, color: '#0f172a', letterSpacing: -0.3 },
  backLink: { color: '#059669', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  dosageDetail: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  nextRefill: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 6 },
  chipRow: { flexDirection: 'row', marginBottom: 12 },
  chip: { backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#059669', borderColor: '#059669' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#fff' },
  resultCount: { fontSize: 12, color: '#94a3b8', marginBottom: 12, fontWeight: '500' },
});
