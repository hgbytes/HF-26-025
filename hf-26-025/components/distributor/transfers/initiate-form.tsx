import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Dropdown } from '@/components/shared/Dropdown';
import { DRUGS, MOCK_DISTRIBUTORS } from '@/constants/medchain';
import type { InitiateTransferData } from '@/hooks/use-transfers';

interface Props {
  onSubmit: (data: InitiateTransferData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function InitiateForm({ onSubmit, onCancel, loading }: Props) {
  const [drugCode, setDrugCode] = useState('');
  const [batchId, setBatchId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [toId, setToId] = useState('');

  const selectedDrug = DRUGS.find((d) => d.code === drugCode);
  const selectedTo = MOCK_DISTRIBUTORS.find((d) => d.id === toId);

  const isValid = drugCode && batchId.trim() && quantity.trim() && parseInt(quantity, 10) > 0 && toId;

  const handleSubmit = () => {
    if (!isValid || !selectedDrug || !selectedTo) return;
    onSubmit({
      batchId: batchId.trim(),
      drug: selectedDrug.name,
      quantity: parseInt(quantity, 10),
      toWallet: selectedTo.wallet,
      toName: selectedTo.name,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText style={styles.title}>Initiate Transfer</ThemedText>

      <Dropdown
        label="Drug"
        placeholder="Select drug"
        value={drugCode}
        onSelect={setDrugCode}
        options={DRUGS.map((d) => ({ label: d.name, value: d.code }))}
      />

      <View style={styles.fieldGap} />

      <ThemedText style={styles.fieldLabel}>Batch ID</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Enter batch ID"
        value={batchId}
        onChangeText={setBatchId}
      />

      <View style={styles.fieldGap} />

      <ThemedText style={styles.fieldLabel}>Quantity</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Enter quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
      />

      <View style={styles.fieldGap} />

      <Dropdown
        label="Transfer To"
        placeholder="Select recipient"
        value={toId}
        onSelect={setToId}
        options={MOCK_DISTRIBUTORS.map((d) => ({ label: `${d.name} (${d.region})`, value: d.id }))}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
          <ThemedText style={styles.cancelText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={!isValid || loading}
        >
          <ThemedText style={styles.submitText}>{loading ? 'Submitting...' : 'Submit'}</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 4 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 20, letterSpacing: -0.3 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  fieldGap: { height: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#f8fafc',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  submitBtn: { flex: 1, backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
