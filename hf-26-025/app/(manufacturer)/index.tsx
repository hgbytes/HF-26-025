import { StyleSheet, ScrollView, View, TouchableOpacity, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { HC, RoleColors, CardShadow } from '@/constants/theme';

const R = RoleColors.manufacturer;

const STATS = [
  { label: 'Total Batches', value: '1,247', initial: 'B', color: HC.primary, bg: HC.primaryLight },
  { label: 'In Transit', value: '38', initial: 'T', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Open Alerts', value: '5', initial: 'A', color: HC.warning, bg: HC.warningBg },
  { label: 'Compliance', value: '98.2%', initial: 'C', color: HC.success, bg: HC.successBg },
];

const QUICK_ACTIONS = [
  { label: 'Register\nBatch', initial: '+', route: '/(manufacturer)/add-batch' as const, gradient: [...R.gradient] as const },
  { label: 'Distributor\nNetwork', initial: 'D', route: '/(manufacturer)/distributors' as const, gradient: ['#7c3aed', '#a78bfa'] as const },
  { label: 'ML\nAlerts', initial: 'A', route: '/(manufacturer)/alerts' as const, gradient: ['#d97706', '#fbbf24'] as const },
];

const RECENT_BATCHES = [
  { id: 'BATCH_TN_PARA_20260308_A1F3', drug: 'Paracetamol', qty: '5,000', status: 'Delivered', time: '2h ago' },
  { id: 'BATCH_TN_AMOX_20260308_B7E2', drug: 'Amoxicillin', qty: '3,200', status: 'In Transit', time: '4h ago' },
  { id: 'BATCH_TN_METF_20260307_C4D9', drug: 'Metformin', qty: '8,500', status: 'Registered', time: '1d ago' },
];

const statusColor: Record<string, { text: string; bg: string; dot: string }> = {
  Delivered: { text: HC.success, bg: HC.successBg, dot: HC.success },
  'In Transit': { text: HC.warning, bg: HC.warningBg, dot: HC.warning },
  Registered: { text: HC.primary, bg: '#ecfeff', dot: HC.primary },
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <LinearGradient colors={['#0e7490', '#0891b2', '#06b6d4']} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <ThemedText style={styles.greeting}>Welcome back</ThemedText>
              <ThemedText style={styles.heroTitle}>MedChain TN</ThemedText>
              <ThemedText style={styles.heroSub}>Manufacturer Dashboard</ThemedText>
            </View>
            <View style={styles.logoRing}>
              <Image
                source={require('@/assets/images/medchain-logo.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.heroStatsRow}>
            {[{ v: '1,247', l: 'Batches' }, { v: '12', l: 'Distributors' }, { v: '10', l: 'Regions' }].map((s, i) => (
              <View key={s.l} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {i > 0 && <View style={styles.heroStatDivider} />}
                <View style={styles.heroStat}>
                  <ThemedText style={styles.heroStatValue}>{s.v}</ThemedText>
                  <ThemedText style={styles.heroStatLabel}>{s.l}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: s.bg }]}>
                <ThemedText style={[styles.statIcon, { color: s.color }]}>{s.initial}</ThemedText>
              </View>
              <ThemedText style={styles.statValue}>{s.value}</ThemedText>
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
                activeOpacity={0.7}
                onPress={() => router.push(a.route)}>
                <LinearGradient colors={[...a.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionGradient}>
                  <ThemedText style={styles.actionIcon}>{a.initial}</ThemedText>
                </LinearGradient>
                <ThemedText style={styles.actionLabel}>{a.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Batches ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Batches</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(manufacturer)/add-batch')}>
              <ThemedText style={styles.viewAll}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.batchesCard}>
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

        {/* ── Network ── */}
        <LinearGradient colors={['#0f172a', '#1e293b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.networkCard}>
          <ThemedText style={styles.networkTitle}>Supply Chain Network</ThemedText>
          <ThemedText style={styles.networkDesc}>Real-time overview of your distribution network</ThemedText>
          <View style={styles.networkStats}>
            {[{ v: '12', l: 'Distributors' }, { v: '10', l: 'Regions' }, { v: '12', l: 'Drug Types' }].map((s, i) => (
              <View key={s.l} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {i > 0 && <View style={styles.networkDivider} />}
                <View style={styles.networkStat}>
                  <ThemedText style={styles.networkValue}>{s.v}</ThemedText>
                  <ThemedText style={styles.networkLabel}>{s.l}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: HC.bg },
  scroll: { flex: 1 },
  container: { paddingBottom: 48 },

  hero: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: HC.radiusLg,
    borderBottomRightRadius: HC.radiusLg,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLeft: { flex: 1 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginTop: 4 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 4 },
  logoRing: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroLogo: { width: 36, height: 36, borderRadius: 10 },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: HC.radiusMd,
    paddingVertical: 14,
    marginTop: 20,
  },
  heroStat: { alignItems: 'center' },
  heroStatValue: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  heroStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
  },
  statCard: {
    width: '47%' as any,
    flexGrow: 1,
    backgroundColor: HC.card,
    borderRadius: HC.radius,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: HC.borderLight,
    ...CardShadow,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statIcon: { fontSize: 14, fontWeight: '800' },
  statValue: { fontSize: 24, fontWeight: '800', color: HC.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: HC.textMuted, fontWeight: '600', marginTop: 4, letterSpacing: 0.1 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: HC.text, marginBottom: 14, letterSpacing: -0.2 },
  viewAll: { fontSize: 12, fontWeight: '700', color: HC.primary, letterSpacing: 0.1 },

  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: HC.card,
    borderRadius: HC.radius,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HC.borderLight,
    ...CardShadow,
  },
  actionGradient: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  actionLabel: { fontSize: 12, fontWeight: '700', color: HC.text, textAlign: 'center', lineHeight: 16 },

  batchesCard: {
    backgroundColor: HC.card,
    borderRadius: HC.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: HC.borderLight,
    ...CardShadow,
  },
  batchRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  batchDivider: { borderBottomWidth: 1, borderBottomColor: HC.borderLight },
  batchLeft: { flex: 1 },
  batchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  batchDrug: { fontSize: 14, fontWeight: '700', color: HC.text },
  batchTime: { fontSize: 10, color: HC.textMuted, fontWeight: '500' },
  batchId: { fontSize: 10, fontFamily: 'monospace', color: HC.textMuted, marginTop: 3 },
  batchQty: { fontSize: 12, color: HC.textSecondary, fontWeight: '500', marginTop: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: HC.radiusFull,
    marginLeft: 10,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },

  networkCard: {
    borderRadius: HC.radiusLg,
    padding: 22,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  networkTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', letterSpacing: -0.2 },
  networkDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4, marginBottom: 20, fontWeight: '500' },
  networkStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: HC.radiusMd,
    paddingVertical: 16,
  },
  networkStat: { alignItems: 'center' },
  networkValue: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  networkLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  networkDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 8 },
});
