import { StyleSheet, TouchableOpacity, View, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { HC, RoleColors, CardShadow } from '@/constants/theme';

const ROLES: { key: UserRole; label: string; initial: string; desc: string }[] = [
  { key: 'manufacturer', label: 'Manufacturer', initial: 'M', desc: 'Register batches & manage supply' },
  { key: 'distributor', label: 'Distributor', initial: 'D', desc: 'Track inventory & transfers' },
  { key: 'patient', label: 'Patient', initial: 'P', desc: 'Verify drugs & prescriptions' },
];

export default function LoginScreen() {
  const { selectRole } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0e7490', '#0891b2', '#06b6d4']} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.headerGradient}>
        <View style={styles.logoWrap}>
          <Image
            source={require('@/assets/images/medchain-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.brand}>MedChain TN</ThemedText>
        <ThemedText style={styles.subtitle}>Healthcare Supply Chain Platform</ThemedText>
        <View style={styles.tagline}>
          <View style={styles.tagDot} />
          <ThemedText style={styles.tagText}>Blockchain-Powered</ThemedText>
          <View style={styles.tagSep} />
          <View style={styles.tagDot} />
          <ThemedText style={styles.tagText}>AI-Driven</ThemedText>
          <View style={styles.tagSep} />
          <View style={styles.tagDot} />
          <ThemedText style={styles.tagText}>Secure</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <ThemedText style={styles.prompt}>Continue as</ThemedText>

        <View style={styles.roles}>
          {ROLES.map((r) => {
            const rc = RoleColors[r.key];
            return (
              <TouchableOpacity
                key={r.key}
                style={styles.roleCard}
                onPress={() => selectRole(r.key)}
                activeOpacity={0.6}
              >
                <LinearGradient colors={[...rc.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.roleIconWrap}>
                  <ThemedText style={styles.roleIcon}>{r.initial}</ThemedText>
                </LinearGradient>
                <View style={styles.roleInfo}>
                  <ThemedText style={styles.roleLabel}>{r.label}</ThemedText>
                  <ThemedText style={styles.roleDesc}>{r.desc}</ThemedText>
                </View>
                <View style={styles.arrow}>
                  <ThemedText style={styles.arrowText}>›</ThemedText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedText style={styles.footer}>v1.0.0 · Tamil Nadu Health Authority</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e7490' },

  headerGradient: {
    paddingTop: 64,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: { width: 56, height: 56, borderRadius: 16 },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    fontWeight: '500',
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: HC.radiusFull,
  },
  tagDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  tagText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginLeft: 6 },
  tagSep: { width: 12 },

  body: {
    flex: 1,
    backgroundColor: HC.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: HC.text,
    marginBottom: 20,
    letterSpacing: -0.2,
  },

  roles: { gap: 12 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: HC.radius,
    backgroundColor: HC.card,
    borderWidth: 1,
    borderColor: HC.borderLight,
    ...CardShadow,
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIcon: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  roleInfo: { flex: 1 },
  roleLabel: { fontSize: 16, fontWeight: '700', color: HC.text },
  roleDesc: { fontSize: 12, color: HC.textMuted, marginTop: 2, fontWeight: '500' },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: HC.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 22, fontWeight: '400', color: HC.textMuted, marginTop: -2 },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: HC.textMuted,
    marginTop: 'auto' as any,
    paddingBottom: 32,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
