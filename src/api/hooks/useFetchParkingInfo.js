import { useState, useEffect } from 'react';
import { fetchParkingInfo } from '../httpRequests';

export function useFetchParkingInfo(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    fetchParkingInfo(userId)
      .then(res => setData(res))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [userId]);

  return { data, loading, error };
}