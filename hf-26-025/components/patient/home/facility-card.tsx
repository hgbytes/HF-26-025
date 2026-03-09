import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { Facility } from '@/hooks/use-drugs';

interface Props {
  facility: Facility;
}

const TYPE_ICON: Record<string, string> = {
  hospital: 'H',
  pharmacy: 'Rx',
  clinic: 'C',
};

export function FacilityCard({ facility }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.icon}>{TYPE_ICON[facility.type] || 'H'}</ThemedText>
        <ThemedText style={styles.name}>{facility.name}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.stock}>{facility.stock.toLocaleString()} units in stock</ThemedText>
      </View>
      <View style={styles.meta}>
        <ThemedText style={styles.metaText}>{facility.distanceKm} km away</ThemedText>
        <ThemedText style={styles.metaText}>Open: {facility.hours}</ThemedText>
      </View>
    </View>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  icon: { fontSize: 13, fontWeight: '800', color: '#0891b2', backgroundColor: '#ecfeff', width: 28, height: 28, borderRadius: 8, textAlign: 'center', lineHeight: 28, overflow: 'hidden' },
  name: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  row: { marginBottom: 4 },
  stock: { fontSize: 14, color: '#059669', fontWeight: '600' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  metaText: { fontSize: 13, color: '#64748b' },
});
