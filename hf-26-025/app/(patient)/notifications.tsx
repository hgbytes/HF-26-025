import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NotificationCard } from '@/components/patient/notifications/notification-card';
import { useNotifications } from '@/hooks/use-notifications';

const FILTERS = ['all', 'unread', 'stock', 'refills'] as const;
const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  unread: 'Unread',
  stock: 'Stock',
  refills: 'Refills',
};

export default function NotificationsScreen() {
  const { notifications, filter, setFilter, unreadCount, markRead, markAllRead } = useNotifications();

  const groups = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    if (!acc[n.group]) acc[n.group] = [];
    acc[n.group].push(n);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Earlier'].filter((g) => groups[g]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ThemedText type="title">Notifications</ThemedText>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
              <ThemedText style={styles.markAll}>Mark all read</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <ThemedText style={styles.unreadText}>{unreadCount} unread</ThemedText>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {FILTER_LABELS[f]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {groupOrder.map((group) => (
          <View key={group}>
            <ThemedText style={styles.groupLabel}>{group}</ThemedText>
            {groups[group].map((n) => (
              <NotificationCard
                key={n.id}
                item={n}
                onPress={() => markRead(n.id)}
                onAction={n.actionLabel ? () => { /* navigate */ } : undefined}
              />
            ))}
          </View>
        ))}

        {notifications.length === 0 && (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>No notifications</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  markAll: { fontSize: 13, fontWeight: '600', color: '#059669' },
  unreadBadge: { backgroundColor: '#ecfdf5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: '#d1fae5' },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  chipRow: { flexDirection: 'row', marginBottom: 16 },
  chip: { backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#059669', borderColor: '#059669' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#fff' },
  groupLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#94a3b8' },
});
