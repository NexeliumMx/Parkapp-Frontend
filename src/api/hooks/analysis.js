import { useState, useEffect } from 'react';
import { fetchAnalysisData } from '../httpRequests';

/**
 * Custom hook for time-based analysis data with location filtering
 * @param {string} userId - User ID
 * @param {string} timeSetting - Time setting: 'year', 'month', or 'day'
 * @param {object} dateFilter - Date filter object { year, month, day }
 * @param {object} locationFilter - Location filter object
 * @param {string} locationSetting - Location setting: 'parking', 'floor', or 'sensor'
 */
export function useAnalysisData(userId, timeSetting, dateFilter = {}, locationFilter = {}, locationSetting = 'parking') {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare date parameters based on timeSetting
        const dateParams = prepareDateParams(timeSetting, dateFilter);
        
        // Prepare location parameters based on locationSetting
        const locationParams = prepareLocationParams(locationSetting, locationFilter);
        
        // Validate that required date filters are provided
        if (!hasRequiredDateFilters(timeSetting, dateParams)) {
          console.log(`[Analysis Hook] Skipping API call - required ${timeSetting} date filters not selected`);
          setData([]);
          setStatistics(null);
          setIsLoading(false);
          return;
        }
        
        // Validate that required location filters are provided
        if (!hasRequiredLocationFilters(locationSetting, locationParams)) {
          console.log(`[Analysis Hook] Skipping API call - required ${locationSetting} location filters not selected`);
          setData([]);
          setStatistics(null);
          setIsLoading(false);
          return;
        }
        
        console.log(`[Analysis Hook] Making API call with filters:`, {
          locationSetting,
          locationParams,
          dateParams,
          timeSetting
        });
        
        const result = await fetchAnalysisData(userId, timeSetting, dateParams, locationParams, locationSetting);
        
        if (result.success) {
          // Use location_analysis array from new API format
          const processedData = processApiResponse(result.location_analysis || [], timeSetting, locationSetting);
          setData(processedData);
          setStatistics(result.overall_statistics);
          
          console.log(`[Analysis Hook] Processed ${processedData.length} data points from ${result.location_analysis?.length || 0} API records`);
        } else {
          throw new Error(result.message || 'API returned success: false');
        }
        
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError(err.message);
        setData([]);
        setStatistics(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data if we have all required parameters
    if (userId && timeSetting) {
      const dateParams = prepareDateParams(timeSetting, dateFilter);
      const locationParams = prepareLocationParams(locationSetting, locationFilter);
      
      if (hasRequiredDateFilters(timeSetting, dateParams) && 
          hasRequiredLocationFilters(locationSetting, locationParams)) {
        loadAnalysisData();
      } else {
        // Clear data when filters are not sufficient
        setData([]);
        setStatistics(null);
        setError(null);
        setIsLoading(false);
      }
    } else {
      setData([]);
      setStatistics(null);
      setError(null);
      setIsLoading(false);
    }
  }, [userId, timeSetting, JSON.stringify(dateFilter), JSON.stringify(locationFilter), locationSetting]);

  return { data, isLoading, error, statistics };
}

/**
 * Check if required date filters are provided
 * @param {string} timeSetting - Time setting
 * @param {object} dateParams - Date parameters
 * @returns {boolean} Whether required date filters are present
 */
function hasRequiredDateFilters(timeSetting, dateParams) {
  switch (timeSetting) {
    case 'year':
      // For year analysis, year is required
      return dateParams.year && dateParams.year !== '';
    case 'month':
      // For month analysis, year and month are required
      return dateParams.year && dateParams.year !== '' &&
             dateParams.month && dateParams.month !== '';
    case 'day':
      // For day analysis, year, month, and day are required
      return dateParams.year && dateParams.year !== '' &&
             dateParams.month && dateParams.month !== '' &&
             dateParams.day && dateParams.day !== '';
    default:
      return false;
  }
}

/**
 * Check if required location filters are provided
 * @param {string} locationSetting - Location setting
 * @param {object} locationParams - Location parameters
 * @returns {boolean} Whether required filters are present
 */
function hasRequiredLocationFilters(locationSetting, locationParams) {
  switch (locationSetting) {
    case 'parking':
      // Require at least one parking selected
      return locationParams.parking_ids && locationParams.parking_ids.length > 0;
    case 'floor':
      // Require both parking and floor selected
      return (locationParams.parking_ids && locationParams.parking_ids.length > 0) &&
             (locationParams.level_ids && locationParams.level_ids.length > 0);
    case 'sensor':
      // Require parking, floor, and sensor selected
      return (locationParams.parking_ids && locationParams.parking_ids.length > 0) &&
             (locationParams.level_ids && locationParams.level_ids.length > 0) &&
             (locationParams.sensor_ids && locationParams.sensor_ids.length > 0);
    default:
      return false;
  }
}

