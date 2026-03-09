import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  hash: string;
  blockNumber?: number;
}

export function TxHashBadge({ hash, blockNumber }: Props) {
  const shortHash = hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText style={styles.label}>Tx Hash</ThemedText>
        <ThemedText style={styles.hash} numberOfLines={1}>{shortHash}</ThemedText>
      </View>
      {blockNumber !== undefined && (
        <View style={styles.row}>
          <ThemedText style={styles.label}>Block</ThemedText>
          <ThemedText style={styles.block}>#{blockNumber}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  label: { fontSize: 12, color: '#64748b' },
  hash: { fontSize: 12, fontWeight: '600', color: '#0891b2', fontFamily: 'monospace' },
  block: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
});
