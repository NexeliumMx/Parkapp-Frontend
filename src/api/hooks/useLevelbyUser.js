import { useState, useEffect } from 'react';
import { fetchLevelsByUser } from '../httpRequests'; // Changed from fetchLevelsbyUser to fetchLevelsByUser

/**
 * Custom hook to fetch parking levels for a user.
 * @param {string} user_id
 * @param {object} options
 */
export function useFetchLevelsbyUser(user_id, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchLevelsByUser(user_id); // Changed from fetchLevelsbyUser to fetchLevelsByUser
        setData(result);
      } catch (err) {
        console.error('Error fetching levels by user:', err);
        setError(err.message);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id && user_id.trim()) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user_id]);

  return { data, isLoading, error, setData };
}