/**
 * Prepare date parameters based on timeSetting
 * @param {string} timeSetting - Time setting
 * @param {object} dateFilter - Date filter object
 * @returns {object} Prepared date parameters
 */
function prepareDateParams(timeSetting, dateFilter) {
  const params = {};
  
  switch (timeSetting) {
    case 'year':
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      break;
    case 'month':
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      if (dateFilter.month) {
        params.month = dateFilter.month;
      }
      break;
    case 'day':
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      if (dateFilter.month) {
        params.month = dateFilter.month;
      }
      if (dateFilter.day) {
        params.day = dateFilter.day;
      }
      break;
  }
  
  return params;
}

/**
 * Prepare location parameters based on locationSetting
 * @param {string} locationSetting - Location setting
 * @param {object} locationFilter - Location filter object
 * @returns {object} Prepared location parameters
 */
function prepareLocationParams(locationSetting, locationFilter) {
  const params = {};
  
  switch (locationSetting) {
    case 'parking':
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      break;
    case 'floor':
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      if (locationFilter.level_ids?.length) {
        params.level_ids = locationFilter.level_ids;
      }
      break;
    case 'sensor':
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      if (locationFilter.level_ids?.length) {
        params.level_ids = locationFilter.level_ids;
      }
      if (locationFilter.sensor_ids?.length) {
        params.sensor_ids = locationFilter.sensor_ids;
      }
      break;
  }
  
  return params;
}

/**
 * Process API response to match frontend expectations - UPDATED for new API format
 * @param {Array} apiData - Data from API response (location_analysis array)
 * @param {string} timeSetting - Time setting
 * @param {string} locationSetting - Location setting
 * @returns {Array} Processed data
 */
function processApiResponse(apiData, timeSetting, locationSetting) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map(item => ({
    x: item.time_period,
    label: getTimeLabel(item.time_period, timeSetting),
    occupancy: item.metrics.occupancy_percentage,
    availability: item.metrics.availability_percentage,
    frequency: item.metrics.activity_rate || 0,
    locationKey: getLocationKeyFromNewFormat(item.location, locationSetting),
    locationName: getLocationNameFromNewFormat(item.location, locationSetting),
    locationLevel: locationSetting,
    measurements: {
      total: item.metrics.total_measurements,
      occupied: Math.round(item.metrics.total_measurements * item.metrics.occupancy_percentage / 100),
      available: Math.round(item.metrics.total_measurements * item.metrics.availability_percentage / 100)
    },
    unique_sensors: item.metrics.unique_sensors,
    period_start: item.metrics.period_start,
    period_end: item.metrics.period_end,
    state_changes: item.metrics.state_changes,
    occupied_hours: item.metrics.occupied_hours,
    available_hours: item.metrics.available_hours
  }));
}

/**
 * Get location key from new API format
 * @param {object} location - Location object from new API
 * @param {string} locationSetting - Location setting
 * @returns {string} Location key
 */
function getLocationKeyFromNewFormat(location, locationSetting) {
  switch (locationSetting) {
    case 'parking':
      return location.parking_id;
    case 'floor':
      return `${location.parking_id}_${location.floor}`;
    case 'sensor':
      return `${location.parking_id}_${location.floor}_${location.sensor_id}`;
    default:
      return location.parking_id;
  }
}

/**
 * Get location name from new API format
 * @param {object} location - Location object from new API
 * @param {string} locationSetting - Location setting
 * @returns {string} Location name
 */
function getLocationNameFromNewFormat(location, locationSetting) {
  switch (locationSetting) {
    case 'parking':
      return location.parking_name || location.display_name || `Parking ${location.parking_id}`;
    case 'floor':
      return `${location.parking_name || 'Parking'} - ${location.floor_name || `Piso ${location.floor}`}`;
    case 'sensor':
      return location.sensor_name || location.display_name || `Sensor ${location.sensor_id}`;
    default:
      return location.display_name || 'Unknown';
  }
}

/**
 * Get time label based on time setting and period
 * @param {number} timePeriod - Time period number
 * @param {string} timeSetting - Time setting
 * @returns {string} Time label
 */
function getTimeLabel(timePeriod, timeSetting) {
  switch (timeSetting) {
    case 'day':
      return `${timePeriod.toString().padStart(2, '0')}:00`;
    case 'month':
      return `Día ${timePeriod}`;
    case 'year':
      return new Date(2000, timePeriod - 1).toLocaleString('es', { month: 'long' });
    default:
      return timePeriod.toString();
  }
}

