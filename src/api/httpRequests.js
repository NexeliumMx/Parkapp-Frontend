/**
 * FileName: src/api/httpRequests.js
 * Author(s): Andres Gomez
 * Brief: Provides the API request functions for the application.
 * Date: 2025-07-02
 *
 * Copyright (c) 2025 BY: Nexelium Technological Solutions S.A. de C.V.
 * All rights reserved.
 */

// Fetch level info by user access
export async function fetchParkingLevels(user_id) {
  let url = `http://localhost:7071/api/getGeneralInfo?user_id=${user_id}`;
  console.log(`[API CALL] fetchParkingLevels: ${url}`);
  const response = await fetch(url);
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch level info by user access');
  }

  return resData;
}

export async function fetchLevelsByUser(user_id) {
  let url = `http://localhost:7071/api/getLevelsByUser?user_id=${user_id}`;
  console.log(`[API CALL] fetchLevelsByUser: ${url}`);
  const response = await fetch(url);
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch levels by user');
  }

  return resData;
}
export async function fetchSensorsByLevel(parking_id, floor) {
  let url = `http://localhost:7071/api/getSensorsByLevel?parking_id=${parking_id}&floor=${floor}`;
  console.log(`[API CALL] fetchSensorsByLevel: ${url}`);
  const response = await fetch(url);
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch sensors by level');
  }

  return resData;
}
export async function fetchAvailableDates(userId, filters = {}) {
  const params = new URLSearchParams();
  params.append('user_id', userId);
  
  // Add filters if provided
  if (filters.parking_ids?.length) {
    params.append('parking_ids', filters.parking_ids.join(','));
  }
  if (filters.level_ids?.length) {
    params.append('level_ids', filters.level_ids.join(','));
  }
  if (filters.sensor_ids?.length) {
    params.append('sensor_ids', filters.sensor_ids.join(','));
  }

  const url = `http://localhost:7071/api/getAvailableDates?${params}`;
  console.log(`[API CALL] fetchAvailableDates: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Read the response as text first to check if it's empty
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      return { 
        available_dates: [], 
        grouped_by_year_month: {}, 
        total_dates: 0 
      };
    }

    // Parse the text as JSON
    try {
      const resData = JSON.parse(responseText);
      console.log('Available dates response:', resData);
      return resData;
    } catch (jsonError) {
      console.error('JSON Parse Error:', jsonError);
      console.error('Response text:', responseText);
      throw new Error('Invalid JSON response from server');
    }

  } catch (error) {
    console.error('Error in fetchAvailableDates:', error);
    throw new Error(`Failed to fetch available dates: ${error.message}`);
  }
}

export async function fetchAnalysisData(userId, timeSetting, dateParams = {}, locationParams = {}, locationSetting = 'parking') {
  const params = new URLSearchParams();
  params.append('user_id', userId);
  params.append('timeSetting', timeSetting);
  params.append('locationSetting', locationSetting);

  // Add date parameters based on timeSetting
  if (dateParams.year) {
    params.append('year', dateParams.year);
  }
  if (dateParams.month && (timeSetting === 'month' || timeSetting === 'day')) {
    params.append('month', dateParams.month);
  }
  if (dateParams.day && timeSetting === 'day') {
    params.append('day', dateParams.day);
  }

  // Add location parameters based on locationSetting
  if (locationSetting === 'parking' && locationParams.parking_ids?.length) {
    params.append('parking_id', locationParams.parking_ids.join(','));
  }
  if (locationSetting === 'floor') {
    if (locationParams.parking_ids?.length) {
      params.append('parking_id', locationParams.parking_ids.join(','));
    }
    if (locationParams.level_ids?.length) {
      params.append('floor', locationParams.level_ids.join(','));
    }
  }
  if (locationSetting === 'sensor') {
    if (locationParams.parking_ids?.length) {
      params.append('parking_id', locationParams.parking_ids.join(','));
    }
    if (locationParams.level_ids?.length) {
      params.append('floor', locationParams.level_ids.join(','));
    }
    if (locationParams.sensor_ids?.length) {
      params.append('sensor', locationParams.sensor_ids.join(','));
    }
  }

  const url = `http://localhost:7071/api/getAnalysis?${params}`;
  console.log(`[API CALL] fetchAnalysisData: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const resData = await response.json();
    return resData;

  } catch (error) {
    console.error('Error in fetchAnalysisData:', error);
    throw new Error(`Failed to fetch analysis data: ${error.message}`);
  }
}

export async function fetchLevelImage(parking_id, floor) {
  const params = new URLSearchParams();
  if (parking_id) params.append('parking_id', parking_id);
  if (floor) params.append('floor', floor);

  const url = `https://mapbuilder-bindings.azurewebsites.net/api/get_blob_image?${params}`;
  console.log(`[API CALL] fetchLevelImage: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('Blob size:', blob.size);
    const imageUrl = URL.createObjectURL(blob);

    return { url: imageUrl, blob }; // Return an object with the image URL

  } catch (error) {
    console.error('Error in fetchLevelImage:', error);
    throw new Error(`Failed to fetch level image: ${error.message}`);
  }
}