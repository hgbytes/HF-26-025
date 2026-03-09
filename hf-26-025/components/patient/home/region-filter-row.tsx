import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  regions: string[];
  selected: string;
  onSelect: (region: string) => void;
}

export function RegionFilterRow({ regions, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Filter by Region</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, selected === 'All' && styles.chipActive]}
            onPress={() => onSelect('All')}>
            <ThemedText style={[styles.chipText, selected === 'All' && styles.chipTextActive]}>All</ThemedText>
          </TouchableOpacity>
          {regions.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, selected === r && styles.chipActive]}
              onPress={() => onSelect(r)}>
              <ThemedText style={[styles.chipText, selected === r && styles.chipTextActive]}>{r}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#059669', borderColor: '#059669' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#fff' },
});
