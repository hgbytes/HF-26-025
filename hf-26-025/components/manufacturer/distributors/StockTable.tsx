import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC } from '@/constants/theme';
const MFG = HC;
import { StockItem } from '@/hooks/use-distributors';

interface Props {
  items: StockItem[];
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  ok:       { label: 'OK',       color: MFG.success, bg: MFG.successBg },
  low:      { label: 'Low',      color: MFG.warning, bg: MFG.warningBg },
  critical: { label: 'Critical', color: MFG.danger,  bg: MFG.dangerBg },
};

export function StockTable({ items }: Props) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <ThemedText style={[styles.headerText, { flex: 2 }]}>Drug</ThemedText>
        <ThemedText style={styles.headerText}>Qty</ThemedText>
        <ThemedText style={[styles.headerText, { textAlign: 'right' }]}>Status</ThemedText>
      </View>
      {items.map((item, i) => {
        const st = STATUS_STYLE[item.status];
        return (
          <View key={i} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
            <ThemedText style={[styles.cell, { flex: 2, fontWeight: '500' }]}>{item.drug}</ThemedText>
            <ThemedText style={styles.cell}>{item.quantity.toLocaleString()}</ThemedText>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                <View style={[styles.dot, { backgroundColor: st.color }]} />
                <ThemedText style={[styles.statusLabel, { color: st.color }]}>{st.label}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: MFG.radiusSm, overflow: 'hidden', borderWidth: 1, borderColor: MFG.border },
  headerRow: { flexDirection: 'row', backgroundColor: MFG.bg, paddingVertical: 10, paddingHorizontal: 14 },
  headerText: { flex: 1, fontWeight: '700', fontSize: 12, color: MFG.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  rowAlt: { backgroundColor: MFG.primaryFaint },
  cell: { flex: 1, fontSize: 14, color: MFG.text },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 12, fontWeight: '700' },
});