/**
 * Get location key for grouping
 * @param {object} locationInfo - Location info from API
 * @param {string} locationSetting - Location setting
 * @returns {string} Location key
 */
function getLocationKey(locationInfo, locationSetting) {
  switch (locationSetting) {
    case 'parking':
      return locationInfo.parking_id;
    case 'floor':
      return `${locationInfo.parking_id}_${locationInfo.floor}`;
    case 'sensor':
      return `${locationInfo.parking_id}_${locationInfo.floor}_${locationInfo.sensor_id}`;
    default:
      return locationInfo.parking_id;
  }
}

/**
 * Get location name for display
 * @param {object} locationInfo - Location info from API
 * @param {string} locationSetting - Location setting
 * @returns {string} Location name
 */
function getLocationName(locationInfo, locationSetting) {
  switch (locationSetting) {
    case 'parking':
      return locationInfo.parking_alias || `Parking ${locationInfo.parking_id}`;
    case 'floor':
      return `${locationInfo.parking_alias || 'Parking'} - ${locationInfo.floor_alias || `Piso ${locationInfo.floor}`}`;
    case 'sensor':
      return locationInfo.sensor_alias || `Sensor ${locationInfo.sensor_id}`;
    default:
      return 'Unknown';
  }
}

/**
 * Get time period label based on time setting
 * @param {string} timeSetting - Time setting
 * @returns {string} Period label
 */
export function getTimePeriodLabel(timeSetting) {
  switch (timeSetting) {
    case 'year':
      return 'Mes';
    case 'month':
      return 'Día';
    case 'day':
      return 'Hora';
    default:
      return 'Período';
  }
}

/**
 * Transform analysis data for chart display - UPDATED to create separate lines
 * @param {Array} analysisData - Processed analysis data
 * @param {string} metricType - 'frequency', 'availability', or 'occupancy'
 * @returns {Array} Transformed data for charts
 */
export function transformAnalysisDataForChart(analysisData, metricType = 'occupancy') {
  if (!analysisData || analysisData.length === 0) return [];

  // Group by time period, keeping separate data for each location
  const timeGroups = {};
  
  analysisData.forEach(dataPoint => {
    const timeKey = dataPoint.x.toString();
    
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = {
        x: dataPoint.x,
        label: dataPoint.label
      };
    }
    
    // Create a unique key for each location
    const locationKey = sanitizeDataKey(dataPoint.locationName || dataPoint.locationKey);
    timeGroups[timeKey][`${metricType}_${locationKey}`] = dataPoint[metricType] || 0;
  });

  return Object.values(timeGroups).sort((a, b) => a.x - b.x);
}

/**
 * Generate chart series configuration for analysis data - UPDATED for multiple lines
 * @param {Array} analysisData - Analysis data
 * @param {string} metricType - 'frequency', 'availability', or 'occupancy'
 * @returns {Array} Chart series configuration
 */
export function generateAnalysisChartSeries(analysisData, metricType = 'occupancy') {
  if (!analysisData || analysisData.length === 0) return [];

  // Get unique locations - each will be a separate line
  const uniqueLocations = [...new Set(analysisData.map(d => d.locationName || d.locationKey))];
  const colors = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#f57c00', '#00695c', '#795548', '#607d8b'];

  return uniqueLocations.map((location, index) => {
    const sanitizedLocation = sanitizeDataKey(location);
    return {
      dataKey: `${metricType}_${sanitizedLocation}`,
      label: location, // Use the actual location name as label
      color: colors[index % colors.length]
    };
  });
}

/**
 * Sanitize data key for chart compatibility
 * @param {string} key - Key to sanitize
 * @returns {string} Sanitized key
 */
