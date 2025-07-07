import { useEffect, useRef } from 'react';

const useLevelUpdates = (setData) => {
  const processedMessages = useRef(new Set());

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
        
        // Create a message key using parking_id, floor, and current_state
        const messageKey = `${payload.parking_id}-${payload.floor}-${payload.current_state}`;
        
        // Check if we've already processed this exact message recently
        if (processedMessages.current.has(messageKey)) {
          console.log('Duplicate message detected, skipping:', messageKey);
          return;
        }
        
        // Add to processed messages
        processedMessages.current.add(messageKey);
        
        // Clean up old messages (keep only last 50 to prevent memory issues)
        if (processedMessages.current.size > 50) {
          const messages = Array.from(processedMessages.current);
          processedMessages.current = new Set(messages.slice(-25));
        }

        console.log('Payload type:', typeof payload);
        console.log('Current state:', payload.current_state, typeof payload.current_state);
        console.log('Parking ID:', payload.parking_id);
        console.log('Floor:', payload.floor);

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

          let foundMatch = false;
          const updatedData = prevData.map(row => {
            console.log('Checking row:', {
              rowParkingId: row.parking_id,
              payloadParkingId: payload.parking_id,
              rowFloor: row.floor,
              payloadFloor: payload.floor,
              parkingMatch: row.parking_id === payload.parking_id,
              floorMatch: row.floor === payload.floor
            });

            // Match by parking_id AND floor (since your data has these fields)
            if (row.parking_id === payload.parking_id && row.floor === payload.floor) {
              foundMatch = true;
              console.log('Found matching row:', row);
              const currentOccupied = Number(row.occupied);
              let newOccupied;

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

          if (!foundMatch) {
            console.log('No matching row found for:', {
              parking_id: payload.parking_id,
              floor: payload.floor
            });
            console.log('Available parking_ids and floors:', prevData.map(row => ({
              parking_id: row.parking_id,
              floor: row.floor,
              parking_alias: row.parking_alias,
              floor_alias: row.floor_alias
            })));
          }

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
      processedMessages.current.clear();
    };
  }, [setData]);
};

export default useLevelUpdates;