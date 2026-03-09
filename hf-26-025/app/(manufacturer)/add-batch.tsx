import { useState } from 'react';
import { Alert, View } from 'react-native';
import { BatchForm } from '@/components/manufacturer/add-batch/BatchForm';
import { QRDisplay } from '@/components/manufacturer/add-batch/QRDisplay';
import { TxReceipt } from '@/components/manufacturer/add-batch/TxReceipt';
import { useBatch, BatchResult, BatchFormData } from '@/hooks/use-batch';
import { MFG } from '@/constants/theme';

type Screen = 'form' | 'qr' | 'receipt';

export default function AddBatchScreen() {
  const [view, setView] = useState<Screen>('form');
  const [result, setResult] = useState<BatchResult | null>(null);
  const { registerBatch, loading } = useBatch();

  const handleSubmit = async (data: BatchFormData) => {
    try {
      const res = await registerBatch(data);
      setResult(res);
      setView('qr');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message);
    }
  };

  const handleRegisterAnother = () => {
    setResult(null);
    setView('form');
  };

  return (
    <View style={{ flex: 1, backgroundColor: MFG.bg }}>
      {view === 'form' && <BatchForm onSubmit={handleSubmit} loading={loading} />}
      {view === 'qr' && result && (
        <QRDisplay
          batch={result}
          onRegisterAnother={handleRegisterAnother}
          onViewReceipt={() => setView('receipt')}
        />
      )}
      {view === 'receipt' && result && (
        <TxReceipt batch={result} onBack={() => setView('qr')} />
      )}
    </View>
  );
}
