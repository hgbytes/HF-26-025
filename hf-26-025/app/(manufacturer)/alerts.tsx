import { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AlertCard } from '@/components/manufacturer/alerts/AlertCard';
import { ConfidenceBar } from '@/components/manufacturer/alerts/ConfidenceBar';
import { FlaggedFeatureList } from '@/components/manufacturer/alerts/FlaggedFeatureList';
import { ResolveForm } from '@/components/manufacturer/alerts/ResolveForm';
import { useAlerts, AlertItem, ResolutionAction } from '@/hooks/use-alerts';
import { MFG, CardShadow } from '@/constants/theme';

type ViewState =
  | { screen: 'feed' }
  | { screen: 'detail'; alertId: string }
  | { screen: 'resolve'; alertId: string };

const TABS: { key: 'all' | 'open' | 'resolved'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
];

export default function AlertsScreen() {
  const { alerts, filter, setFilter, getAlert, resolveAlert } = useAlerts();
  const [view, setView] = useState<ViewState>({ screen: 'feed' });
  const [resolving, setResolving] = useState(false);

  // ── Resolve Screen ──
  if (view.screen === 'resolve') {
    const alert = getAlert(view.alertId);
    if (!alert) { setView({ screen: 'feed' }); return null; }

    const handleResolve = async (action: ResolutionAction, notes: string) => {
      setResolving(true);
      try {
        await resolveAlert(alert.id, action, notes);
        Alert.alert('Resolved', 'Alert has been resolved successfully.');
        setView({ screen: 'feed' });
      } catch {
        Alert.alert('Error', 'Failed to resolve alert.');
      } finally {
        setResolving(false);
      }
    };

    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setView({ screen: 'detail', alertId: alert.id })} style={styles.backBtn}>
            <ThemedText style={styles.backText}>Back to Detail</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.heading}>Resolve Alert</ThemedText>
          <ResolveForm alert={alert} onResolve={handleResolve} loading={resolving} />
        </ScrollView>
      </View>
    );
  }

  // ── Detail Screen ──
  if (view.screen === 'detail') {
    const alert = getAlert(view.alertId);
    if (!alert) { setView({ screen: 'feed' }); return null; }

    const sevColor: Record<string, string> = { high: MFG.danger, medium: MFG.warning, low: MFG.success };
    const sevBg: Record<string, string> = { high: MFG.dangerBg, medium: MFG.warningBg, low: MFG.successBg };

    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setView({ screen: 'feed' })} style={styles.backBtn}>
            <ThemedText style={styles.backText}>Back to Alerts</ThemedText>
          </TouchableOpacity>

          <View style={[styles.severityBanner, { backgroundColor: sevBg[alert.severity] }]}>
            <View style={[styles.sevDot, { backgroundColor: sevColor[alert.severity] }]} />
            <ThemedText style={[styles.sevLabel, { color: sevColor[alert.severity] }]}>
              {alert.severity.toUpperCase()} SEVERITY
            </ThemedText>
          </View>

          <ThemedText style={styles.alertType}>{alert.type}</ThemedText>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionLabel}>BATCH INFO</ThemedText>
            <InfoRow label="Batch ID" value={alert.batchId} />
            <InfoRow label="Drug" value={alert.drug} />
            <InfoRow label="Region" value={alert.region} />
            <InfoRow label="Distributor" value={alert.distributor} />
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionLabel}>DETECTION</ThemedText>
            <ConfidenceBar score={alert.confidence} />
            <View style={{ height: 14 }} />
            <FlaggedFeatureList features={alert.flaggedFeatures} />
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionLabel}>TIMELINE</ThemedText>
            {alert.timeline.map((t, i) => (
              <View key={i} style={styles.timelineRow}>
                <ThemedText style={styles.timelineTime}>{t.time}</ThemedText>
                <View style={[styles.timelineDot, t.flagged && { backgroundColor: MFG.danger }]} />
                <ThemedText style={[styles.timelineEvent, t.flagged && styles.timelineFlagged]}>
                  {t.event}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionLabel}>AI RECOMMENDATION</ThemedText>
            <View style={styles.recoBox}>
              <ThemedText style={styles.recoAction}>
                Action: {alert.confidence > 0.85 ? 'Escalate' : 'Monitor'}
              </ThemedText>
              <ThemedText style={styles.recoText}>"{alert.recommendation}"</ThemedText>
            </View>
          </View>

          {alert.status !== 'resolved' && (
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setView({ screen: 'resolve', alertId: alert.id })}>
                <ThemedText style={styles.outlineBtnText}>Investigate</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() => setView({ screen: 'resolve', alertId: alert.id })}>
                <ThemedText style={styles.dangerBtnText}>Escalate</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Feed Screen ──
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.feedContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, filter === t.key && styles.tabActive]}
              onPress={() => setFilter(t.key)}>
              <ThemedText style={[styles.tabText, filter === t.key && styles.tabTextActive]}>
                {t.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cardList}>
          {alerts.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              onPress={() => setView({ screen: 'detail', alertId: a.id })}
            />
          ))}
          {alerts.length === 0 && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No alerts match this filter.</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue} numberOfLines={1}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: MFG.bg },
  feedContainer: { padding: 20, paddingBottom: 48 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: MFG.border, backgroundColor: MFG.card,
  },
  tabActive: { backgroundColor: MFG.primary, borderColor: MFG.primary },
  tabText: { fontSize: 14, color: MFG.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  cardList: { gap: 12 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: MFG.textMuted, fontSize: 15 },
  // Detail
  detailContainer: { padding: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 16 },
  backText: { color: MFG.primary, fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 22, fontWeight: '800', color: MFG.text, letterSpacing: -0.3, marginBottom: 20 },
  severityBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: MFG.radiusSm, marginBottom: 10,
  },
  sevDot: { width: 10, height: 10, borderRadius: 5 },
  sevLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  alertType: { fontSize: 22, fontWeight: '800', color: MFG.text, marginBottom: 16, letterSpacing: -0.3 },
  sectionCard: {
    backgroundColor: MFG.card, borderRadius: MFG.radiusLg, padding: 16,
    marginBottom: 16, ...CardShadow,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: MFG.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: MFG.borderLight },
  infoLabel: { fontSize: 14, color: MFG.textMuted },
  infoValue: { fontSize: 14, fontWeight: '600', color: MFG.text, maxWidth: '60%', textAlign: 'right' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  timelineTime: { fontSize: 12, fontWeight: '600', color: MFG.textMuted, width: 48 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MFG.border },
  timelineEvent: { flex: 1, fontSize: 13, color: MFG.text },
  timelineFlagged: { color: MFG.danger, fontWeight: '700' },
  recoBox: {
    backgroundColor: MFG.warningBg, padding: 14, borderRadius: MFG.radiusSm,
    borderWidth: 1, borderColor: MFG.warning, gap: 6,
  },
  recoAction: { fontSize: 14, fontWeight: '700', color: '#92400e' },
  recoText: { fontSize: 14, color: '#78350f', fontStyle: 'italic' },
  actionBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  outlineBtn: {
    flex: 1, height: 48, borderWidth: 1.5, borderColor: MFG.primary, borderRadius: MFG.radius,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnText: { color: MFG.primary, fontSize: 14, fontWeight: '700' },
  dangerBtn: {
    flex: 1, height: 48, backgroundColor: MFG.danger, borderRadius: MFG.radius,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: MFG.danger, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  dangerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
