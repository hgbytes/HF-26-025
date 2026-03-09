import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ForecastBarChart } from '@/components/distributor/forecast/forecast-bar-chart';
import { ReorderAlertCard } from '@/components/distributor/forecast/reorder-alert-card';
import { ForecastTrendChart } from '@/components/distributor/forecast/forecast-trend-chart';
import { SeasonalityNote } from '@/components/distributor/forecast/seasonality-note';
import { useForecast } from '@/hooks/use-forecast';

type ForecastView = 'dashboard' | 'drugDetail';

const HORIZONS = [30, 60, 90] as const;

export default function ForecastScreen() {
  const { forecasts, reorderAlerts, modelInfo, horizon, setHorizon, getDrugForecast } = useForecast();
  const [view, setView] = useState<ForecastView>('dashboard');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);

  if (view === 'drugDetail' && selectedDrug) {
    const item = getDrugForecast(selectedDrug);
    if (!item) return null;

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => setView('dashboard')}>
            <ThemedText style={styles.backLink}>← Back to Forecast</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>{item.drug}</ThemedText>

          <ForecastTrendChart item={item} />

          <View style={{ height: 16 }} />

          <View style={styles.card}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Current Stock</ThemedText>
              <ThemedText style={styles.value}>{item.currentStock.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Reorder Point</ThemedText>
              <ThemedText style={styles.value}>{item.reorderPoint.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText style={styles.label}>Needs Reorder</ThemedText>
              <ThemedText style={[styles.value, { color: item.needsReorder ? '#dc2626' : '#16a34a' }]}>
                {item.needsReorder ? 'Yes' : 'No'}
              </ThemedText>
            </View>
          </View>

          {item.seasonalNote && (
            <>
              <View style={{ height: 12 }} />
              <SeasonalityNote note={item.seasonalNote} />
            </>
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>Forecast</ThemedText>

        <View style={styles.horizonRow}>
          {HORIZONS.map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.horizonChip, horizon === h && styles.horizonActive]}
              onPress={() => setHorizon(h)}>
              <ThemedText style={[styles.horizonText, horizon === h && styles.horizonTextActive]}>
                {h} Days
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ForecastBarChart items={forecasts} horizon={horizon} />

        {reorderAlerts.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Reorder Alerts</ThemedText>
            <View style={styles.list}>
              {reorderAlerts.map((alert) => (
                <ReorderAlertCard
                  key={alert.drugCode}
                  alert={alert}
                  onPress={() => { setSelectedDrug(alert.drugCode); setView('drugDetail'); }}
                />
              ))}
            </View>
          </>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>All Drugs</ThemedText>
        <View style={styles.list}>
          {forecasts.map((f) => (
            <TouchableOpacity
              key={f.drugCode}
              style={styles.drugRow}
              onPress={() => { setSelectedDrug(f.drugCode); setView('drugDetail'); }}
              activeOpacity={0.7}
            >
              <View>
                <ThemedText style={styles.drugName}>{f.drug}</ThemedText>
                <ThemedText style={styles.stockText}>Stock: {f.currentStock.toLocaleString()}</ThemedText>
              </View>
              <View style={styles.drugRight}>
                <ThemedText style={[styles.trendLabel, { color: f.trend === 'rising' ? '#dc2626' : f.trend === 'declining' ? '#0a7ea4' : '#16a34a' }]}>
                  {f.trend === 'rising' ? '↑' : f.trend === 'declining' ? '↓' : '→'} {f.trend}
                </ThemedText>
                {f.needsReorder && <ThemedText style={styles.reorderFlag}>Reorder</ThemedText>}
              </View>
            </TouchableOpacity>
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
  backLink: { color: '#7c3aed', fontSize: 14, fontWeight: '600', marginBottom: 16 },
  sectionTitle: { marginTop: 24, marginBottom: 12, color: '#0f172a', letterSpacing: -0.2 },
  horizonRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  horizonChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  horizonActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  horizonText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  horizonTextActive: { color: '#fff' },
  list: { gap: 12 },
  drugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  drugName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  stockText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  drugRight: { alignItems: 'flex-end' },
  trendLabel: { fontSize: 12, fontWeight: '600' },
  reorderFlag: { fontSize: 10, fontWeight: '700', color: '#fff', backgroundColor: '#dc2626', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4, overflow: 'hidden' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 13, color: '#64748b' },
  value: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
