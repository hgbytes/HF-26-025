import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { NotificationItem } from '@/hooks/use-notifications';

interface Props {
  item: NotificationItem;
  onViewPrescription: () => void;
}

export function RefillReminderCard({ item, onViewPrescription }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ThemedText style={styles.icon}>Rx</ThemedText>
        <View style={styles.content}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={styles.desc}>{item.description}</ThemedText>
          <View style={styles.footer}>
            <ThemedText style={styles.time}>{item.timestamp}</ThemedText>
            <TouchableOpacity onPress={onViewPrescription} activeOpacity={0.7}>
              <ThemedText style={styles.action}>View Prescription →</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ecfeff', borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#0891b2', padding: 14, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  icon: { fontSize: 11, fontWeight: '800', color: '#0891b2', backgroundColor: '#cffafe', width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28, overflow: 'hidden', marginTop: 2 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  desc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 12, color: '#94a3b8' },
  action: { fontSize: 13, fontWeight: '600', color: '#059669' },
});
