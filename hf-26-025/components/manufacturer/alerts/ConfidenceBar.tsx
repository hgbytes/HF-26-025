import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MFG } from '@/constants/theme';

interface Props {
  score: number;
}

export function ConfidenceBar({ score }: Props) {
  const pct = Math.round(score * 100);
  const color = score > 0.85 ? MFG.danger : score > 0.6 ? MFG.warning : MFG.success;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={styles.label}>Confidence Score</ThemedText>
        <ThemedText style={[styles.pct, { color }]}>{score.toFixed(2)} ({pct}%)</ThemedText>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: MFG.textSecondary },
  barBg: { height: 10, backgroundColor: MFG.borderLight, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  pct: { fontSize: 13, fontWeight: '800' },
});
