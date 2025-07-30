import { useState, useEffect } from 'react';
import { fetchStatsByDateBucketFlexible } from '../httpRequests';

/**
 * Custom hook to fetch stats by date bucket with flexible date ranges.
 * @param {Object} params - Parameters for the API call.
 * @returns {Object} { data, loading, error, refetch }
 */
export function useStatsByDateBucketFlexible(params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStatsByDateBucketFlexible(overrideParams || params);
      setData(result);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params && params.parking_id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
}