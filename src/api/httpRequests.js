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
  console.log(`[API CALL] fetchLevelImage: ${params}`);
  const url = `https://mapbuilder-bindings.azurewebsites.net/api/get_blob_image?${params}`;
  console.log(`[API CALL] fetchLevelImage: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

   const imageUrl = await response.text();
    
    console.log('Image URL:', imageUrl);
    return { url: imageUrl}; // Return an object with the image URL

  } catch (error) {
    console.error('Error in fetchLevelImage:', error);
    throw new Error(`Failed to fetch level image: ${error.message}`);
  }
}
export async function fetchStatsByDateBucketFlexible(params) {
  const query = new URLSearchParams();

  // Required
  query.append('parking_id', params.parking_id);

  if (params.year) {
    if (params.year.range) {
      if (params.year.from) query.append('start_year', params.year.from);
      if (params.year.to) query.append('end_year', params.year.to);
      query.append('year_range', 'true');
    } else if (params.year.exact) {
      query.append('year', params.year.exact);
      query.append('year_range', 'false');
    }
  }

  if (params.month) {
    if (params.month.range) {
      if (params.month.from) query.append('start_month', params.month.from);
      if (params.month.to) query.append('end_month', params.month.to);
      query.append('month_range', 'true');
    } else if (params.month.exact) {
      query.append('month', params.month.exact);
      query.append('month_range', 'false');
    }
  }
  if (params.day) {
    if (params.day.range) {
      if (params.day.from) query.append('start_day', params.day.from);
      if (params.day.to) query.append('end_day', params.day.to);
      query.append('day_range', 'true');
    } else if (params.day.exact) {
      query.append('day', params.day.exact);
      query.append('day_range', 'false');
    }
  }

  if (params.hour) {
    if (params.hour.range) {
      if (params.hour.from) query.append('start_hour', params.hour.from);
      if (params.hour.to) query.append('end_hour', params.hour.to);
      query.append('hour_range', 'true');
    } else if (params.hour.exact) {
      query.append('hour', params.hour.exact);
      query.append('hour_range', 'false');
    }
  }

  const url = `http://localhost:7071/api/getStatsByDateBucket?${query.toString()}`;
  console.log(`[API CALL] fetchStatsByDateBucketFlexible: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchStatsByDateBucketFlexible:', error);
    throw new Error(`Failed to fetch stats by date bucket: ${error.message}`);
  }
}

export async function fetchPernocte(userId) {
  if (!userId) {
    throw new Error('Missing required parameter: userId');
  }

  const params = new URLSearchParams({ user_id: userId });
  const url = `http://localhost:7071/api/pernocte?${params.toString()}`;
  console.log(`[API CALL] fetchPernocte: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Try to parse error message from server
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchPernocte:', error);
    throw new Error(`Failed to fetch pernocte data: ${error.message}`);
  }
}