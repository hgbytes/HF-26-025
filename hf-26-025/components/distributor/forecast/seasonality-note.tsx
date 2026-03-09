import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  note: string;
}

export function SeasonalityNote({ note }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.icon}>S</ThemedText>
      <ThemedText style={styles.text}>{note}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    alignItems: 'flex-start',
  },
  icon: { fontSize: 11, fontWeight: '800', color: '#7c3aed', backgroundColor: '#f5f3ff', width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, overflow: 'hidden' },
  text: { fontSize: 13, color: '#92400e', flex: 1, lineHeight: 18 },
});
