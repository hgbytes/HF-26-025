import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { DrugListing } from '@/hooks/use-drugs';

interface Props {
  drug: DrugListing;
  onPress: () => void;
}

const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: '#059669' },
  low: { label: 'Low Stock', color: '#d97706' },
  critical: { label: 'Critical Stock', color: '#dc2626' },
  unavailable: { label: 'Unavailable', color: '#64748b' },
};

export function DrugAvailabilityCard({ drug, onPress }: Props) {
  const { name, form, badge, pharmacyCount, price } = drug;
  const cfg = BADGE_CONFIG[badge];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <ThemedText style={styles.name}>{name}</ThemedText>
        <ThemedText style={styles.arrow}>→</ThemedText>
      </View>
      <ThemedText style={styles.form}>{form}</ThemedText>
      <ThemedText style={[styles.badge, { color: cfg.color }]}>
        {cfg.label}
      </ThemedText>
      {badge !== 'unavailable' && pharmacyCount > 0 ? (
        <ThemedText style={styles.pharmacies}>
          {pharmacyCount} pharmac{pharmacyCount === 1 ? 'y' : 'ies'} nearby
        </ThemedText>
      ) : badge === 'critical' ? (
        <ThemedText style={styles.warning}>Limited availability</ThemedText>
      ) : badge === 'unavailable' ? (
        <ThemedText style={styles.warning}>No stock available</ThemedText>
      ) : null}
      <ThemedText style={styles.price}>₹{price} per unit</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  arrow: { fontSize: 18, color: '#94a3b8' },
  form: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badge: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  pharmacies: { fontSize: 13, color: '#64748b', marginTop: 2 },
  warning: { fontSize: 13, color: '#dc2626', fontWeight: '600', marginTop: 2 },
  price: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
