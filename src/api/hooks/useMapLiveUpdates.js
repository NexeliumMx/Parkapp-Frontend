import { useEffect, useRef } from 'react';

const useMapLiveUpdates = (setMapInfo) => {
  // Track last processed state per sensor_id
  const lastSensorStates = useRef({});

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('[MapLiveUpdates] WebSocket connection established');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { sensor_id, current_state } = payload;
        if (!sensor_id) return;

        // Only skip if the immediately previous message was the same
        if (
          Object.prototype.hasOwnProperty.call(lastSensorStates.current, sensor_id) &&
          lastSensorStates.current[sensor_id] === current_state
        ) {
          // Ignore consecutive identical state
          return;
        }

        // Update the last state for this sensor
        lastSensorStates.current[sensor_id] = current_state;

        // Update the sensor state in mapInfo
        if (typeof setMapInfo === 'function') {
          setMapInfo(prevMapInfo => {
            if (!Array.isArray(prevMapInfo)) return prevMapInfo;
            return prevMapInfo.map(sensor =>
              sensor.sensor_id === sensor_id
                ? { ...sensor, current_state }
                : sensor
            );
          });
        }
      } catch (error) {
        console.error('[MapLiveUpdates] Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('[MapLiveUpdates] WebSocket error:', error);
    };

    socket.onclose = (event) => {
      console.log('[MapLiveUpdates] WebSocket closed:', event.code, event.reason);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Component unmounting');
      }
      lastSensorStates.current = {};
    };
  }, [setMapInfo]);
};

export default useMapLiveUpdates;