import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DrugSearchBar } from '@/components/patient/home/drug-search-bar';
import { RegionFilterRow } from '@/components/patient/home/region-filter-row';
import { DrugAvailabilityCard } from '@/components/patient/home/drug-availability-card';
import { FacilityCard } from '@/components/patient/home/facility-card';
import { useDrugs } from '@/hooks/use-drugs';
import type { StockBadge, DrugDetail } from '@/hooks/use-drugs';

type HomeView = 'drugList' | 'drugDetail';

const BADGE_MAP: Record<StockBadge, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: '#16a34a' },
  low: { label: 'Low Stock', color: '#ca8a04' },
  critical: { label: 'Critical', color: '#dc2626' },
  unavailable: { label: 'Unavailable', color: '#64748b' },
};

export default function PatientHomeScreen() {
  const { drugs, search, setSearch, region, setRegion, regions, getDrugDetail, loading } = useDrugs();
  const [view, setView] = useState<HomeView>('drugList');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [detail, setDetail] = useState<DrugDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (view === 'drugDetail' && selectedDrug) {
      setDetailLoading(true);
      getDrugDetail(selectedDrug)
        .then((d) => setDetail(d || null))
        .finally(() => setDetailLoading(false));
    }
  }, [view, selectedDrug, getDrugDetail]);

  if (view === 'drugDetail' && selectedDrug) {
    if (detailLoading || !detail) {
      return (
        <ThemedView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </ThemedView>
      );
    }
    const badge = BADGE_MAP[detail.badge];

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setView('drugList')}>
            <ThemedText style={styles.backLink}>← Back to Drug List</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>{detail.name}</ThemedText>
          <ThemedText style={[styles.badge, { color: badge.color }]}>{badge.label}</ThemedText>

          <View style={styles.card}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Form</ThemedText>
              <ThemedText style={styles.value}>{detail.form}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <ThemedText style={styles.value}>{detail.category}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Manufacturer</ThemedText>
              <ThemedText style={styles.value}>{detail.manufacturer}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Price</ThemedText>
              <ThemedText style={styles.value}>₹{detail.price}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Total Stock</ThemedText>
              <ThemedText style={styles.value}>{detail.totalStock.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Shelf Life</ThemedText>
              <ThemedText style={styles.value}>{detail.shelfLifeMonths} months</ThemedText>
            </View>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Nearby Facilities ({detail.facilities.length})
          </ThemedText>
          {detail.facilities.map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>Drug Availability</ThemedText>
        <DrugSearchBar value={search} onChangeText={setSearch} />
        <RegionFilterRow regions={regions} selected={region} onSelect={setRegion} />

        <ThemedText style={styles.resultCount}>{drugs.length} medicines found</ThemedText>

        {drugs.map((drug) => (
          <DrugAvailabilityCard
            key={drug.code}
            drug={drug}
            onPress={() => {
              setSelectedDrug(drug.code);
              setView('drugDetail');
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
  title: { marginBottom: 16, color: '#0f172a', letterSpacing: -0.3 },
  backLink: { color: '#059669', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  badge: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  sectionTitle: { marginBottom: 10, color: '#0f172a', letterSpacing: -0.2 },
  resultCount: { fontSize: 12, color: '#94a3b8', marginBottom: 12, fontWeight: '500' },
});
