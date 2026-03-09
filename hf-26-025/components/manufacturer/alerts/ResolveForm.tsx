import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HC, CardShadow } from '@/constants/theme';
const MFG = HC;
import { AlertItem, ResolutionAction } from '@/hooks/use-alerts';

interface Props {
  alert: AlertItem;
  onResolve: (action: ResolutionAction, notes: string) => void;
  loading?: boolean;
}

const OPTIONS: { key: ResolutionAction; label: string; desc: string }[] = [
  { key: 'investigated', label: 'Mark as Investigated', desc: 'No further action needed' },
  { key: 'escalate', label: 'Escalate to Authority', desc: 'Flag for regulatory review' },
  { key: 'false_positive', label: 'False Positive', desc: 'Dismiss — expected movement' },
];

export function ResolveForm({ alert, onResolve, loading }: Props) {
  const [selected, setSelected] = useState<ResolutionAction | null>(null);
  const [notes, setNotes] = useState('');

  return (
    <View style={styles.container}>
      {/* Alert context */}
      <View style={styles.contextCard}>
        <ThemedText style={styles.batchInfo}>Batch: {alert.batchId}</ThemedText>
        <ThemedText style={styles.drugInfo}>{alert.drug}  ·  {alert.region}</ThemedText>
        <ThemedText style={styles.alertType}>Alert: {alert.type}</ThemedText>
      </View>

      <ThemedText style={styles.sectionLabel}>RESOLUTION ACTION</ThemedText>

      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.option, selected === opt.key && styles.optionSelected]}
          onPress={() => setSelected(opt.key)}
          activeOpacity={0.7}>
          <View style={[styles.radio, selected === opt.key && styles.radioActive]}>
            {selected === opt.key && <View style={styles.radioDot} />}
          </View>
          <View style={styles.optionInfo}>
            <ThemedText style={[styles.optionLabel, selected === opt.key && styles.optionLabelActive]}>{opt.label}</ThemedText>
            <ThemedText style={styles.optionDesc}>{opt.desc}</ThemedText>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.notesSection}>
        <ThemedText style={styles.notesLabel}>NOTES (OPTIONAL)</ThemedText>
        <TextInput
          style={styles.notesInput}
          placeholder="Add investigation notes..."
          placeholderTextColor={MFG.textMuted}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        style={[styles.confirmBtn, (!selected || loading) && styles.disabled]}
        onPress={() => selected && onResolve(selected, notes)}
        disabled={!selected || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.confirmText}>Confirm Resolution</ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  contextCard: {
    backgroundColor: MFG.primaryFaint, borderRadius: MFG.radiusSm, padding: 14,
    borderWidth: 1, borderColor: MFG.primaryLight, gap: 2,
  },
  batchInfo: { fontSize: 13, fontFamily: 'monospace', color: MFG.primary, fontWeight: '600' },
  drugInfo: { fontSize: 14, color: MFG.textSecondary },
  alertType: { fontSize: 15, fontWeight: '700', color: MFG.text, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: MFG.textSecondary, letterSpacing: 0.8, marginTop: 4 },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: MFG.radius, borderWidth: 1.5, borderColor: MFG.border, gap: 12,
    backgroundColor: MFG.card,
  },
  optionSelected: { borderColor: MFG.primary, backgroundColor: MFG.primaryFaint },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: MFG.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: MFG.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: MFG.primary },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: MFG.text },
  optionLabelActive: { color: MFG.primary },
  optionDesc: { fontSize: 13, color: MFG.textMuted },
  notesSection: { gap: 6, marginTop: 4 },
  notesLabel: { fontSize: 12, fontWeight: '700', color: MFG.textSecondary, letterSpacing: 0.6 },
  notesInput: {
    borderWidth: 1.5, borderColor: MFG.border, borderRadius: MFG.radiusSm,
    padding: 12, minHeight: 80, textAlignVertical: 'top',
    fontSize: 14, backgroundColor: MFG.primaryFaint, color: MFG.text,
  },
  confirmBtn: {
    height: 54, backgroundColor: MFG.primary, borderRadius: MFG.radius,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: MFG.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  disabled: { opacity: 0.4 },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
