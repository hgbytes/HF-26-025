import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';

export type AlertSeverity = 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'investigating' | 'resolved';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  type: string;
  batchId: string;
  drug: string;
  region: string;
  distributor: string;
  confidence: number;
  timestamp: string;
  status: AlertStatus;
  flaggedFeatures: string[];
  recommendation: string;
  timeline: { time: string; event: string; flagged?: boolean }[];
}

export type ResolutionAction = 'escalate' | 'false_positive';

interface DbAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  batchId: string;
  drug: string;
  region: string;
  createdAt: string;
  read: boolean;
}

function dbAlertToAlertItem(a: DbAlert): AlertItem {
  return {
    id: `db-${a.id}`,
    severity: (a.severity as AlertSeverity) || 'high',
    type: a.title,
    batchId: a.batchId || '',
    drug: a.drug || '',
    region: a.region || '',
    distributor: '',
    confidence: 1,
    timestamp: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    status: 'open',
    flaggedFeatures: ['Expired product detected by patient scan'],
    recommendation: a.description,
    timeline: [{ time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : '', event: 'Patient scanned expired batch', flagged: true }],
  };
}

export function useAlerts() {
  const { wallet } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMl = api.get<{ anomalies: AlertItem[] }>('/ml/anomalies')
      .then((r) => r.anomalies ?? [])
      .catch(() => [] as AlertItem[]);

    const loadDb = wallet
      ? api.get<{ alerts: DbAlert[] }>(`/batches/alerts/${encodeURIComponent(wallet)}`)
          .then((r) => (r.alerts ?? []).map(dbAlertToAlertItem))
          .catch(() => [] as AlertItem[])
      : Promise.resolve([] as AlertItem[]);

    Promise.all([loadMl, loadDb])
      .then(([ml, db]) => setAlerts([...db, ...ml]))
      .finally(() => setLoading(false));
  }, [wallet]);

  const filtered = alerts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'open') return a.status === 'open' || a.status === 'investigating';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  const getAlert = useCallback(
    (id: string): AlertItem | undefined => alerts.find((a) => a.id === id),
    [alerts],
  );

  const resolveAlert = useCallback(
    async (id: string, action: ResolutionAction, notes?: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as AlertStatus } : a)),
      );
    },
    [],
  );

  return { alerts: filtered, filter, setFilter, getAlert, resolveAlert, loading };
}
