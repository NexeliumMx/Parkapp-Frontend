import { useState, useEffect } from 'react';
import { fetchParkingLevels } from '../httpRequests';

/**
 * Custom hook to fetch parking levels for a user.
 * @param {string} user_id
 * @param {object} options
 */
export function useFetchParkingLevels(user_id, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchParkingLevels(user_id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) {
      loadData();
    }
  }, [user_id]);

  // Make sure to return setData function
  return { data, isLoading, error, setData };
}
