import React, { useState } from 'react';
import './tablas.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useStatsByDateBucketFlexible } from '../api/hooks/useStatsByDateBucketFlexible';
import { useFetchLevelsbyUser } from '../api/hooks/useLevelbyUser';
import Divider from '@mui/material/Divider';
import { useValidYears, useValidMonths, useValidDays } from '../api/hooks/useValidDates';

const user_id = 'fb713fca-4cbc-44b1-8a25-c6685c3efd31';

const Tablas = ({ sidebarCollapsed }) => {
  // Filter states
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Date filters
  const [year, setYear] = useState('');
  const [rangeEnabled, setRangeEnabled] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [month, setMonth] = useState('');
  const [monthRangeEnabled, setMonthRangeEnabled] = useState(false);
  const [monthFrom, setMonthFrom] = useState('');
  const [monthTo, setMonthTo] = useState('');
  const [day, setDay] = useState('');
  const [dayRangeEnabled, setDayRangeEnabled] = useState(false);
  const [dayFrom, setDayFrom] = useState('');
  const [dayTo, setDayTo] = useState('');
  const [hour, setHour] = useState('');
  const [hourRangeEnabled, setHourRangeEnabled] = useState(false);
  const [hourFrom, setHourFrom] = useState('');
  const [hourTo, setHourTo] = useState('');

  // Fetch towers and levels for user
  const { data: parkingData, isLoading: parkingLoading, error: parkingError } = useFetchLevelsbyUser(user_id);

  // Build tower options from parkingData
  const towerOptions = parkingData
    ? parkingData.map(p => ({ parking_id: p.parking_id, parking_alias: p.parking_alias }))
    : [];

  // Build level options for selected tower
  const selectedParking = parkingData
    ? parkingData.find(p => p.parking_id === selectedTower)
    : null;
  const levelOptions = selectedParking
    ? selectedParking.levels.map(l => ({ floor: l.floor, floor_alias: l.floor_alias }))
    : [];

  // Derive level id (floor) from selected level alias to filter dates consistently with graficas.jsx
  const selectedLevelId = levelOptions.find(l => l.floor_alias === selectedLevel)?.floor || null;

  // Fetch available dates like in graficas.jsx
  const dateFilters = {
    parking_ids: selectedTower ? [selectedTower] : undefined,
    level_ids: selectedLevelId != null ? [selectedLevelId] : undefined,
  };

  const { years, loading: yearsLoading } = useValidYears(user_id, dateFilters);
  const { months, loading: monthsLoading } = useValidMonths(user_id, year, dateFilters);
  const { days, loading: daysLoading } = useValidDays(user_id, year, month, dateFilters);

  // Build params for hook
  const params = {
    parking_id: selectedTower || (towerOptions[0] && towerOptions[0].parking_id) || '',
    ...(rangeEnabled && yearFrom && yearTo
      ? { year: { range: true, from: yearFrom, to: yearTo } }
      : year
      ? { year: { range: false, exact: year } }
      : {}),
    ...(monthRangeEnabled && monthFrom && monthTo
      ? { month: { range: true, from: monthFrom, to: monthTo } }
      : month
      ? { month: { range: false, exact: month } }
      : {}),
    ...(dayRangeEnabled && dayFrom && dayTo
      ? { day: { range: true, from: dayFrom, to: dayTo } }
      : day
      ? { day: { range: false, exact: day } }
      : {}),
    ...(hourRangeEnabled && hourFrom && hourTo
      ? { hour: { range: true, from: hourFrom, to: hourTo } }
      : hour
      ? { hour: { range: false, exact: hour } }
      : {}),
  };

  // Helper to check if any date filter is set
  const hasDateFilter =
    (params.year && (params.year.range ? params.year.from && params.year.to : params.year.exact)) ||
    (params.month && (params.month.range ? params.month.from && params.month.to : params.month.exact)) ||
    (params.day && (params.day.range ? params.day.from && params.day.to : params.day.exact)) ||
    (params.hour && (params.hour.range ? params.hour.from && params.hour.to : params.hour.exact));

  // Only call the hook if a date filter is present
  const stats = useStatsByDateBucketFlexible(hasDateFilter ? params : null);

  const data = hasDateFilter ? stats.data : [];
  const loading = hasDateFilter ? stats.loading : false;
  const error = hasDateFilter ? stats.error : null;

  // Filter and sort API data
  let filteredData = data || [];
  if (selectedLevel) {
    filteredData = filteredData.filter(item => item.floor_alias === selectedLevel);
  }
  if (sortBy) {
    const factor = sortOrder === 'asc' ? 1 : -1;
    filteredData = [...filteredData].sort((a, b) => {
      return (parseFloat(a[sortBy]) - parseFloat(b[sortBy])) * factor;
    });
  }

  return (
    <div className={`tablas${sidebarCollapsed ? " collapsed" : ""}`}>
      <h1 className="tablas-title">Tablas de sensores</h1>
      <h4 className="tablas-subtitle">Residencial Lomas de Bezares</h4>
      <div className="tables-container">
        {/* Make controls-container a column layout */}
        <div className="controls-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Filter Box */}
          <div className="filter-box">
            <div className="filter-content" style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Location Filters Group */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
                <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 8, marginLeft: 2 }}>Filtros</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* Torre */}
                  <div className="filter-group" style={{ minWidth: 180 }}>
                    <FormControl fullWidth>
                      <InputLabel id="tower-label">Torre</InputLabel>
                      <Select
                        labelId="tower-label"
                        id="tower"
                        value={selectedTower}
                        label="Torre"
                        onChange={(e) => {
                          setSelectedTower(e.target.value);
                          setSelectedLevel('');
                          // reset date filters when tower changes
                          setYear(''); setMonth(''); setDay('');
                          setRangeEnabled(false); setYearFrom(''); setYearTo('');
                          setMonthRangeEnabled(false); setMonthFrom(''); setMonthTo('');
                          setDayRangeEnabled(false); setDayFrom(''); setDayTo('');
                        }}
                      >
                        <MenuItem value="">Todas las torres</MenuItem>
                        {towerOptions.map(tower => (
                          <MenuItem key={tower.parking_id} value={tower.parking_id}>
                            {tower.parking_alias}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  {/* Nivel */}
                  <div className="filter-group" style={{ minWidth: 180 }}>
                    <FormControl fullWidth>
                      <InputLabel id="level-label">Nivel</InputLabel>
                      <Select
                        labelId="level-label"
                        id="level"
                        value={selectedLevel}
                        label="Nivel"
                        onChange={(e) => {
                          setSelectedLevel(e.target.value);
                        }}
                      >
                        <MenuItem value="">Todos los niveles</MenuItem>
                        {levelOptions.map(level => (
                          <MenuItem key={level.floor} value={level.floor_alias}>
                            {level.floor_alias}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
              {/* Order Selectors Group */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 340 }}>
                <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 8, marginLeft: 2 }}>Orden de la tabla</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* Ordenar por */}
                  <div className="filter-group" style={{ minWidth: 180 }}>
                    <FormControl fullWidth>
                      <InputLabel id="sortBy-label">Ordenar por</InputLabel>
                      <Select
                        labelId="sortBy-label"
                        id="sortBy"
                        value={sortBy}
                        label="Ordenar por"
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <MenuItem value="">Sin orden</MenuItem>
                        <MenuItem value="normalized_rotation">Rotación</MenuItem>
                        <MenuItem value="occupation_percentage">Ocupación</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  {/* Orden */}
                  <div className="filter-group" style={{ minWidth: 140 }}>
                    <FormControl fullWidth>
                      <InputLabel id="sortOrder-label">Orden</InputLabel>
                      <Select
                        labelId="sortOrder-label"
                        id="sortOrder"
                        value={sortOrder}
                        label="Orden"
                        onChange={(e) => setSortOrder(e.target.value)}
                        disabled={!sortBy}
                      >
                        <MenuItem value="asc">Ascendente</MenuItem>
                        <MenuItem value="desc">Descendente</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', margin: '16px 0' }}>

              <Divider sx={{ my: 2, borderWidth:1.5 }} />
            
              </div>
              
              
            {/* Date Filters UI */}
            <div className="filtros-rango-multilinea" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Subtitle for filtros rango multilinea */}
              <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 8, marginLeft: 2 }}>Selecciona el tiempo de análisis</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Año */}
                <div className="filtro-ano-rango">
                  <div className="filtro-ano-selectores">
                    <div className="filtro-ano-selectores-row filtro-centrado">
                      <div className="filtro-titulo">Año</div>
                      <div className="filtro-dropdown-row">
                        {!rangeEnabled ? (
                          <FormControl fullWidth size="small">
                            {/* Removed InputLabel to match graficas */}
                            <Select
                              value={year}
                              onChange={e => { setYear(e.target.value); setMonth(''); setDay(''); }}
                              disabled={!selectedTower || yearsLoading}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>
                                  {!selectedTower ? 'Seleccione una torre' : (yearsLoading ? 'Cargando...' : 'Todos')}
                                </em>
                              </MenuItem>
                              {years.map(y => (
                                <MenuItem key={y} value={String(y)}>
                                  {y}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <>
                            <FormControl size="small" style={{ minWidth: 90, marginRight: 8 }}>
                              <InputLabel id="year-from-label">De</InputLabel>
                              <Select
                                labelId="year-from-label"
                                value={yearFrom}
                                label="De"
                                onChange={e => setYearFrom(e.target.value)}
                              >
                                <MenuItem value="">Año</MenuItem>
                                <MenuItem value="2024">2024</MenuItem>
                                <MenuItem value="2025">2025</MenuItem>
                              </Select>
                            </FormControl>
                            <span style={{ margin: '0 8px' }}>al</span>
                            <FormControl size="small" style={{ minWidth: 90 }}>
                              <InputLabel id="year-to-label">A</InputLabel>
                              <Select
                                labelId="year-to-label"
                                value={yearTo}
                                label="A"
                                onChange={e => setYearTo(e.target.value)}
                              >
                                <MenuItem value="">Año</MenuItem>
                                <MenuItem value="2024">2024</MenuItem>
                                <MenuItem value="2025">2025</MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="filtro-ano-checkbox filtro-centrado">
                      <label>
                        <input
                          type="checkbox"
                          checked={rangeEnabled}
                          onChange={e => setRangeEnabled(e.target.checked)}
                          style={{ marginRight: 6 }}
                        />
                        Rango
                      </label>
                    </div>
                  </div>
                </div>
                {/* Mes */}
                <div className="filtro-ano-rango">
                  <div className="filtro-ano-selectores">
                    <div className="filtro-ano-selectores-row filtro-centrado">
                      <div className="filtro-titulo">Mes</div>
                      <div className="filtro-dropdown-row">
                        {!monthRangeEnabled ? (
                          <FormControl fullWidth size="small" style={{ minWidth: 90 }}>
                            {/* Removed InputLabel to match graficas */}
                            <Select
                              value={month}
                              onChange={e => { setMonth(e.target.value); setDay(''); }}
                              disabled={!selectedTower || !year || monthsLoading}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>
                                  {!selectedTower
                                    ? 'Seleccione una torre'
                                    : !year
                                    ? 'Seleccione un año'
                                    : (monthsLoading ? 'Cargando...' : 'Todos')}
                                </em>
                              </MenuItem>
                              {months.map(m => (
                                <MenuItem key={m} value={m.toString()}>
                                  {new Date(2000, m - 1).toLocaleString('es', { month: 'long' })}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <>
                            <FormControl size="small" style={{ minWidth: 90, marginRight: 8 }}>
                              <InputLabel id="month-from-label">De</InputLabel>
                              <Select
                                labelId="month-from-label"
                                value={monthFrom}
                                label="De"
                                onChange={e => setMonthFrom(e.target.value)}
                              >
                                <MenuItem value="">Mes</MenuItem>
                                {[...Array(12)].map((_, i) => (
                                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                    {new Date(0, i).toLocaleString('es', { month: 'long' })}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <span style={{ margin: '0 8px' }}>a</span>
                            <FormControl size="small" style={{ minWidth: 90 }}>
                              <InputLabel id="month-to-label">A</InputLabel>
                              <Select
                                labelId="month-to-label"
                                value={monthTo}
                                label="A"
                                onChange={e => setMonthTo(e.target.value)}
                              >
                                <MenuItem value="">Mes</MenuItem>
                                {[...Array(12)].map((_, i) => (
                                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                    {new Date(0, i).toLocaleString('es', { month: 'long' })}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="filtro-ano-checkbox filtro-centrado">
                      <label>
                        <input
                          type="checkbox"
                          checked={monthRangeEnabled}
                          onChange={e => setMonthRangeEnabled(e.target.checked)}
                          style={{ marginRight: 6 }}
                        />
                        Rango
                      </label>
                    </div>
                  </div>
                </div>
                {/* Día */}
                <div className="filtro-ano-rango">
                  <div className="filtro-ano-selectores">
                    <div className="filtro-ano-selectores-row filtro-centrado">
                      <div className="filtro-titulo">Día</div>
                      <div className="filtro-dropdown-row">
                        {!dayRangeEnabled ? (
                          <FormControl fullWidth size="small">
                            {/* Removed InputLabel to match graficas */}
                            <Select
                              value={day}
                              onChange={e => setDay(e.target.value)}
                              disabled={!selectedTower || !year || !month || daysLoading}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>
                                  {!selectedTower
                                    ? 'Seleccione una torre'
                                    : !year
                                    ? 'Seleccione un año'
                                    : !month
                                    ? 'Seleccione un mes'
                                    : (daysLoading ? 'Cargando...' : 'Todos')}
                                </em>
                              </MenuItem>
                              {days.map(d => (
                                <MenuItem key={d} value={d.toString()}>
                                  {d}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <>
                            <FormControl size="small" style={{ minWidth: 90, marginRight: 8 }}>
                              <InputLabel id="day-from-label">De</InputLabel>
                              <Select
                                labelId="day-from-label"
                                value={dayFrom}
                                label="De"
                                onChange={e => setDayFrom(e.target.value)}
                              >
                                <MenuItem value="">Día</MenuItem>
                                {[...Array(31)].map((_, i) => (
                                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                    {i + 1}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <span style={{ margin: '0 8px' }}>al</span>
                            <FormControl size="small" style={{ minWidth: 90 }}>
                              <InputLabel id="day-to-label">A</InputLabel>
                              <Select
                                labelId="day-to-label"
                                value={dayTo}
                                label="A"
                                onChange={e => setDayTo(e.target.value)}
                              >
                                <MenuItem value="">Día</MenuItem>
                                {[...Array(31)].map((_, i) => (
                                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                    {i + 1}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="filtro-ano-checkbox filtro-centrado">
                      <label>
                        <input
                          type="checkbox"
                          checked={dayRangeEnabled}
                          onChange={e => setDayRangeEnabled(e.target.checked)}
                          style={{ marginRight: 6 }}
                        />
                        Rango
                      </label>
                    </div>
                  </div>
                </div>
               {/* Hora */}
                <div className="filtro-ano-rango">
                  <div className="filtro-ano-selectores">
                    <div className="filtro-ano-selectores-row filtro-centrado">
                      <div className="filtro-titulo">Hora</div>
                      <div className="filtro-dropdown-row">
                        {!hourRangeEnabled ? (
                          <FormControl fullWidth size="small">
                            <InputLabel id="hour-label">Hora</InputLabel>
                            <Select
                              labelId="hour-label"
                              value={hour}
                              label="Hora"
                              onChange={e => setHour(e.target.value)}
                            >
                              <MenuItem value="">Todas</MenuItem>
                              {[...Array(24)].map((_, i) => (
                                <MenuItem key={i} value={String(i).padStart(2, '0')}>
                                  {i}:00
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <>
                            <FormControl size="small" style={{ minWidth: 90, marginRight: 8 }}>
                              <InputLabel id="hour-from-label">De</InputLabel>
                              <Select
                                labelId="hour-from-label"
                                value={hourFrom}
                                label="De"
                                onChange={e => setHourFrom(e.target.value)}
                              >
                                <MenuItem value="">Hora</MenuItem>
                                {[...Array(24)].map((_, i) => (
                                  <MenuItem key={i} value={String(i).padStart(2, '0')}>
                                    {i}:00
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <span style={{ margin: '0 8px' }}>a</span>
                            <FormControl size="small" style={{ minWidth: 90 }}>
                              <InputLabel id="hour-to-label">A</InputLabel>
                              <Select
                                labelId="hour-to-label"
                                value={hourTo}
                                label="A"
                                onChange={e => setHourTo(e.target.value)}
                              >
                                <MenuItem value="">Hora</MenuItem>
                                {[...Array(24)].map((_, i) => (
                                  <MenuItem key={i} value={String(i).padStart(2, '0')}>
                                    {i}:00
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="filtro-ano-checkbox filtro-centrado">
                      <label>
                        <input
                          type="checkbox"
                          checked={hourRangeEnabled}
                          onChange={e => setHourRangeEnabled(e.target.checked)}
                          style={{ marginRight: 6 }}
                        />
                        Rango
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Content Box - table will be directly below filters */}
          <div className="content-box">
            {loading || parkingLoading ? (
              <div>Cargando datos...</div>
            ) : error || parkingError ? (
              hasDateFilter ? (
                <div>Error: {(error && error.message) || (parkingError && parkingError.message)}</div>
              ) : (
                <div>Seleccione al menos un filtro de fecha para mostrar datos.</div>
              )
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sensor</th>
                    <th>Torre</th>
                    <th>Nivel</th>
                    <th>Rotación</th>
                    <th>Ocupación</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.sensor_id}>
                      <td>{item.sensor_alias}</td>
                      <td>{item.parking_alias}</td>
                      <td>{item.floor_alias}</td>
                      <td>{item.normalized_rotation}</td>
                      <td>{item.occupation_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tablas;