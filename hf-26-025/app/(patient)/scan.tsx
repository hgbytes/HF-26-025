import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScanViewfinder } from '@/components/patient/scan/scan-viewfinder';
import { ManualBatchInput } from '@/components/patient/scan/manual-batch-input';
import { AuthenticCard } from '@/components/patient/scan/authentic-card';
import { ExpiredCard } from '@/components/patient/scan/expired-card';
import { InvalidCard } from '@/components/patient/scan/invalid-card';
import { useScan } from '@/hooks/use-scan';

export default function ScanQRScreen() {
  const { state, scanResult, verifyBatch, verifyFromQR, resetScan } = useScan();

  const handleQRScanned = (data: string) => {
    verifyFromQR(data);
  };

  if (state === 'loading') {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#0891b2" />
        <ThemedText style={styles.loadingText}>Verifying on blockchain...</ThemedText>
      </ThemedView>
    );
  }

  if (state === 'result' && scanResult) {
    if (scanResult.result === 'authentic') {
      return (
        <ThemedView style={styles.container}>
          <AuthenticCard data={scanResult} onScanAnother={resetScan} />
        </ThemedView>
      );
    }
    if (scanResult.result === 'expired') {
      return (
        <ThemedView style={styles.container}>
          <ExpiredCard
            data={scanResult}
            onFindStock={() => { /* navigate to home */ }}
            onScanAnother={resetScan}
          />
        </ThemedView>
      );
    }
    return (
      <ThemedView style={styles.container}>
        <InvalidCard
          data={scanResult}
          onReport={() => { /* report action */ }}
          onScanAgain={resetScan}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.title}>Scan QR Code</ThemedText>
        <ThemedText style={styles.subtitle}>Verify drug authenticity via blockchain</ThemedText>

        <ScanViewfinder onScanned={handleQRScanned} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>or enter manually</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <ManualBatchInput onSubmit={verifyBatch} loading={false} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { marginBottom: 4, color: '#0f172a', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  loadingText: { fontSize: 14, color: '#64748b', marginTop: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 12, color: '#94a3b8', marginHorizontal: 14, fontWeight: '500' },
});
