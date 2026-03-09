import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';

interface Props {
  onScanned: (data: string) => void;
}

export function ScanViewfinder({ onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lastScannedRef = useRef<string | null>(null);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || data === lastScannedRef.current) return;
    setScanned(true);
    lastScannedRef.current = data;
    onScanned(data);
  };

  const resetScanner = () => {
    setScanned(false);
    lastScannedRef.current = null;
  };

  if (!permission) {
    return (
      <View style={styles.camera}>
        <ThemedText style={styles.placeholderText}>Initializing camera...</ThemedText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.camera}>
        <ThemedText style={styles.placeholderText}>Camera access needed</ThemedText>
        <ThemedText style={styles.placeholderSub}>We need camera permission to scan QR codes</ThemedText>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.7}>
          <ThemedText style={styles.permBtnText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.camera}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={resetScanner} activeOpacity={0.7}>
          <ThemedText style={styles.rescanText}>Tap to scan again</ThemedText>
        </TouchableOpacity>
      )}
      {!scanned && (
        <View style={styles.hintWrap}>
          <ThemedText style={styles.hintText}>Point camera at QR code</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    height: 300,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scanArea: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#0891b2',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  placeholderText: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4, textAlign: 'center' },
  placeholderSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 16, paddingHorizontal: 32 },
  permBtn: { backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hintWrap: { position: 'absolute', bottom: 20, zIndex: 2 },
  hintText: { fontSize: 13, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, overflow: 'hidden' },
  rescanBtn: { position: 'absolute', bottom: 20, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  rescanText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
