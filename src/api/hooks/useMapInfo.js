import { useState, useEffect } from "react";
import { fetchKonvaInfo, fetchMapInfo } from "../httpRequests";


export function useMapInfo(user_id, parking_id, floor) {
  const [konvaInfo, setKonvaInfo] = useState(null);
  const [mapInfo, setMapInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user_id || !parking_id || floor === undefined || floor === null) {
      setKonvaInfo(null);
      setMapInfo(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchKonvaInfo(user_id, parking_id, floor),
      fetchMapInfo(user_id, parking_id, floor)
    ])
      .then(([konva, map]) => {
        if (!cancelled) {
          setKonvaInfo(konva);
          setMapInfo(map);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || "Error fetching map data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user_id, parking_id, floor]);

  return { konvaInfo, mapInfo, loading, error };
}