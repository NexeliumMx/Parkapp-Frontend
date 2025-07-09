import { useState, useEffect } from 'react';
import { fetchSensorsByLevel } from '../httpRequests';

/**
 * Custom hook to fetch sensors by level.
 * @param {string} parking_id
 * @param {string} floor
 * @param {object} options
 */
export function useFetchSensorsByLevel(parking_id, floor, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchSensorsByLevel(parking_id, floor);
        setData(result);
      } catch (err) {
        console.error('Error fetching sensors by level:', err);
        setError(err.message);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (parking_id && parking_id.trim() && floor !== null && floor !== undefined) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [parking_id, floor]);

  return { data, isLoading, error, setData };
}
