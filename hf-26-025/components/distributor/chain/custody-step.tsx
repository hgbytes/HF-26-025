import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { CustodyEntry } from '@/hooks/use-chain-history';

interface Props {
  entry: CustodyEntry;
  isLast: boolean;
}

export function CustodyStep({ entry, isLast }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.action}>{entry.action}</ThemedText>
          <ThemedText style={styles.timestamp}>{entry.timestamp}</ThemedText>
        </View>
        <ThemedText style={styles.actor}>{entry.actor}</ThemedText>
        <ThemedText style={styles.role}>{entry.role}</ThemedText>
        {entry.location && (
          <ThemedText style={styles.location}>{entry.location}</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', minHeight: 80 },
  timeline: { width: 24, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0891b2', marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginTop: 4 },
  content: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  action: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  timestamp: { fontSize: 11, color: '#64748b' },
  actor: { fontSize: 13, fontWeight: '600', color: '#0891b2' },
  role: { fontSize: 12, color: '#64748b', marginTop: 1 },
  location: { fontSize: 12, color: '#64748b', marginTop: 4 },
});
