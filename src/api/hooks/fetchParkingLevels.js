import { useQuery } from '@tanstack/react-query';
import { fetchParkingLevels } from '../httpRequests';

/**
 * Custom hook to fetch parking levels for a user.
 * @param {string} user_id
 * @param {object} options
 */
export function useFetchParkingLevels(user_id, options = {}) {
  return useQuery({
    queryKey: ['parkingLevels', user_id],
    queryFn: () => fetchParkingLevels(user_id),
    enabled: !!user_id && (options.enabled === undefined ? true : options.enabled),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}
