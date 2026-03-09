import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  name: string;
  distanceKm: number;
}

export function NearbyFacilityRow({ name, distanceKm }: Props) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.icon}>L</ThemedText>
      <ThemedText style={styles.name}>{name}</ThemedText>
      <ThemedText style={styles.distance}>{distanceKm} km</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  icon: { fontSize: 11, fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5', width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, overflow: 'hidden' },
  name: { flex: 1, fontSize: 14, fontWeight: '500', color: '#0f172a' },
  distance: { fontSize: 13, color: '#64748b' },
});
