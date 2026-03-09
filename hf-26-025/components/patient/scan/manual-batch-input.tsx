import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface Props {
  onSubmit: (batchId: string) => void;
  loading?: boolean;
}

export function ManualBatchInput({ onSubmit, loading }: Props) {
  const [batchId, setBatchId] = useState('');

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Or enter manually</ThemedText>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Batch ID: e.g. BATCH_TN_PARA_..."
          placeholderTextColor="#999"
          value={batchId}
          onChangeText={setBatchId}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.btn, (!batchId.trim() || loading) && styles.btnDisabled]}
          onPress={() => { if (batchId.trim()) onSubmit(batchId.trim()); }}
          disabled={!batchId.trim() || loading}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.btnText}>{loading ? '...' : 'Search'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  btn: { backgroundColor: '#0891b2', borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
