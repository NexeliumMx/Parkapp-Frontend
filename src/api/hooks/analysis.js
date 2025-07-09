import { useState, useEffect } from 'react';
import { fetchAnalysisData } from '../httpRequests';

/**
 * Custom hook for time-based analysis data with location filtering
 * @param {string} userId - User ID
 * @param {string} interval - Time interval: 'year', 'month', or 'day'
 * @param {object} dateFilter - Date filter object { year, month, day }
 * @param {object} locationFilter - Location filter object
 * @param {string} locationLevel - Location level: 'parking', 'floor', or 'sensor'
 */
export function useAnalysisData(userId, interval, dateFilter = {}, locationFilter = {}, locationLevel = 'parking') {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare date parameters based on interval
        const dateParams = prepareDateParams(interval, dateFilter);
        
        // Prepare location parameters based on location level
        const locationParams = prepareLocationParams(locationLevel, locationFilter);
        
        const result = await fetchAnalysisData(userId, interval, dateParams, locationParams, locationLevel);
        const processedData = processAnalysisData(result, interval, locationLevel);
        setData(processedData);
        
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError(err.message);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && interval) {
      loadAnalysisData();
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [userId, interval, JSON.stringify(dateFilter), JSON.stringify(locationFilter), locationLevel]);

  return { data, isLoading, error };
}

/**
 * Prepare date parameters based on interval
 * @param {string} interval - Time interval
 * @param {object} dateFilter - Date filter object
 * @returns {object} Prepared date parameters
 */
