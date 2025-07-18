import { useState, useEffect } from 'react';
import { fetchLevelImage } from '../httpRequests';

export function useLevelImage(parking_id, floor) {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    if (!parking_id || !floor) {
      setImageData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchLevelImage(parking_id, floor)
      .then(data => {
        setImageData(data);
        objectUrl = data.url;
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error fetching image');
        setImageData(null);
        setLoading(false);
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [parking_id, floor]);

  return { imageData, loading, error };
}