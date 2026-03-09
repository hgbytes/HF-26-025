import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/services/api';
import { HC } from '@/constants/theme';

interface DbAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  batchId: string;
  drug: string;
  region: string;
  createdAt: string;
  read: boolean;
}

const SEV_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  high: { bg: '#fef2f2', color: '#dc2626', border: '#dc2626' },
  medium: { bg: '#fffbeb', color: '#d97706', border: '#d97706' },
  low: { bg: '#f0fdf4', color: '#16a34a', border: '#16a34a' },
};

export default function DistributorAlertsScreen() {
  const { wallet } = useAuth();
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(() => {
    if (!wallet) return;
    setLoading(true);
    api.get<{ alerts: DbAlert[] }>(`/batches/alerts/${encodeURIComponent(wallet)}`)
      .then((r) => setAlerts(r.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [wallet]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);
  useFocusEffect(useCallback(() => { loadAlerts(); }, [loadAlerts]));

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.heading}>Alerts</ThemedText>
        <ThemedText style={styles.subtitle}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</ThemedText>

        {alerts.length === 0 && !loading && (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>No alerts. All clear!</ThemedText>
          </View>
        )}

        {alerts.map((a) => {
          const sev = SEV_COLORS[a.severity] || SEV_COLORS.high;
          return (
            <View key={a.id} style={[styles.card, { borderLeftColor: sev.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.pill, { backgroundColor: sev.bg }]}>
                  <View style={[styles.dot, { backgroundColor: sev.color }]} />
                  <ThemedText style={[styles.pillText, { color: sev.color }]}>
                    {(a.severity || 'high').toUpperCase()}
                  </ThemedText>
                </View>
                {a.createdAt && (
                  <ThemedText style={styles.time}>
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </ThemedText>
                )}
              </View>
              <ThemedText style={styles.title}>{a.title}</ThemedText>
              <ThemedText style={styles.desc}>{a.description}</ThemedText>
              {a.drug && <ThemedText style={styles.meta}>{a.drug}  ·  {a.region}</ThemedText>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: HC.bg },
  container: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '800', color: HC.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: HC.textMuted, marginTop: 4, marginBottom: 20 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: HC.textMuted, fontSize: 15 },
  card: {
    backgroundColor: HC.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: HC.borderLight,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  time: { fontSize: 11, color: HC.textMuted },
  title: { fontSize: 14, fontWeight: '700', color: HC.text, marginBottom: 4 },
  desc: { fontSize: 12, color: HC.textSecondary, lineHeight: 18, marginBottom: 6 },
  meta: { fontSize: 11, color: HC.textMuted },
});
