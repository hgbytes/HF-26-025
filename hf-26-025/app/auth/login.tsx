import { StyleSheet, TouchableOpacity, View, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { useAuth, UserRole } from '@/contexts/auth-context';

const ROLES: { key: UserRole; label: string; icon: string; desc: string; accent: string }[] = [
  { key: 'manufacturer', label: 'Manufacturer', icon: '🏭', desc: 'Register batches & manage supply', accent: '#0a7ea4' },
  { key: 'distributor', label: 'Distributor', icon: '🚚', desc: 'Track inventory & transfers', accent: '#7c3aed' },
  { key: 'patient', label: 'Patient', icon: '🧑‍⚕️', desc: 'Verify drugs & prescriptions', accent: '#10b981' },
];

export default function LoginScreen() {
  const { selectRole } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient colors={['#0a7ea4', '#06b6d4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
        <Image
          source={require('@/assets/images/medchain-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.brand}>MedChain TN</ThemedText>
        <ThemedText style={styles.subtitle}>Healthcare Supply Chain Management</ThemedText>
        <View style={styles.tagline}>
          <ThemedText style={styles.tagText}>Blockchain-Powered · AI-Driven · Secure</ThemedText>
        </View>
      </LinearGradient>

      {/* Curved white body */}
      <View style={styles.body}>
        <ThemedText style={styles.prompt}>Select your role</ThemedText>

        <View style={styles.roles}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={styles.roleCard}
              onPress={() => selectRole(r.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: r.accent + '14' }]}>
                <ThemedText style={styles.roleIcon}>{r.icon}</ThemedText>
              </View>
              <View style={styles.roleInfo}>
                <ThemedText style={[styles.roleLabel, { color: r.accent }]}>{r.label}</ThemedText>
                <ThemedText style={styles.roleDesc}>{r.desc}</ThemedText>
              </View>
              <View style={[styles.arrow, { backgroundColor: r.accent + '12' }]}>
                <ThemedText style={[styles.arrowText, { color: r.accent }]}>→</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText style={styles.footer}>v1.0.0 · Tamil Nadu Health Authority</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a7ea4' },

  // ── Gradient Header ──
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 14,
    borderRadius: 22,
  },
  brand: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    fontWeight: '500',
  },
  tagline: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Body ──
  body: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },

  // ── Role Cards ──
  roles: { gap: 14 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  roleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIcon: { fontSize: 26 },
  roleInfo: { flex: 1 },
  roleLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  roleDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 3,
    fontWeight: '500',
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 18, fontWeight: '600' },

  // ── Footer ──
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 'auto' as any,
    paddingBottom: 30,
    fontWeight: '500',
  },
});
