import { useState } from 'react';
import {
  Modal,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC, CardShadow } from '@/constants/theme';
const MFG = HC;

interface DropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ label, value, options, onSelect, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <ThemedText style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected?.label || placeholder || `Select ${label}`}
        </ThemedText>
        <ThemedText style={styles.arrow}>▾</ThemedText>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ThemedText style={styles.sheetTitle}>{label}</ThemedText>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => { onSelect(item.value); setOpen(false); }}
                  activeOpacity={0.6}>
                  <ThemedText
                    style={item.value === value ? styles.optionTextSelected : styles.optionText}>
                    {item.label}
                  </ThemedText>
                  {item.value === value && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: MFG.textSecondary, letterSpacing: 0.2 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderWidth: 1.5,
    borderColor: MFG.border,
    borderRadius: MFG.radiusSm,
    paddingHorizontal: 16,
    backgroundColor: MFG.primaryFaint,
  },
  value: { fontSize: 15, color: MFG.text, flex: 1, marginRight: 8 },
  placeholder: { fontSize: 15, color: MFG.textMuted, flex: 1, marginRight: 8 },
  arrow: { fontSize: 16, color: MFG.textMuted },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: MFG.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '55%',
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: MFG.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: MFG.text,
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MFG.borderLight,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: MFG.borderLight,
  },
  optionSelected: { backgroundColor: MFG.primaryFaint },
  optionText: { fontSize: 16, color: MFG.text },
  optionTextSelected: { fontSize: 16, color: MFG.primary, fontWeight: '600' },
  checkmark: { fontSize: 18, color: MFG.primary, fontWeight: '700' },
});