function prepareDateParams(interval, dateFilter) {
  const params = {};
  
  switch (interval) {
    case 'year':
      // For year interval, only send year
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      break;
    case 'month':
      // For month interval, send year and month
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      if (dateFilter.month) {
        params.month = dateFilter.month;
      }
      break;
    case 'day':
      // For day interval, send year, month, and day
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
 * Prepare location parameters based on location level
 * @param {string} locationLevel - Location level
 * @param {object} locationFilter - Location filter object
 * @returns {object} Prepared location parameters
 */
function prepareLocationParams(locationLevel, locationFilter) {
  const params = {};
  
  switch (locationLevel) {
    case 'parking':
      // For parking level, only send parking_id
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      break;
    case 'floor':
      // For floor level, send parking_id and floor
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      if (locationFilter.level_ids?.length) {
        params.level_ids = locationFilter.level_ids;
      }
      break;
    case 'sensor':
      // For sensor level, send parking_id, floor, and sensor_id
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
 * Process raw analysis data based on interval type and location level
 * @param {Array} rawData - Raw data from API
 * @param {string} interval - Time interval: 'year', 'month', or 'day'
 * @param {string} locationLevel - Location level: 'parking', 'floor', or 'sensor'
 * @returns {Array} Processed data with averages
 */
function processAnalysisData(rawData, interval, locationLevel) {
  if (!rawData || !Array.isArray(rawData)) return [];

  // Group data by location first, then by time
  const groupedByLocation = groupDataByLocation(rawData, locationLevel);
  
  const processedData = [];
  
  Object.entries(groupedByLocation).forEach(([locationKey, locationData]) => {
    let timeBasedData;
    
    switch (interval) {
      case 'year':
        timeBasedData = calculateYearlyAverages(locationData);
        break;
      case 'month':
        timeBasedData = calculateMonthlyAverages(locationData);
        break;
      case 'day':
        timeBasedData = calculateDailyAverages(locationData);
        break;
      default:
        timeBasedData = [];
    }
    
    // Add location information to each time data point
    timeBasedData.forEach(timePoint => {
      processedData.push({
        ...timePoint,
        locationKey,
        locationName: getLocationName(locationData[0], locationLevel),
        locationLevel
      });
    });
  });

  return processedData;
}

/**
 * Group data by location level (parking, floor, or sensor)
 * @param {Array} data - Raw data array
 * @param {string} locationLevel - Location level
 * @returns {object} Grouped data by location
 */
function groupDataByLocation(data, locationLevel) {
  const grouped = {};
  
  data.forEach(record => {
    let locationKey;
    
    switch (locationLevel) {
      case 'parking':
        locationKey = record.parking_id;
        break;
      case 'floor':
        locationKey = `${record.parking_id}_${record.floor}`;
        break;
      case 'sensor':
        locationKey = `${record.parking_id}_${record.floor}_${record.sensor_id}`;
        break;
      default:
        locationKey = record.parking_id;
    }
    
    if (!grouped[locationKey]) {
      grouped[locationKey] = [];
    }
    
    grouped[locationKey].push(record);
  });
  
  return grouped;
}

/**
 * Get location name based on location level
 * @param {object} record - Data record
 * @param {string} locationLevel - Location level
 * @returns {string} Location name
 */
function getLocationName(record, locationLevel) {
  if (!record) return 'Unknown';
  
  switch (locationLevel) {
    case 'parking':
      return record.parking_alias || record.parking_name || `Parking ${record.parking_id}`;
    case 'floor':
      return `${record.parking_alias || 'Parking'} - ${record.floor_alias || `Piso ${record.floor}`}`;
    case 'sensor':
      return record.sensor_alias || `Sensor ${record.row}-${record.column}` || `Sensor ${record.sensor_id}`;
    default:
      return 'Unknown';
  }
}

/**
 * Calculate average frequency and availability for each month in a year
 * @param {Array} data - Raw data array for a specific location
 * @returns {Array} Monthly averages
 */
function calculateYearlyAverages(data) {
  const monthlyData = {};
  
  data.forEach(record => {
    const date = new Date(record.timestamp);
    const month = date.getMonth() + 1;
    const monthKey = month.toString().padStart(2, '0');
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        x: month,
        label: new Date(2000, month - 1).toLocaleString('es', { month: 'long' }),
        frequency: [],
        availability: [],
        occupancy: []
      };
    }
    
    monthlyData[monthKey].frequency.push(record.frequency || 0);
    monthlyData[monthKey].availability.push(record.availability || 0);
    monthlyData[monthKey].occupancy.push(record.occupancy || 0);
  });

  return Object.values(monthlyData).map(month => ({
    x: month.x,
    label: month.label,
    frequency: calculateAverage(month.frequency),
    availability: calculateAverage(month.availability),
    occupancy: calculateAverage(month.occupancy),
    count: month.frequency.length
  })).sort((a, b) => a.x - b.x);
}

/**
 * Calculate average frequency and availability for each day in a month
 * @param {Array} data - Raw data array for a specific location
 * @returns {Array} Daily averages
 */
function calculateMonthlyAverages(data) {
  const dailyData = {};
  
  data.forEach(record => {
    const date = new Date(record.timestamp);
    const day = date.getDate();
    
    if (!dailyData[day]) {
      dailyData[day] = {
        x: day,
        label: `Día ${day}`,
        frequency: [],
        availability: [],
        occupancy: []
      };
    }
    
    dailyData[day].frequency.push(record.frequency || 0);
    dailyData[day].availability.push(record.availability || 0);
    dailyData[day].occupancy.push(record.occupancy || 0);
  });

  return Object.values(dailyData).map(day => ({
    x: day.x,
    label: day.label,
    frequency: calculateAverage(day.frequency),
    availability: calculateAverage(day.availability),
    occupancy: calculateAverage(day.occupancy),
    count: day.frequency.length
  })).sort((a, b) => a.x - b.x);
}

/**
 * Calculate average frequency and availability for each hour in a day
 * @param {Array} data - Raw data array for a specific location
 * @returns {Array} Hourly averages
 */
function calculateDailyAverages(data) {
  const hourlyData = {};
  
  data.forEach(record => {
    const date = new Date(record.timestamp);
    const hour = date.getHours();
    
    if (!hourlyData[hour]) {
      hourlyData[hour] = {
        x: hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        frequency: [],
        availability: [],
        occupancy: []
      };
    }
    
    hourlyData[hour].frequency.push(record.frequency || 0);
    hourlyData[hour].availability.push(record.availability || 0);
    hourlyData[hour].occupancy.push(record.occupancy || 0);
  });

  return Object.values(hourlyData).map(hour => ({
    x: hour.x,
    label: hour.label,
    frequency: calculateAverage(hour.frequency),
    availability: calculateAverage(hour.availability),
    occupancy: calculateAverage(hour.occupancy),
    count: hour.frequency.length
  })).sort((a, b) => a.x - b.x);
}

/**
 * Calculate average from array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Average value
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + (val || 0), 0);
  return Number((sum / numbers.length).toFixed(2));
}

/**
 * Get time period label based on interval
 * @param {string} interval - Time interval
 * @returns {string} Period label
 */
export function getTimePeriodLabel(interval) {
  switch (interval) {
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
 * Transform analysis data for chart display by location
 * @param {Array} analysisData - Processed analysis data
 * @param {string} metricType - 'frequency', 'availability', or 'occupancy'
 * @returns {Array} Transformed data for charts
 */
export function transformAnalysisDataForChart(analysisData, metricType = 'occupancy') {
  if (!analysisData || analysisData.length === 0) return [];

  // Group by time period
  const timeGroups = {};
  
  analysisData.forEach(dataPoint => {
    const timeKey = `${dataPoint.x}_${dataPoint.label}`;
    
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = {
        x: dataPoint.x,
        label: dataPoint.label
      };
    }
    
    // Add metric for each location
    const locationKey = dataPoint.locationName || dataPoint.locationKey;
    timeGroups[timeKey][`${metricType}_${locationKey}`] = dataPoint[metricType] || 0;
  });

  return Object.values(timeGroups).sort((a, b) => a.x - b.x);
}

/**
 * Generate chart series configuration for analysis data
 * @param {Array} analysisData - Analysis data
 * @param {string} metricType - 'frequency', 'availability', or 'occupancy'
 * @returns {Array} Chart series configuration
 */
export function generateAnalysisChartSeries(analysisData, metricType = 'occupancy') {
  if (!analysisData || analysisData.length === 0) return [];

  const uniqueLocations = [...new Set(analysisData.map(d => d.locationName || d.locationKey))];
  const colors = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#f57c00', '#00695c'];

  return uniqueLocations.map((location, index) => ({
    dataKey: `${metricType}_${location}`,
    label: `${getMetricLabel(metricType)} ${location}`,
    color: colors[index % colors.length]
  }));
}

/**
 * Get metric label in Spanish
 * @param {string} metricType - Metric type
 * @returns {string} Metric label
 */
function getMetricLabel(metricType) {
  switch (metricType) {
    case 'frequency':
      return 'Frecuencia';
    case 'availability':
      return 'Disponibilidad';
    case 'occupancy':
      return 'Ocupación';
    default:
      return 'Métrica';
  }
}

/**
 * Get location level from filter type
 * @param {string} filterType - Filter type from component
 * @returns {string} Location level
 */
export function getLocationLevel(filterType) {
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
 * Calculate summary statistics for analysis data
 * @param {Array} data - Analysis data
 * @param {string} locationLevel - Location level
 * @returns {object} Summary statistics
 */
export function calculateSummaryStatistics(data, locationLevel) {
  if (!data || data.length === 0) {
    return {
      avgFrequency: 0,
      avgAvailability: 0,
      avgOccupancy: 0,
      maxFrequency: 0,
      maxAvailability: 0,
      maxOccupancy: 0,
      minFrequency: 0,
      minAvailability: 0,
      minOccupancy: 0,
      totalRecords: 0,
      uniqueLocations: 0,
      locationLevel
    };
  }

  const frequencies = data.map(d => d.frequency || 0);
  const availabilities = data.map(d => d.availability || 0);
  const occupancies = data.map(d => d.occupancy || 0);
  const uniqueLocations = [...new Set(data.map(d => d.locationKey))];

  return {
    avgFrequency: calculateAverage(frequencies),
    avgAvailability: calculateAverage(availabilities),
    avgOccupancy: calculateAverage(occupancies),
    maxFrequency: Math.max(...frequencies),
    maxAvailability: Math.max(...availabilities),
    maxOccupancy: Math.max(...occupancies),
    minFrequency: Math.min(...frequencies),
    minAvailability: Math.min(...availabilities),
    minOccupancy: Math.min(...occupancies),
    totalRecords: data.reduce((sum, d) => sum + (d.count || 0), 0),
    uniqueLocations: uniqueLocations.length,
    locationLevel
  };
}import { useState, useEffect } from 'react';
import { fetchAnalysisData } from '../httpRequests';

/**
 * Custom hook for time-based analysis data with location filtering
 * @param {string} userId - User ID
 * @param {string} interval - Time interval: 'year', 'month', or 'day'
 * @param {object} dateFilter - Date filter object { year, month, day }
 * @param {object} locationFilter - Location filter object
 * @param {string} locationLevel - Location level: 'parking', 'floor', or 'sensor'
 */
export function useAnalysisData(userId, interval, dateFilter = {}, locationFilter = {}, locationLevel = 'parking') {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare date parameters based on interval
        const dateParams = prepareDateParams(interval, dateFilter);
        
        // Prepare location parameters based on location level
        const locationParams = prepareLocationParams(locationLevel, locationFilter);
        
        const result = await fetchAnalysisData(userId, interval, dateParams, locationParams, locationLevel);
        const processedData = processAnalysisData(result, interval, locationLevel);
        setData(processedData);
        
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError(err.message);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && interval) {
      loadAnalysisData();
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [userId, interval, JSON.stringify(dateFilter), JSON.stringify(locationFilter), locationLevel]);

  return { data, isLoading, error };
}

/**
 * Prepare date parameters based on interval
 * @param {string} interval - Time interval
 * @param {object} dateFilter - Date filter object
 * @returns {object} Prepared date parameters
 */
function prepareDateParams(interval, dateFilter) {
  const params = {};
  
  switch (interval) {
    case 'year':
      // For year interval, only send year
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      break;
    case 'month':
      // For month interval, send year and month
      if (dateFilter.year) {
        params.year = dateFilter.year;
      }
      if (dateFilter.month) {
        params.month = dateFilter.month;
      }
      break;
    case 'day':
      // For day interval, send year, month, and day
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
 * Prepare location parameters based on location level
 * @param {string} locationLevel - Location level
 * @param {object} locationFilter - Location filter object
 * @returns {object} Prepared location parameters
 */
function prepareLocationParams(locationLevel, locationFilter) {
  const params = {};
  
  switch (locationLevel) {
    case 'parking':
      // For parking level, only send parking_id
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      break;
    case 'floor':
      // For floor level, send parking_id and floor
      if (locationFilter.parking_ids?.length) {
        params.parking_ids = locationFilter.parking_ids;
      }
      if (locationFilter.level_ids?.length) {
        params.level_ids = locationFilter.level_ids;
      }
      break;
    case 'sensor':
      // For sensor level, send parking_id, floor, and sensor_id
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
 * Process raw analysis data based on interval type and location level
 * @param {Array} rawData - Raw data from API
 * @param {string} interval - Time interval: 'year', 'month', or 'day'
 * @param {string} locationLevel - Location level: 'parking', 'floor', or 'sensor'
 * @returns {Array} Processed data with averages
 */
function processAnalysisData(rawData, interval, locationLevel) {
  if (!rawData || !Array.isArray(rawData)) return [];

  // Group data by location first, then by time
  const groupedByLocation = groupDataByLocation(rawData, locationLevel);
  
  const processedData = [];
  
  Object.entries(groupedByLocation).forEach(([locationKey, locationData]) => {
    let timeBasedData;
    
    switch (interval) {
      case 'year':
        timeBasedData = calculateYearlyAverages(locationData);
        break;
      case 'month':
        timeBasedData = calculateMonthlyAverages(locationData);
        break;
      case 'day':
        timeBasedData = calculateDailyAverages(locationData);
        break;
      default:
        timeBasedData = [];
    }
    
    // Add location information to each time data point
    timeBasedData.forEach(timePoint => {
      processedData.push({
        ...timePoint,
        locationKey,
        locationName: getLocationName(locationData[0], locationLevel),
        locationLevel
      });
    });
  });

  return processedData;
}

/**
 * Group data by location level (parking, floor, or sensor)
 * @param {Array} data - Raw data array
 * @param {string} locationLevel - Location level
 * @returns {object} Grouped data by location
 */
function groupDataByLocation(data, locationLevel) {
  const grouped = {};
  
  data.forEach(record => {
    let locationKey;
    
    switch (locationLevel) {
      case 'parking':
        locationKey = record.parking_id;
        break;
      case 'floor':
        locationKey = `${record.parking_id}_${record.floor}`;
        break;
      case 'sensor':
        locationKey = `${record.parking_id}_${record.floor}_${record.sensor_id}`;
        break;
      default:
        locationKey = record.parking_id;
    }
    
    if (!grouped[locationKey]) {
      grouped[locationKey] = [];
    }
    
    grouped[locationKey].push(record);
  });
  
  return grouped;
}

/**
 * Get location name based on location level
 * @param {object} record - Data record
 * @param {string} locationLevel - Location level
 * @returns {string} Location name
 */
function getLocationName(record, locationLevel) {
  if (!record) return 'Unknown';
  
  switch (locationLevel) {
    case 'parking':
      return record.parking_alias || record.parking_name || `Parking ${record.parking_id}`;
    case 'floor':
      return `${record.parking_alias || 'Parking'} - ${record.floor_alias || `Piso ${record.floor}`}`;
    case 'sensor':
      return record.sensor_alias || `Sensor ${record.row}-${record.column}` || `Sensor ${record.sensor_id}`;
    default:
      return 'Unknown';
  }
}

/**
 * Calculate average frequency and availability for each month in a year
 * @param {Array} data - Raw data array for a specific location
 * @returns {Array} Monthly averages
 */
function calculateYearlyAverages(data) {
  const monthlyData = {};
  
  data.forEach(record => {
    const date = new Date(record.timestamp);
    const month = date.getMonth() + 1;
    const monthKey = month.toString().padStart(2, '0');
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        x: month,
        label: new Date(2000, month - 1).toLocaleString('es', { month: 'long' }),
        frequency: [],
        availability: [],
        occupancy: []
      };
    }
    
    monthlyData[monthKey].frequency.push(record.frequency || 0);
    monthlyData[monthKey].availability.push(record.availability || 0);
    monthlyData[monthKey].occupancy.push(record.occupancy || 0);
  });

  return Object.values(monthlyData).map(month => ({
    x: month.x,
    label: month.label,
    frequency: calculateAverage(month.frequency),
    availability: calculateAverage(month.availability),
    occupancy: calculateAverage(month.occupancy),
    count: month.frequency.length
  })).sort((a, b) => a.x - b.x);
}

/**
 * Calculate average frequency and availability for each day in a month
 * @param {Array} data - Raw data array for a specific location
 * @returns {Array} Daily averages
 */
function calculateMonthlyAverages(data) {
  const dailyData = {};
  
  data.forEach(record => {
    const date = new Date(record.timestamp);
    const day = date.getDate();
    
    if (!dailyData[day]) {
      dailyData[day] = {
        x: day,
        label: `Día ${day}`,
        frequency: [],
        availability: [],
        occupancy: []
      };
    }
    
    dailyData[day].frequency.push(record.frequency || 0);
    dailyData[day].availability.push(record.availability || 0);
    dailyData[day].occupancy.push(record.occupancy || 0);
  });

  return Object.values(dailyData).map(day => ({
    x: day.x,
    label: day.label,
    frequency: calculateAverage(day.frequency),
    availability: calculateAverage(day.availability),
    occupancy: calculateAverage(day.occupancy),
    count: day.frequency.length
  })).sort((a, b) => a.x - b.x);
}

/**
 * Calculate average frequency and availability for each hour in a day
 * @param {Array} data - Raw data array for a specific location
 * @returns {Array} Hourly averages
 */
function calculateDailyAverages(data) {
  const hourlyData = {};
  
  data.forEach(record => {
    const date = new Date(record.timestamp);
    const hour = date.getHours();
    
    if (!hourlyData[hour]) {
      hourlyData[hour] = {
        x: hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        frequency: [],
        availability: [],
        occupancy: []
      };
    }
    
    hourlyData[hour].frequency.push(record.frequency || 0);
    hourlyData[hour].availability.push(record.availability || 0);
    hourlyData[hour].occupancy.push(record.occupancy || 0);
  });

  return Object.values(hourlyData).map(hour => ({
    x: hour.x,
    label: hour.label,
    frequency: calculateAverage(hour.frequency),
    availability: calculateAverage(hour.availability),
    occupancy: calculateAverage(hour.occupancy),
    count: hour.frequency.length
  })).sort((a, b) => a.x - b.x);
}

/**
 * Calculate average from array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Average value
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + (val || 0), 0);
  return Number((sum / numbers.length).toFixed(2));
}

/**
 * Get time period label based on interval
 * @param {string} interval - Time interval
 * @returns {string} Period label
 */
export function getTimePeriodLabel(interval) {
  switch (interval) {
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
 * Transform analysis data for chart display by location
 * @param {Array} analysisData - Processed analysis data
 * @param {string} metricType - 'frequency', 'availability', or 'occupancy'
 * @returns {Array} Transformed data for charts
 */
export function transformAnalysisDataForChart(analysisData, metricType = 'occupancy') {
  if (!analysisData || analysisData.length === 0) return [];

  // Group by time period
  const timeGroups = {};
  
  analysisData.forEach(dataPoint => {
    const timeKey = `${dataPoint.x}_${dataPoint.label}`;
    
    if (!timeGroups[timeKey]) {
      timeGroups[timeKey] = {
        x: dataPoint.x,
        label: dataPoint.label
      };
    }
    
    // Add metric for each location
    const locationKey = dataPoint.locationName || dataPoint.locationKey;
    timeGroups[timeKey][`${metricType}_${locationKey}`] = dataPoint[metricType] || 0;
  });

  return Object.values(timeGroups).sort((a, b) => a.x - b.x);
}

/**
 * Generate chart series configuration for analysis data
 * @param {Array} analysisData - Analysis data
 * @param {string} metricType - 'frequency', 'availability', or 'occupancy'
 * @returns {Array} Chart series configuration
 */
export function generateAnalysisChartSeries(analysisData, metricType = 'occupancy') {
  if (!analysisData || analysisData.length === 0) return [];

  const uniqueLocations = [...new Set(analysisData.map(d => d.locationName || d.locationKey))];
  const colors = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#f57c00', '#00695c'];

  return uniqueLocations.map((location, index) => ({
    dataKey: `${metricType}_${location}`,
    label: `${getMetricLabel(metricType)} ${location}`,
    color: colors[index % colors.length]
  }));
}

/**
 * Get metric label in Spanish
 * @param {string} metricType - Metric type
 * @returns {string} Metric label
 */
function getMetricLabel(metricType) {
  switch (metricType) {
    case 'frequency':
      return 'Frecuencia';
    case 'availability':
      return 'Disponibilidad';
    case 'occupancy':
      return 'Ocupación';
    default:
      return 'Métrica';
  }
}

/**
 * Get location level from filter type
 * @param {string} filterType - Filter type from component
 * @returns {string} Location level
 */
export function getLocationLevel(filterType) {
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
 * Calculate summary statistics for analysis data
 * @param {Array} data - Analysis data
 * @param {string} locationLevel - Location level
 * @returns {object} Summary statistics
 */
export function calculateSummaryStatistics(data, locationLevel) {
  if (!data || data.length === 0) {
    return {
      avgFrequency: 0,
      avgAvailability: 0,
      avgOccupancy: 0,
      maxFrequency: 0,
      maxAvailability: 0,
      maxOccupancy: 0,
      minFrequency: 0,
      minAvailability: 0,
      minOccupancy: 0,
      totalRecords: 0,
      uniqueLocations: 0,
      locationLevel
    };
  }

  const frequencies = data.map(d => d.frequency || 0);
  const availabilities = data.map(d => d.availability || 0);
  const occupancies = data.map(d => d.occupancy || 0);
  const uniqueLocations = [...new Set(data.map(d => d.locationKey))];

  return {
    avgFrequency: calculateAverage(frequencies),
    avgAvailability: calculateAverage(availabilities),
    avgOccupancy: calculateAverage(occupancies),
    maxFrequency: Math.max(...frequencies),
    maxAvailability: Math.max(...availabilities),
    maxOccupancy: Math.max(...occupancies),
    minFrequency: Math.min(...frequencies),
    minAvailability: Math.min(...availabilities),
    minOccupancy: Math.min(...occupancies),
    totalRecords: data.reduce((sum, d) => sum + (d.count || 0), 0),
    uniqueLocations: uniqueLocations.length,
    locationLevel
  };
}