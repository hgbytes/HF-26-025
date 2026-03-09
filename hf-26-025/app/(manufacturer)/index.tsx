import { StyleSheet, ScrollView, View, TouchableOpacity, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { MFG, CardShadow } from '@/constants/theme';

const STATS = [
  { label: 'Total Batches', value: '1,247', icon: '📦', color: '#0a7ea4', bg: '#e0f2fe' },
  { label: 'In Transit', value: '38', icon: '🚚', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Open Alerts', value: '5', icon: '⚠️', color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Compliance', value: '98.2%', icon: '✅', color: '#10b981', bg: '#ecfdf5' },
];

const QUICK_ACTIONS = [
  { label: 'Register Batch', icon: '➕', route: '/(manufacturer)/add-batch' as const, desc: 'Add a new batch on-chain', gradient: ['#0a7ea4', '#06b6d4'] as const },
  { label: 'Distributors', icon: '🏢', route: '/(manufacturer)/distributors' as const, desc: 'View distributor network', gradient: ['#7c3aed', '#a78bfa'] as const },
  { label: 'ML Alerts', icon: '🔔', route: '/(manufacturer)/alerts' as const, desc: 'Review anomaly detections', gradient: ['#f59e0b', '#fbbf24'] as const },
];

const RECENT_BATCHES = [
  { id: 'BATCH_TN_PARA_20260308_A1F3', drug: 'Paracetamol', qty: '5,000', status: 'Delivered', time: '2h ago' },
  { id: 'BATCH_TN_AMOX_20260308_B7E2', drug: 'Amoxicillin', qty: '3,200', status: 'In Transit', time: '4h ago' },
  { id: 'BATCH_TN_METF_20260307_C4D9', drug: 'Metformin', qty: '8,500', status: 'Registered', time: '1d ago' },
];

const statusColor: Record<string, { text: string; bg: string; dot: string }> = {
  Delivered: { text: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
  'In Transit': { text: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  Registered: { text: '#0a7ea4', bg: '#e0f2fe', dot: '#0a7ea4' },
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Gradient Hero ── */}
        <LinearGradient colors={['#0a7ea4', '#06b6d4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <ThemedText style={styles.greeting}>Welcome back 👋</ThemedText>
              <ThemedText style={styles.heroTitle}>MedChain TN</ThemedText>
              <ThemedText style={styles.heroSub}>Manufacturer Dashboard</ThemedText>
            </View>
            <Image
              source={require('@/assets/images/medchain-logo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>

          {/* Inline stats row */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>1,247</ThemedText>
              <ThemedText style={styles.heroStatLabel}>Batches</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>12</ThemedText>
              <ThemedText style={styles.heroStatLabel}>Distributors</ThemedText>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <ThemedText style={styles.heroStatValue}>10</ThemedText>
              <ThemedText style={styles.heroStatLabel}>Regions</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statCard, CardShadow]}>
              <View style={[styles.statIconWrap, { backgroundColor: s.bg }]}>
                <ThemedText style={styles.statIcon}>{s.icon}</ThemedText>
              </View>
              <ThemedText style={[styles.statValue, { color: s.color }]}>{s.value}</ThemedText>
              <ThemedText style={styles.statLabel}>{s.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => router.push(a.route)}>
                <LinearGradient colors={[...a.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionGradient}>
                  <ThemedText style={styles.actionIcon}>{a.icon}</ThemedText>
                </LinearGradient>
                <ThemedText style={styles.actionLabel}>{a.label}</ThemedText>
                <ThemedText style={styles.actionDesc}>{a.desc}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Batches ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Batches</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(manufacturer)/add-batch')}>
              <ThemedText style={styles.viewAll}>See All →</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.batchesCard, CardShadow]}>
            {RECENT_BATCHES.map((b, i) => {
              const sc = statusColor[b.status] || statusColor.Registered;
              return (
                <View key={b.id} style={[styles.batchRow, i < RECENT_BATCHES.length - 1 && styles.batchDivider]}>
                  <View style={styles.batchLeft}>
                    <View style={styles.batchHeader}>
                      <ThemedText style={styles.batchDrug}>{b.drug}</ThemedText>
                      <ThemedText style={styles.batchTime}>{b.time}</ThemedText>
                    </View>
                    <ThemedText style={styles.batchId}>{b.id}</ThemedText>
                    <ThemedText style={styles.batchQty}>{b.qty} units</ThemedText>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                    <ThemedText style={[styles.statusText, { color: sc.text }]}>{b.status}</ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Network Card ── */}
        <LinearGradient colors={['#0f172a', '#1e293b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.networkCard}>
          <ThemedText style={styles.networkTitle}>Supply Chain Network</ThemedText>
          <ThemedText style={styles.networkDesc}>Real-time overview of your distribution network</ThemedText>
          <View style={styles.networkStats}>
            <View style={styles.networkStat}>
              <ThemedText style={styles.networkValue}>12</ThemedText>
              <ThemedText style={styles.networkLabel}>Distributors</ThemedText>
            </View>
            <View style={styles.networkDivider} />
            <View style={styles.networkStat}>
              <ThemedText style={styles.networkValue}>10</ThemedText>
              <ThemedText style={styles.networkLabel}>Regions</ThemedText>
            </View>
            <View style={styles.networkDivider} />
            <View style={styles.networkStat}>
              <ThemedText style={styles.networkValue}>12</ThemedText>
              <ThemedText style={styles.networkLabel}>Drug Types</ThemedText>
            </View>
          </View>
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MFG.bg },
  scroll: { flex: 1 },
  container: { paddingBottom: 48 },

  // ── Hero ──
  hero: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLeft: { flex: 1 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginTop: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 4 },
  heroLogo: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)' },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
  },
  heroStat: { alignItems: 'center' },
  heroStatValue: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 2 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },

  // ── Stats Grid ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
    marginTop: -0,
  },
  statCard: {
    width: '47%' as any,
    flexGrow: 1,
    backgroundColor: MFG.card,
    borderRadius: MFG.radius,
    padding: 16,
    alignItems: 'flex-start',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: MFG.textSecondary, fontWeight: '600', marginTop: 4 },

  // ── Section ──
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: MFG.text, marginBottom: 14 },
  viewAll: { fontSize: 13, fontWeight: '700', color: MFG.primary },

  // ── Quick Actions (horizontal cards) ──
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: MFG.card,
    borderRadius: MFG.radius,
    padding: 16,
    alignItems: 'center',
    ...CardShadow,
  },
  actionGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: { fontSize: 22, color: '#ffffff' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: MFG.text, textAlign: 'center' },
  actionDesc: { fontSize: 10, color: MFG.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 14 },

  // ── Batches ──
  batchesCard: {
    backgroundColor: MFG.card,
    borderRadius: MFG.radiusLg,
    overflow: 'hidden',
  },
  batchRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  batchDivider: { borderBottomWidth: 1, borderBottomColor: MFG.borderLight },
  batchLeft: { flex: 1 },
  batchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  batchDrug: { fontSize: 15, fontWeight: '700', color: MFG.text },
  batchTime: { fontSize: 11, color: MFG.textMuted, fontWeight: '500' },
  batchId: { fontSize: 10, fontFamily: 'monospace', color: MFG.textMuted, marginTop: 3 },
  batchQty: { fontSize: 12, color: MFG.textSecondary, fontWeight: '500', marginTop: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },

  // ── Network ──
  networkCard: {
    borderRadius: MFG.radiusLg,
    padding: 22,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  networkTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  networkDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 20, fontWeight: '500' },
  networkStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 16,
  },
  networkStat: { alignItems: 'center' },
  networkValue: { fontSize: 26, fontWeight: '800', color: '#ffffff' },
  networkLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginTop: 4 },
  networkDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
});