function sanitizeDataKey(key) {
  if (!key) return 'unknown';
  // Replace spaces and special characters with underscores
  return key.toString().replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Get metric label in Spanish
 * @param {string} metricType - Metric type
 * @returns {string} Metric label
 */
function getMetricLabel(metricType) {
  switch (metricType) {
    case 'frequency':
      return 'Actividad';
    case 'availability':
      return 'Disponibilidad';
    case 'occupancy':
      return 'Ocupación';
    default:
      return 'Métrica';
  }
}

/**
 * Get location setting from filter type
 * @param {string} filterType - Filter type from component
 * @returns {string} Location setting
 */
export function getLocationSetting(filterType) {
  switch (filterType) {
    case 'torre':
      return 'parking';
    case 'nivel':
      return 'floor';
    case 'sensor':
      return 'sensor';
    default:
      return 'parking';
  }
}

/**
 * Get time setting from period
 * @param {string} period - Period from component
 * @returns {string} Time setting
 */
export function getTimeSetting(period) {
  switch (period) {
    case 'anual':
      return 'year';
    case 'mensual':
      return 'month';
    case 'diario':
      return 'day';
    default:
      return 'day';
  }
}

/**
 * Calculate summary statistics for analysis data - UPDATED for new API format
 * @param {Array} data - Analysis data
 * @param {object} apiStatistics - Statistics from API
 * @returns {object} Summary statistics
 */
export function calculateSummaryStatistics(data, apiStatistics) {
  if (!data || data.length === 0 || !apiStatistics) {
    return {
      avgOccupancy: 0,
      avgAvailability: 0,
      avgActivity: 0,
      totalMeasurements: 0,
      uniqueSensors: 0,
      uniqueLocations: 0,
      executionTime: 0
    };
  }

  return {
    avgOccupancy: apiStatistics.average_occupancy_percentage || 0,
    avgAvailability: apiStatistics.average_availability_percentage || 0,
    avgActivity: data.reduce((sum, d) => sum + (d.frequency || 0), 0) / data.length,
    totalMeasurements: apiStatistics.total_measurements || 0,
    uniqueSensors: apiStatistics.total_unique_sensors || 0,
    uniqueLocations: apiStatistics.total_locations_analyzed || 0,
    executionTime: apiStatistics.query_execution_time_ms || 0
  };
}

/**
 * Get validation message for missing filters
 * @param {string} locationSetting - Location setting
 * @param {object} locationParams - Location parameters
 * @param {string} timeSetting - Time setting
 * @param {object} dateParams - Date parameters
 * @returns {string} Validation message
 */
export function getFilterValidationMessage(locationSetting, locationParams, timeSetting, dateParams) {
  // Check date filters first
  if (!hasRequiredDateFilters(timeSetting, dateParams)) {
    switch (timeSetting) {
      case 'year':
        return 'Seleccione un año para ver los datos';
      case 'month':
        if (!dateParams.year || dateParams.year === '') {
          return 'Seleccione un año para ver los datos mensuales';
        }
        if (!dateParams.month || dateParams.month === '') {
          return 'Seleccione un mes para ver los datos';
        }
        break;
      case 'day':
        if (!dateParams.year || dateParams.year === '') {
          return 'Seleccione un año para ver los datos diarios';
        }
        if (!dateParams.month || dateParams.month === '') {
          return 'Seleccione un mes para ver los datos diarios';
        }
        if (!dateParams.day || dateParams.day === '') {
          return 'Seleccione un día para ver los datos';
        }
        break;
    }
  }

  // Check location filters
  switch (locationSetting) {
    case 'parking':
      if (!locationParams.parking_ids || locationParams.parking_ids.length === 0) {
        return 'Seleccione al menos una torre para ver los datos';
      }
      break;
    case 'floor':
      if (!locationParams.parking_ids || locationParams.parking_ids.length === 0) {
        return 'Seleccione una torre para ver los datos de nivel';
      }
      if (!locationParams.level_ids || locationParams.level_ids.length === 0) {
        return 'Seleccione al menos un nivel para ver los datos';
      }
      break;
    case 'sensor':
      if (!locationParams.parking_ids || locationParams.parking_ids.length === 0) {
        return 'Seleccione una torre para ver los datos de sensor';
      }
      if (!locationParams.level_ids || locationParams.level_ids.length === 0) {
        return 'Seleccione un nivel para ver los datos de sensor';
      }
      if (!locationParams.sensor_ids || locationParams.sensor_ids.length === 0) {
        return 'Seleccione al menos un sensor para ver los datos';
      }
      break;
  }
  return 'Seleccione los filtros apropiados para ver los datos';
}

/**
 * Check if filters are valid for the current location and time settings
 * @param {string} locationSetting - Location setting
 * @param {object} locationFilter - Location filter object
 * @param {string} timeSetting - Time setting
 * @param {object} dateFilter - Date filter object
 * @returns {boolean} Whether filters are valid
 */
export function areFiltersValid(locationSetting, locationFilter, timeSetting, dateFilter) {
  const locationParams = prepareLocationParams(locationSetting, locationFilter);
  const dateParams = prepareDateParams(timeSetting, dateFilter);
  
  return hasRequiredDateFilters(timeSetting, dateParams) && 
         hasRequiredLocationFilters(locationSetting, locationParams);
}