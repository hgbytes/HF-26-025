import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { NotificationItem, NotificationType } from '@/hooks/use-notifications';

interface Props {
  item: NotificationItem;
  onPress: () => void;
  onAction?: () => void;
}

const ICON_MAP: Record<NotificationType, string> = {
  stock_alert: '!!',
  low_stock: '!',
  stock_restored: 'OK',
  refill_reminder: 'Rx',
  verify_log: 'V',
};

export function NotificationCard({ item, onPress, onAction }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <ThemedText style={styles.icon}>{ICON_MAP[item.type]}</ThemedText>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            {!item.read && <View style={styles.dot} />}
          </View>
          <ThemedText style={styles.desc}>{item.description}</ThemedText>
          <View style={styles.footer}>
            <ThemedText style={styles.time}>{item.timestamp}</ThemedText>
            {item.actionLabel && onAction && (
              <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
                <ThemedText style={styles.action}>{item.actionLabel} →</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  unread: { backgroundColor: '#ecfeff', borderLeftWidth: 3, borderLeftColor: '#059669' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  icon: { fontSize: 11, fontWeight: '800', color: '#0891b2', backgroundColor: '#ecfeff', width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28, overflow: 'hidden', marginTop: 2 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0891b2' },
  desc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 12, color: '#94a3b8' },
  action: { fontSize: 13, fontWeight: '600', color: '#059669' },
});
