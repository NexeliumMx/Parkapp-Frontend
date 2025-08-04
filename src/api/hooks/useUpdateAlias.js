import { useState } from 'react';
import { updateAlias } from '../httpRequests';

/**
 * Custom hook to update alias for parking, complex, or floor.
 * @returns {{
 *   update: (params: { user_id: string, field: string, new_value: string, parking_id: string, floor?: number }) => Promise<any>,
 *   loading: boolean,
 *   error: any,
 *   data: any,
 *   reset: () => void
 * }}
 */
export function useUpdateAlias() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const update = async (params) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await updateAlias(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return { update, loading, error, data, reset };
}