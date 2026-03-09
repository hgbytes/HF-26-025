import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC } from '@/constants/theme';
const MFG = HC;

interface Props {
  features: string[];
}

export function FlaggedFeatureList({ features }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Flagged Features</ThemedText>
      {features.map((f, i) => (
        <View key={i} style={styles.item}>
          <View style={styles.flagDot} />
          <ThemedText style={styles.text}>{f}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: { fontSize: 13, fontWeight: '700', color: MFG.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: MFG.dangerBg, padding: 10, borderRadius: MFG.radiusSm },
  flagDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MFG.danger },
  text: { flex: 1, fontSize: 14, color: MFG.text, lineHeight: 20 },
});
