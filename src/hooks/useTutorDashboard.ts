import { useEffect, useState } from 'react';
import { tutorService, type TutorDashboardResponse } from '@/api/services/tutorService';

export function useTutorDashboard() {
  const [data, setData] = useState<TutorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await tutorService.getDashboard();
        setData(response);
      } catch {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
}
