import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/themed-text';
import { Dropdown } from '@/components/shared/Dropdown';
import { DRUGS, REGIONS, MOCK_DISTRIBUTORS } from '@/constants/medchain';
import { HC, CardShadow } from '@/constants/theme';
const MFG = HC;
import { generateBatchId, BatchFormData } from '@/hooks/use-batch';

interface Props {
  onSubmit: (data: BatchFormData) => void;
  loading?: boolean;
}

const drugOptions = DRUGS.map((d) => ({ label: d.name, value: d.code }));
const regionOptions = REGIONS.map((r) => ({ label: r, value: r }));
const distributorOptions = MOCK_DISTRIBUTORS.map((d) => ({ label: `${d.name} (${d.region})`, value: d.id }));

export function BatchForm({ onSubmit, loading }: Props) {
  const [drugCode, setDrugCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mfgDate, setMfgDate] = useState<Date | null>(null);
  const [expDate, setExpDate] = useState<Date | null>(null);
  const [showMfgPicker, setShowMfgPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);
  const [region, setRegion] = useState('');
  const [distributorId, setDistributorId] = useState('');

  const formatDate = (d: Date | null) => d ? d.toISOString().split('T')[0] : '';

  const batchId = drugCode ? generateBatchId(drugCode) : '—';

  const validate = (): string | null => {
    if (!drugCode) return 'Select a drug';
    if (!quantity || parseInt(quantity, 10) <= 0) return 'Quantity must be > 0';
    if (!mfgDate) return 'Select manufacture date';
    if (!expDate) return 'Select expiry date';
    if (expDate <= mfgDate) return 'Expiry must be after manufacture date';
    if (!region) return 'Select a region';
    if (!distributorId) return 'Select a distributor';
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { Alert.alert('Validation Error', err); return; }
    const drugName = DRUGS.find((d) => d.code === drugCode)?.name || '';
    onSubmit({ drug: drugName, drugCode, quantity, manufactureDate: formatDate(mfgDate), expiryDate: formatDate(expDate), region, distributorId });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>New Batch</ThemedText>
        <ThemedText style={styles.subtitle}>Register a pharmaceutical batch on-chain</ThemedText>
      </View>

      {/* Batch ID Preview */}
      <View style={styles.batchIdCard}>
        <ThemedText style={styles.batchIdLabel}>Auto-generated Batch ID</ThemedText>
        <ThemedText style={styles.batchIdValue} numberOfLines={1}>{batchId}</ThemedText>
      </View>

      {/* Drug & Quantity */}
      <View style={styles.card}>
        <ThemedText style={styles.sectionLabel}>Drug Information</ThemedText>
        <Dropdown label="Drug Name" value={drugCode} options={drugOptions} onSelect={setDrugCode} />
        <View style={styles.fieldGap} />
        <Field label="Quantity (units)" placeholder="e.g. 5000" value={quantity} onChange={setQuantity} keyboardType="number-pad" />
      </View>

      {/* Dates */}
      <View style={styles.card}>
        <ThemedText style={styles.sectionLabel}>Manufacturing Dates</ThemedText>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <DateField label="Manufacture Date" value={mfgDate} onPress={() => setShowMfgPicker(true)} />
          </View>
          <View style={styles.halfField}>
            <DateField label="Expiry Date" value={expDate} onPress={() => setShowExpPicker(true)} />
          </View>
        </View>
        {showMfgPicker && (
          <DateTimePicker
            value={mfgDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_e: DateTimePickerEvent, date?: Date) => {
              setShowMfgPicker(Platform.OS === 'ios');
              if (date) setMfgDate(date);
            }}
          />
        )}
        {showExpPicker && (
          <DateTimePicker
            value={expDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={mfgDate || undefined}
            onChange={(_e: DateTimePickerEvent, date?: Date) => {
              setShowExpPicker(Platform.OS === 'ios');
              if (date) setExpDate(date);
            }}
          />
        )}
      </View>

      {/* Assignment */}
      <View style={styles.card}>
        <ThemedText style={styles.sectionLabel}>Distribution Assignment</ThemedText>
        <Dropdown label="Region" value={region} options={regionOptions} onSelect={setRegion} />
        <View style={styles.fieldGap} />
        <Dropdown label="Distributor" value={distributorId} options={distributorOptions} onSelect={setDistributorId} />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}>
        <ThemedText style={styles.submitText}>{loading ? 'Registering…' : 'Register Batch'}</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, placeholder, value, onChange, keyboardType }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; keyboardType?: 'number-pad' | 'default';
}) {
  return (
    <View>
      <ThemedText style={fieldStyles.label}>{label}</ThemedText>
      <TextInput
        style={fieldStyles.input}
        keyboardType={keyboardType || 'default'}
        placeholder={placeholder}
        placeholderTextColor={MFG.textMuted}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

function DateField({ label, value, onPress }: { label: string; value: Date | null; onPress: () => void }) {
  const display = value
    ? value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  return (
    <View>
      <ThemedText style={fieldStyles.label}>{label}</ThemedText>
      <TouchableOpacity style={fieldStyles.dateBtn} onPress={onPress} activeOpacity={0.7}>
        <ThemedText style={[fieldStyles.dateText, !value && fieldStyles.datePlaceholder]}>
          {display || 'Select date'}
        </ThemedText>
        <View style={fieldStyles.calIconWrap}>
          <ThemedText style={fieldStyles.calIcon}>Cal</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: MFG.textSecondary, letterSpacing: 0.2 },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: MFG.border,
    borderRadius: MFG.radiusSm,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: MFG.primaryFaint,
    color: MFG.text,
  },
  dateBtn: {
    height: 50,
    borderWidth: 1.5,
    borderColor: MFG.border,
    borderRadius: MFG.radiusSm,
    paddingHorizontal: 14,
    backgroundColor: MFG.primaryFaint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 15, color: MFG.text },
  datePlaceholder: { color: MFG.textMuted },
  calIconWrap: { backgroundColor: '#ecfeff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  calIcon: { fontSize: 11, fontWeight: '700', color: '#0891b2' },
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: MFG.bg },
  container: { padding: 20, paddingBottom: 48 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: MFG.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: MFG.textMuted, marginTop: 4 },
  batchIdCard: {
    backgroundColor: MFG.primaryLight,
    borderRadius: MFG.radius,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  batchIdLabel: { fontSize: 11, fontWeight: '700', color: MFG.primary, textTransform: 'uppercase', letterSpacing: 1 },
  batchIdValue: { fontSize: 13, color: MFG.primaryDark, fontFamily: 'monospace', marginTop: 4 },
  card: {
    backgroundColor: MFG.card,
    borderRadius: MFG.radiusLg,
    padding: 18,
    marginBottom: 16,
    ...CardShadow,
  },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: MFG.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  fieldGap: { height: 14 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  submitBtn: {
    height: 54,
    backgroundColor: MFG.primary,
    borderRadius: MFG.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: MFG.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  disabled: { opacity: 0.55 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
