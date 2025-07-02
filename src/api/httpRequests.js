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
  let url = `http://localhost:7071/api/fetchGeneralInfo?user_id=${user_id}`;
  console.log(`[API CALL] fetchParkingLevels: ${url}`);
  const response = await fetch(url);
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch level info by user access');
  }

  return resData;
}
