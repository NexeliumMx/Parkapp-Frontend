import { useState, useEffect } from 'react';
import { fetchPernocte } from '../httpRequests';

export function usePernocte(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPernocte(userId);
      setData(result);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { data, loading, error, refetch: fetchData };
}