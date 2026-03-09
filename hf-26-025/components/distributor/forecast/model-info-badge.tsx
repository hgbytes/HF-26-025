import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { ModelInfo } from '@/hooks/use-forecast';

interface Props {
  model: ModelInfo;
}

export function ModelInfoBadge({ model }: Props) {
  if (!model) return null;
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Model Info</ThemedText>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Model</ThemedText>
        <ThemedText style={styles.value}>{model.name}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Version</ThemedText>
        <ThemedText style={styles.value}>{model.version}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Accuracy</ThemedText>
        <ThemedText style={styles.value}>{(model.accuracy * 100).toFixed(0)}%</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Last Trained</ThemedText>
        <ThemedText style={styles.value}>{model.lastTrained}</ThemedText>
      </View>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Data Points</ThemedText>
        <ThemedText style={styles.value}>{model.dataPoints.toLocaleString()}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ecfeff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  title: { fontSize: 14, fontWeight: '700', color: '#0e7490', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label: { fontSize: 13, color: '#155e75' },
  value: { fontSize: 13, fontWeight: '600', color: '#155e75' },
});
