import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, StatusBar, ActivityIndicator, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { HC, RoleColors, CardShadow } from '@/constants/theme';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import QRCode from 'react-native-qrcode-svg';

const R = RoleColors.manufacturer;

const QUICK_ACTIONS = [
  { label: 'Register\nBatch', initial: '+', route: '/(manufacturer)/add-batch' as const, gradient: [...R.gradient] as const },
  { label: 'Distributor\nNetwork', initial: 'D', route: '/(manufacturer)/distributors' as const, gradient: ['#7c3aed', '#a78bfa'] as const },
  { label: 'ML\nAlerts', initial: 'A', route: '/(manufacturer)/alerts' as const, gradient: ['#d97706', '#fbbf24'] as const },
];

const STATUS_MAP: Record<number, string> = { 0: 'Registered', 1: 'Active', 2: 'In Transit', 3: 'Delivered', 4: 'Flagged' };

const statusColor: Record<string, { text: string; bg: string; dot: string }> = {
  Delivered: { text: HC.success, bg: HC.successBg, dot: HC.success },
  'In Transit': { text: HC.warning, bg: HC.warningBg, dot: HC.warning },
  Registered: { text: HC.primary, bg: '#ecfeff', dot: HC.primary },
  Active: { text: HC.primary, bg: '#ecfeff', dot: HC.primary },
  Flagged: { text: '#dc2626', bg: '#fef2f2', dot: '#dc2626' },
};

interface RawBatch {
  batchId: string;
  drugName: string;
  region: string;
  quantity: number;
  expiryDate: number;
  currentOwner: string;
  status: number;
  isActive: boolean;
  registeredAt?: number;
}

function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function shortId(id: string): string {
  if (id.length <= 20) return id;
  return id.slice(0, 10) + '...' + id.slice(-6);
}

