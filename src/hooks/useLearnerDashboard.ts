import { useEffect, useState } from 'react';
import { learnerService } from '@/api/services/learnerService';
import { normalizeRecord } from '@/lib/apiData';

export function useLearnerDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashboardResponse, statsResponse] = await Promise.all([
          learnerService.getDashboard(),
          learnerService.getStats(),
        ]);

        setData(normalizeRecord(dashboardResponse));
        setStats(normalizeRecord(statsResponse));
      } catch {
        setError('Gagal memuat data dashboard dari backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, stats, loading, error };
}
