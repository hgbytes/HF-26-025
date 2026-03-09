import { useState, useCallback } from 'react';
import { api } from '@/services/api';

export type ScanState = 'scanning' | 'loading' | 'result';
export type VerifyResult = 'authentic' | 'expired' | 'invalid';

export interface CustodyEntry {
  step: number;
  actor: string;
  role: string;
  action: string;
  timestamp: string;
}

export interface ScanResult {
  result: VerifyResult;
  drug?: string;
  form?: string;
  batchId: string;
  manufacturer?: string;
  manufacturerVerified?: boolean;
  registeredDate?: string;
  expiryDate?: string;
  daysLeft?: number;
  safeToUse?: boolean;
  custody?: CustodyEntry[];
  txHash?: string;
  blockNumber?: number;
  reason?: string;
}

interface VerifyResponse {
  isValid: boolean;
  drugName: string;
  region: string;
  expiryDate: number;
  currentOwner: string;
  ownerName: string;
  status: number;
}

interface AuditEntryRaw {
  entryId: string;
  batchId: string;
  action: string;
  performedBy: string;
  timestamp: number;
  metadata: string;
}

function fmtDate(ts: number): string {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function useScan() {
  const [state, setState] = useState<ScanState>('scanning');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const verifyBatch = useCallback(async (batchId: string): Promise<ScanResult> => {
    setState('loading');
    try {
      const v = await api.get<VerifyResponse>(`/batches/${encodeURIComponent(batchId)}/verify`);
      const now = Math.floor(Date.now() / 1000);
      const daysLeft = Math.floor((v.expiryDate - now) / 86400);

      let custody: CustodyEntry[] = [];
      try {
        const a = await api.get<{ entries: AuditEntryRaw[] }>(`/audit/trail/${encodeURIComponent(batchId)}`);
        custody = a.entries.map((e, i) => ({
          step: i + 1,
          actor: e.performedBy.slice(0, 6) + '...' + e.performedBy.slice(-4),
          role: e.action.includes('BATCH_CREATED') ? 'Manufacturer' : e.action.includes('TRANSFER') ? 'Distributor' : 'System',
          action: e.action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase()),
          timestamp: fmtDate(e.timestamp),
        }));
      } catch { /* audit not available */ }

      if (daysLeft < 0) {
        const r: ScanResult = { result: 'expired', drug: v.drugName, batchId, expiryDate: fmtDate(v.expiryDate), daysLeft, safeToUse: false };
        setScanResult(r); setState('result'); return r;
      }

  /** Parse QR data (JSON string from manufacturer QR) and verify the batch */
  const verifyFromQR = useCallback(async (rawData: string): Promise<ScanResult> => {
    let batchId: string;
    try {
      const parsed = JSON.parse(rawData);
      batchId = parsed.batchId || rawData;
    } catch {
      // Not JSON — treat the raw string as a batch ID
      batchId = rawData.trim();
    }
    return verifyBatch(batchId);
  }, [verifyBatch]);

  const resetScan = useCallback(() => {
    setState('scanning');
    setScanResult(null);
  }, []);

  return { state, scanResult, verifyBatch, verifyFromQR, resetScan };
      const r: ScanResult = {
        result: 'authentic', drug: v.drugName, batchId,
        manufacturer: v.ownerName || v.currentOwner, manufacturerVerified: v.isValid,
        expiryDate: fmtDate(v.expiryDate), daysLeft, safeToUse: true, custody,
      };
      setScanResult(r); setState('result'); return r;
    } catch (err: any) {
      const r: ScanResult = { result: 'invalid', batchId, reason: err.message || 'Batch not found on blockchain' };
      setScanResult(r); setState('result'); return r;
    }
  }, []);

  const resetScan = useCallback(() => { setState('scanning'); setScanResult(null); }, []);

  return { state, scanResult, verifyBatch, resetScan };
}
