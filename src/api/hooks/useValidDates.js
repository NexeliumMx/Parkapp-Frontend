import { useState, useEffect } from 'react';
import { fetchAvailableDates } from '../httpRequests';

/**
 * Hook to fetch valid years based on current filters
 */
export function useValidYears(userId, filters = {}) {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setYears([]);
      return;
    }

    const fetchValidYears = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAvailableDates(userId, filters);

        // Extract unique years from the grouped data
        const availableYears = Object.keys(data.grouped_by_year_month || {})
          .map(year => parseInt(year))
          .sort((a, b) => b - a); // Sort descending (newest first)

        setYears(availableYears);
      } catch (err) {
        console.error('Error fetching valid years:', err);
        setError(err.message);
        setYears([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValidYears();
  }, [userId, JSON.stringify(filters)]); // Re-fetch when filters change

  return { years, loading, error };
}

/**
 * Hook to fetch valid months for a specific year
 */
export function useValidMonths(userId, year, filters = {}) {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !year) {
      setMonths([]);
      return;
    }

    const fetchValidMonths = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAvailableDates(userId, filters);

        // Extract months for the selected year
        const yearData = data.grouped_by_year_month?.[year.toString()] || {};
        const availableMonths = Object.keys(yearData)
          .map(month => parseInt(month))
          .sort((a, b) => a - b); // Sort ascending (January first)

        setMonths(availableMonths);
      } catch (err) {
        console.error('Error fetching valid months:', err);
        setError(err.message);
        setMonths([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValidMonths();
  }, [userId, year, JSON.stringify(filters)]);

  return { months, loading, error };
}

/**
 * Hook to fetch valid days for a specific year and month
 */
export function useValidDays(userId, year, month, filters = {}) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !year || !month) {
      setDays([]);
      return;
    }

    const fetchValidDays = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAvailableDates(userId, filters);

        // Extract days for the selected year and month
        const monthData = data.grouped_by_year_month?.[year.toString()]?.[month.toString()] || [];
        const availableDays = monthData
          .map(dayData => parseInt(dayData.day))
          .sort((a, b) => a - b); // Sort ascending

        setDays(availableDays);
      } catch (err) {
        console.error('Error fetching valid days:', err);
        setError(err.message);
        setDays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValidDays();
  }, [userId, year, month, JSON.stringify(filters)]);

  return { days, loading, error };
}

/**
 * Combined hook that fetches all date levels at once (more efficient)
 */
export function useValidDates(userId, filters = {}) {
  const [dateData, setDateData] = useState({
    years: [],
    months: [],
    days: [],
    rawData: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setDateData({ years: [], months: [], days: [], rawData: null });
      return;
    }

    const fetchValidDates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAvailableDates(userId, filters);
        
        // Extract years
        const years = Object.keys(data.grouped_by_year_month || {})
          .map(year => parseInt(year))
          .sort((a, b) => b - a);

        // Extract all months (for current selection)
        const months = [];
        const days = [];
        
        Object.entries(data.grouped_by_year_month || {}).forEach(([year, yearData]) => {
          Object.entries(yearData).forEach(([month, monthData]) => {
            months.push({
              year: parseInt(year),
              month: parseInt(month),
              monthName: new Date(2000, parseInt(month) - 1).toLocaleString('es', { month: 'long' })
            });
            
            monthData.forEach(dayData => {
              days.push({
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(dayData.day),
                date: dayData.date
              });
            });
          });
        });

        setDateData({
          years,
          months,
          days,
          rawData: data
        });
      } catch (err) {
        console.error('Error fetching valid dates:', err);
        setError(err.message);
        setDateData({ years: [], months: [], days: [], rawData: null });
      } finally {
        setLoading(false);
      }
    };

    fetchValidDates();
  }, [userId, JSON.stringify(filters)]);

  return { dateData, loading, error };
}