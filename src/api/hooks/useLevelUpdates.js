import { useEffect } from 'react';

const useLevelUpdates = (setData) => {
  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    console.log('setData function type:', typeof setData);
    
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      console.log('Socket ready state:', socket.readyState);
      console.log('Socket URL:', socket.url);
      console.log('Socket protocol:', socket.protocol);
    };

    socket.onmessage = (event) => {
      console.log('--- WebSocket Message Received ---');
      console.log('Raw event data:', event.data);
      
      try {
        const payload = JSON.parse(event.data);
        console.log('Parsed payload:', payload);
        console.log('Payload type:', typeof payload);
        console.log('Current state:', payload.current_state, typeof payload.current_state);

        // Check if setData is actually a function
        if (typeof setData !== 'function') {
          console.error('setData is not a function:', typeof setData);
          return;
        }

        setData(prevData => {
          console.log('Previous data:', prevData);
          
          if (!prevData || !Array.isArray(prevData)) {
            console.log('No data or data is not an array');
            return prevData;
          }

          const updatedData = prevData.map(row => {
            if (row.parking_id === payload.parking_id && row.floor === payload.floor) {
              console.log('Found matching row:', row);
              const currentOccupied = Number(row.occupied);
              let newOccupied;

              // Fixed: Use current_state instead of current_status
              if (payload.current_state === true) {
                newOccupied = currentOccupied + 1;
                console.log('Adding 1 to occupied count');
              } else if (payload.current_state === false) {
                newOccupied = Math.max(0, currentOccupied - 1);
                console.log('Subtracting 1 from occupied count');
              } else {
                newOccupied = currentOccupied;
                console.log('No change in occupied count');
              }

              console.log(`Updated ${row.parking_alias} - ${row.floor_alias}: ${currentOccupied} -> ${newOccupied}`);

              return {
                ...row,
                occupied: newOccupied
              };
            }
            return row;
          });

          console.log('Updated data:', updatedData);
          return updatedData;
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        console.log('Raw data that failed to parse:', event.data);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error occurred');
      console.log('Error details:', {
        readyState: socket.readyState,
        url: socket.url,
        timestamp: new Date().toISOString()
      });
    };

    socket.onclose = (event) => {
      console.log('--- WebSocket Connection Closed ---');
      console.log('Close details:', {
        wasClean: event.wasClean,
        code: event.code,
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
      
      if (event.code === 1006) {
        console.error('Abnormal closure - server may not be running or may not support WebSocket');
      }
    };

    console.log('WebSocket created, initial ready state:', socket.readyState);
    
    const connectionTimeout = setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket failed to connect within 5 seconds');
        console.log('Current ready state:', socket.readyState);
        console.log('Make sure your WebSocket server is running on ws://localhost:8080');
      }
    }, 5000);

    return () => {
      clearTimeout(connectionTimeout);
      console.log('Cleaning up WebSocket connection...');
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Component unmounting');
      }
      console.log('WebSocket connection closed');
    };
  }, [setData]);
};

export default useLevelUpdates;