export default function HomeScreen() {
  const router = useRouter();
  const { wallet } = useAuth();
  const [batches, setBatches] = useState<RawBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributorCount, setDistributorCount] = useState(0);

  const loadData = useCallback(() => {
    if (!wallet) { setLoading(false); return; }
    setLoading(true);

    const loadBatches = api.get<{ batches: RawBatch[] }>(`/batches/by/manufacturer/${encodeURIComponent(wallet)}`)
      .then((r) => setBatches(r.batches ?? []))
      .catch(() => setBatches([]));

    const loadDistributors = api.get<{ distributors: { id: string }[] }>('/auth/distributors')
      .then((r) => setDistributorCount(r.distributors?.length ?? 0))
      .catch(() => setDistributorCount(0));

    Promise.all([loadBatches, loadDistributors]).finally(() => setLoading(false));
  }, [wallet]);

  useEffect(() => { loadData(); }, [loadData]);

  // Refresh when screen comes back into focus (e.g. after adding a batch)
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const totalBatches = batches.length;
  const inTransit = batches.filter((b) => b.status === 2).length;
  const flagged = batches.filter((b) => b.status === 4).length;
  const activeCount = batches.filter((b) => b.isActive).length;
  const compliance = totalBatches > 0 ? (((totalBatches - flagged) / totalBatches) * 100).toFixed(1) : '100';

  const stats = [
    { label: 'Total Batches', value: String(totalBatches), initial: 'B', color: HC.primary, bg: HC.primaryLight },
    { label: 'In Transit', value: String(inTransit), initial: 'T', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Active', value: String(activeCount), initial: 'A', color: HC.warning, bg: HC.warningBg },
    { label: 'Compliance', value: `${compliance}%`, initial: 'C', color: HC.success, bg: HC.successBg },
  ];

  const recentBatches = [...batches]
    .sort((a, b) => (b.registeredAt ?? 0) - (a.registeredAt ?? 0))
    .slice(0, 5);

  const [selectedBatch, setSelectedBatch] = useState<RawBatch | null>(null);
  const qrRef = useRef<any>(null);

  // ── Batch Detail View ──
  if (selectedBatch) {
    const b = selectedBatch;
    const statusLabel = STATUS_MAP[b.status] ?? 'Registered';
    const sc = statusColor[statusLabel] || statusColor.Registered;
    const qrData = JSON.stringify({ batchId: b.batchId, drug: b.drugName, region: b.region, quantity: b.quantity, expiryDate: b.expiryDate });

    const fmtDate = (ts: number) => {
      if (!ts) return '—';
      return new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleShareQR = async () => {
      try {
        await Share.share({
          message: `MedChain TN Batch\nBatch ID: ${b.batchId}\nDrug: ${b.drugName}\nQuantity: ${b.quantity}\nRegion: ${b.region}\nExpiry: ${fmtDate(b.expiryDate)}`,
        });
      } catch {
        // user cancelled
      }
    };

    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelectedBatch(null)} style={{ marginBottom: 16 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: HC.primary }}>← Back to Home</ThemedText>
          </TouchableOpacity>

          <ThemedText style={{ fontSize: 22, fontWeight: '800', color: HC.text, letterSpacing: -0.3, marginBottom: 20 }}>Batch Details</ThemedText>

          {/* QR Code */}
          <View style={[styles.detailCard, { alignItems: 'center', paddingVertical: 28 }]}>
            <QRCode value={qrData} size={180} color={HC.text} backgroundColor={HC.card} getRef={(ref: any) => (qrRef.current = ref)} />
            <ThemedText style={{ fontSize: 12, color: HC.textMuted, marginTop: 14 }}>Scan to verify batch authenticity</ThemedText>
            <TouchableOpacity onPress={handleShareQR} style={styles.shareBtn} activeOpacity={0.7}>
              <ThemedText style={styles.shareBtnText}>Share QR as Image</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.detailCard}>
            <ThemedText style={styles.detailSectionTitle}>BATCH INFORMATION</ThemedText>
            <DetailRow label="Batch ID" value={shortId(b.batchId)} mono />
            <DetailRow label="Drug" value={b.drugName} />
            <DetailRow label="Quantity" value={`${b.quantity.toLocaleString()} units`} />
            <DetailRow label="Region" value={b.region} />
            <DetailRow label="Expiry Date" value={fmtDate(b.expiryDate)} />
            <DetailRow label="Registered" value={fmtDate(b.registeredAt ?? 0)} />
            <DetailRow label="Status" value={statusLabel} valueSc={sc} />
            <DetailRow label="Owner" value={b.currentOwner ? shortId(b.currentOwner) : '—'} mono />
          </View>
        </ScrollView>
      </View>
    );
  }

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
            {[{ v: String(totalBatches), l: 'Batches' }, { v: String(distributorCount), l: 'Distributors' }, { v: String(new Set(batches.map((b) => b.region)).size), l: 'Regions' }].map((s, i) => (
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
          {stats.map((s) => (
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
            {loading ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ActivityIndicator color={HC.primary} />
              </View>
            ) : recentBatches.length === 0 ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ThemedText style={{ color: HC.textMuted, fontSize: 13 }}>No batches yet. Register your first batch!</ThemedText>
              </View>
            ) : (
              recentBatches.map((b, i) => {
                const label = STATUS_MAP[b.status] ?? 'Registered';
                const sc = statusColor[label] || statusColor.Registered;
                return (
                  <TouchableOpacity key={b.batchId + i} style={[styles.batchRow, i < recentBatches.length - 1 && styles.batchDivider]} activeOpacity={0.6} onPress={() => setSelectedBatch(b)}>
                    <View style={styles.batchLeft}>
                      <View style={styles.batchHeader}>
                        <ThemedText style={styles.batchDrug}>{b.drugName}</ThemedText>
                        <ThemedText style={styles.batchTime}>{timeAgo(b.registeredAt ?? 0)}</ThemedText>
                      </View>
                      <ThemedText style={styles.batchId}>{shortId(b.batchId)}</ThemedText>
                      <ThemedText style={styles.batchQty}>{b.quantity.toLocaleString()} units</ThemedText>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                      <ThemedText style={[styles.statusText, { color: sc.text }]}>{label}</ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* ── Network ── */}
        <LinearGradient colors={['#0f172a', '#1e293b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.networkCard}>
          <ThemedText style={styles.networkTitle}>Supply Chain Network</ThemedText>
          <ThemedText style={styles.networkDesc}>Real-time overview of your distribution network</ThemedText>
          <View style={styles.networkStats}>
            {[{ v: String(distributorCount), l: 'Distributors' }, { v: String(new Set(batches.map((b) => b.region)).size), l: 'Regions' }, { v: '12', l: 'Drug Types' }].map((s, i) => (
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

function DetailRow({ label, value, mono, valueSc }: { label: string; value: string; mono?: boolean; valueSc?: { text: string; bg: string; dot: string } }) {
  return (
    <View style={detailRowStyles.row}>
      <ThemedText style={detailRowStyles.label}>{label}</ThemedText>
      {valueSc ? (
        <View style={[styles.statusPill, { backgroundColor: valueSc.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: valueSc.dot }]} />
          <ThemedText style={[styles.statusText, { color: valueSc.text }]}>{value}</ThemedText>
        </View>
      ) : (
        <ThemedText style={[detailRowStyles.value, mono && { fontFamily: 'monospace', fontSize: 11 }]}>{value}</ThemedText>
      )}
    </View>
  );
}

const detailRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: HC.borderLight },
  label: { fontSize: 12, fontWeight: '600', color: HC.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  value: { fontSize: 13, fontWeight: '600', color: HC.text, maxWidth: '55%' as any, textAlign: 'right' },
});

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

  // Batch detail view styles
  detailCard: {
    backgroundColor: HC.card,
    borderRadius: HC.radiusLg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: HC.borderLight,
    ...CardShadow,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: HC.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  shareBtn: {
    marginTop: 18,
    backgroundColor: HC.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: HC.radiusFull,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
