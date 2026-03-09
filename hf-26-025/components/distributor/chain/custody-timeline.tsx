import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustodyStep } from './custody-step';
import type { BatchChain } from '@/hooks/use-chain-history';

interface Props {
  chain: BatchChain;
}

export function CustodyTimeline({ chain }: Props) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>Chain of Custody</ThemedText>
      <View style={styles.meta}>
        <ThemedText style={styles.metaText}>Batch: {chain.batchId}</ThemedText>
        <ThemedText style={styles.metaText}>Drug: {chain.drug}</ThemedText>
        <ThemedText style={styles.metaText}>Created: {chain.createdDate}</ThemedText>
      </View>
      <View style={styles.timeline}>
        {chain.custody.map((entry, i) => (
          <CustodyStep key={entry.step} entry={entry} isLast={i === chain.custody.length - 1} />
        ))}
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
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  meta: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  metaText: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  timeline: { marginTop: 4 },
});
