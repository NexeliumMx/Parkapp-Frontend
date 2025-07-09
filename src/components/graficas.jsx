import React, { useState, useMemo } from 'react';
import './graficas.css';
import { LineChart } from '@mui/x-charts/LineChart';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import { useFetchLevelsbyUser } from '../api/hooks/useLevelbyUser';
import { useFetchSensorsByLevel } from '../api/hooks/useSensorByLevel';
import { useValidYears, useValidMonths, useValidDays } from '../api/hooks/useValidDates';

const flattenLevelsData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  const flattened = [];
  data.forEach(parking => {
    if (parking.levels && Array.isArray(parking.levels)) {
      parking.levels.forEach(level => {
        flattened.push({
          parking_id: parking.parking_id,
          complex: parking.complex,
          parking_alias: parking.parking_alias,
          floor: level.floor,
          floor_alias: level.floor_alias
        });
      });
    }
  });
  
  return flattened;
};

const getUniqueParkings = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return [...new Set(data.map(d => ({
    id: d.parking_id,
    name: d.parking_alias
  })))].filter((parking, index, self) => 
    index === self.findIndex(p => p.id === parking.id)
  );
};

const getUniqueLevels = (data, selectedParkingIds) => {
  if (!data || !Array.isArray(data)) return [];
  
  const filteredData = selectedParkingIds.length === 0 
    ? data 
    : data.filter(d => selectedParkingIds.includes(d.parking_id));
  
  const levelMap = new Map();
  
  filteredData.forEach(d => {
    const key = `${d.parking_id}-${d.floor}`;
    if (!levelMap.has(key)) {
      levelMap.set(key, {
        id: d.floor,
        name: d.floor_alias,
        parking_id: d.parking_id
      });
    }
  });
  
  return Array.from(levelMap.values());
};

const getUniqueSensors = (sensorsData) => {
  if (!sensorsData || !Array.isArray(sensorsData)) return [];
  
  return sensorsData.map(sensor => ({
    id: sensor.sensor_id,
    name: sensor.sensor_alias || `Sensor ${sensor.row}-${sensor.column}`,
    row: sensor.row,
    column: sensor.column,
    sensor_id: sensor.sensor_id
  }));
};

const getUniquePlaces = (sensorsData, selectedPlaces) => {
  if (!sensorsData || !Array.isArray(sensorsData)) return [];
  
  return sensorsData.map(sensor => ({
    id: sensor.sensor_id,
    name: sensor.sensor_alias || `Lugar ${sensor.row}-${sensor.column}`,
    row: sensor.row,
    column: sensor.column
  }));
};

function generarDatosSimuladosMulti({ tipo, seleccionados, periodo }) {
  const length = periodo === 'anual' ? 12 : periodo === 'mensual' ? 31 : 24;
  return Array.from({ length }, (_, i) => {
    const punto = { x: i + 1 };
    seleccionados.forEach(nombre => {
      punto[`ocupacion_${nombre}`] = Math.floor(Math.random() * 101);
      punto[`rotacion_${nombre}`] = +(Math.random() * 5).toFixed(2);
    });
    return punto;
  });
}

const Graficas = ({ sidebarCollapsed = false, user_id = "fb713fca-4cbc-44b1-8a25-c6685c3efd31" }) => {
  const [period, setPeriod] = useState('anual');
  const [filter, setFilter] = useState('torre');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [selectedParkingIds, setSelectedParkingIds] = useState([]);
  const [selectedLevelIds, setSelectedLevelIds] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const dateFilters = useMemo(() => ({
    parking_ids: selectedParkingIds.length ? selectedParkingIds : undefined,
    level_ids: selectedLevelIds.length ? selectedLevelIds : undefined,
    sensor_ids: selectedPlaces.length ? selectedPlaces : undefined
  }), [selectedParkingIds, selectedLevelIds, selectedPlaces]);

  const { years, loading: yearsLoading, error: yearsError } = useValidYears(user_id, dateFilters);
  const { months, loading: monthsLoading, error: monthsError } = useValidMonths(user_id, year, dateFilters);
  const { days, loading: daysLoading, error: daysError } = useValidDays(user_id, year, month, dateFilters);

  const { data: rawLevelsData, isLoading, error } = useFetchLevelsbyUser(user_id);

  const levelsData = useMemo(() => {
    return flattenLevelsData(rawLevelsData);
  }, [rawLevelsData]);

  const selectedParkingId = selectedParkingIds[0] || null;
  const selectedLevelId = selectedLevelIds[0] || null;
  
  const { 
    data: sensorsData, 
    isLoading: sensorsLoading, 
    error: sensorsError 
  } = useFetchSensorsByLevel(selectedParkingId, selectedLevelId);

  const parkingOptions = useMemo(() => {
    return getUniqueParkings(levelsData);
  }, [levelsData]);

  const levelOptions = useMemo(() => {
    return getUniqueLevels(levelsData, selectedParkingIds);
  }, [levelsData, selectedParkingIds]);

  const placeOptions = useMemo(() => {
    return getUniquePlaces(sensorsData, selectedPlaces);
  }, [sensorsData, selectedPlaces]);

  React.useEffect(() => {
    setSelectedLevelIds([]);
    setSelectedPlaces([]);
  }, [selectedParkingIds]);

  React.useEffect(() => {
    setSelectedPlaces([]);
  }, [selectedLevelIds]);

  React.useEffect(() => {
    setYear('');
    setMonth('');
    setDay('');
  }, [selectedParkingIds, selectedLevelIds, selectedPlaces]);

  React.useEffect(() => {
    setMonth('');
    setDay('');
  }, [year]);

  React.useEffect(() => {
    setDay('');
  }, [month]);

  let tipo = 'torre';
  let seleccionados = selectedParkingIds.length 
    ? parkingOptions.filter(p => selectedParkingIds.includes(p.id)).map(p => p.name)
    : parkingOptions.map(p => p.name);

  if (filter === 'nivel') {
    tipo = 'nivel';
    seleccionados = selectedLevelIds.length 
      ? levelOptions.filter(l => selectedLevelIds.includes(l.id)).map(l => l.name)
      : levelOptions.map(l => l.name);
  } else if (filter === 'sensor') {
    tipo = 'lugar';
    seleccionados = selectedPlaces.length 
      ? placeOptions.filter(p => selectedPlaces.includes(p.id)).map(p => p.name)
      : placeOptions.map(p => p.name);
  }

  const datosSimuladosMulti = generarDatosSimuladosMulti({
    tipo,
    seleccionados,
    periodo: period,
  });

  const seriesOcupacion = seleccionados.map(nombre => ({
    dataKey: `ocupacion_${nombre}`,
    label: `Ocupación ${nombre}`,
  }));

  const seriesRotacion = seleccionados.map(nombre => ({
    dataKey: `rotacion_${nombre}`,
    label: `Rotación ${nombre}`,
  }));

  if (isLoading) {
    return (
      <div>
        <h1 className="graficas-title">Gráficas</h1>
        <h4 className="graficas-subtitle">Residencial Lomas de Bezares</h4>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Cargando datos de estacionamientos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="graficas-title">Gráficas</h1>
        <h4 className="graficas-subtitle">Residencial Lomas de Bezares</h4>
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Error al cargar datos: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="graficas-title">Gráficas</h1>
      <h4 className="graficas-subtitle">Residencial Lomas de Bezares</h4>
      <div
        className={`graficas-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
      >
        {/* Subtítulo arriba de los filtros */}
        <div style={{ fontSize: "1.15rem", fontWeight: 500, color: "#555", marginBottom: 8 }}>
          Filtros de análisis
        </div>
        {/* Filtros superiores primero */}
        <div className="filtros-superiores" style={{ width: "100%" }}>
          <div
            className="filtros-superiores-row"
            style={{ width: "100%", display: "flex", gap: 24 }}
          >
            <div
              className="filtros-fecha mitad"
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                gap: 24,
                minWidth: 0,
              }}
            >
              {/* Año */}
              <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                Año {yearsLoading && <span style={{fontSize: '12px', color: '#666'}}>(Cargando...)</span>}
                <FormControl fullWidth>
                  <Select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    style={{ width: "100%" }}
                    disabled={yearsLoading}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {years.map(yearOption => (
                      <MenuItem key={yearOption} value={yearOption.toString()}>
                        {yearOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </label>
              {/* Mes */}
              {(period === 'mensual' || period === 'diario') && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Mes {monthsLoading && <span style={{fontSize: '12px', color: '#666'}}>(Cargando...)</span>}
                  <FormControl fullWidth>
                    <Select
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                      style={{ width: "100%" }}
                      disabled={monthsLoading || !year}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {months.map(monthOption => (
                        <MenuItem key={monthOption} value={monthOption.toString()}>
                          {new Date(2000, monthOption - 1).toLocaleString('es', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </label>
              )}
              {/* Día */}
              {period === 'diario' && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Día {daysLoading && <span style={{fontSize: '12px', color: '#666'}}>(Cargando...)</span>}
                  <FormControl fullWidth>
                    <Select
                      value={day}
                      onChange={e => setDay(e.target.value)}
                      style={{ width: "100%" }}
                      disabled={daysLoading || !year || !month}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {days.map(dayOption => (
                        <MenuItem key={dayOption} value={dayOption.toString()}>
                          {dayOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </label>
              )}
            </div>
            {/* Separador vertical */}
            <div className="filtros-separador-vertical" />
            <div
              className="filtros-ubicacion mitad"
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                gap: 24,
                minWidth: 0,
              }}
            >
              {/* Torre (Parking) */}
              {(filter === 'torre' || filter === 'nivel' || filter === 'sensor') && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Torre
                  {filter === 'torre' ? (
                    <Select
                      multiple
                      value={selectedParkingIds}
                      onChange={e =>
                        setSelectedParkingIds(
                          typeof e.target.value === 'string'
                            ? e.target.value.split(',')
                            : e.target.value
                        )
                      }
                      renderValue={selected => 
                        parkingOptions
                          .filter(p => selected.includes(p.id))
                          .map(p => p.name)
                          .join(', ')
                      }
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      {parkingOptions.map(parking => (
                        <MenuItem key={parking.id} value={parking.id}>
                          <Checkbox checked={selectedParkingIds.indexOf(parking.id) > -1} />
                          <ListItemText primary={parking.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      value={selectedParkingIds[0] || ''}
                      onChange={e => setSelectedParkingIds(e.target.value ? [e.target.value] : [])}
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {parkingOptions.map(parking => (
                        <MenuItem key={parking.id} value={parking.id}>
                          {parking.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </label>
              )}
              {/* Nivel */}
              {(filter === 'nivel' || filter === 'sensor') && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Nivel
                  {filter === 'nivel' ? (
                    <Select
                      multiple
                      value={selectedLevelIds}
                      onChange={e => {
                        const newValue = typeof e.target.value === 'string'
                          ? e.target.value.split(',')
                          : e.target.value;
                        setSelectedLevelIds(newValue);
                      }}
                      renderValue={selected => {
                        return levelOptions
                          .filter(l => selected.includes(l.id))
                          .map(l => l.name)
                          .join(', ');
                      }}
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      {levelOptions.map(level => (
                        <MenuItem key={`${level.parking_id}-${level.id}`} value={level.id}>
                          <Checkbox checked={selectedLevelIds.indexOf(level.id) > -1} />
                          <ListItemText primary={level.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      value={selectedLevelIds[0] || ''}
                      onChange={e => {
                        const newValue = e.target.value ? [e.target.value] : [];
                        setSelectedLevelIds(newValue);
                      }}
                      style={{ minWidth: 120, width: "100%" }}
                      disabled={!selectedParkingIds.length}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {levelOptions.map(level => (
                        <MenuItem key={`${level.parking_id}-${level.id}`} value={level.id}>
                          {level.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </label>
              )}
              {/* Lugar - UPDATED TO USE REAL SENSORS DATA */}
              {filter === 'sensor' && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Lugar
                  {sensorsLoading ? (
                    <div style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>
                      Cargando sensores...
                    </div>
                  ) : sensorsError ? (
                    <div style={{ padding: '8px', textAlign: 'center', fontSize: '14px', color: 'red' }}>
                      Error al cargar sensores
                    </div>
                  ) : (
                    <Select
                      multiple
                      value={selectedPlaces}
                      onChange={e =>
                        setSelectedPlaces(
                          typeof e.target.value === 'string'
                            ? e.target.value.split(',')
                            : e.target.value
                        )
                      }
                      renderValue={selected => 
                        placeOptions
                          .filter(p => selected.includes(p.id))
                          .map(p => p.name)
                          .join(', ')
                      }
                      style={{ minWidth: 120, width: "100%" }}
                      disabled={!selectedLevelIds.length || !sensorsData}
                    >
                      {placeOptions.map(place => (
                        <MenuItem key={place.id} value={place.id}>
                          <Checkbox checked={selectedPlaces.indexOf(place.id) > -1} />
                          <ListItemText primary={place.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </label>
              )}
            </div>
          </div>
        </div>
        {/* Gráficas después de los filtros */}
        <div className="charts-row">
          <div style={{ width: 600, margin: '0 auto' }}>
            <Typography 
              variant="h6" 
              align="left" 
              gutterBottom
              sx={{ fontWeight: 700, fontSize: 24, pl:10 }}
            >
              Porcentaje de ocupación
            </Typography>
            <LineChart
              width={600}
              height={300}
              dataset={datosSimuladosMulti}
              series={seriesOcupacion}
              xAxis={[{ dataKey: 'x', label: period === 'anual' ? 'Mes' : period === 'mensual' ? 'Día' : 'Hora' }]}
              yAxis={[{ label: 'Porcentaje' }]}
            />
          </div>
          <div>
            <Typography 
              variant="h6" 
              align="left" 
              gutterBottom
              sx={{ fontWeight: 700, fontSize: 24, pl:10 }}
            >
              Frecuencia de rotación
            </Typography>
            <LineChart
              width={600}
              height={300}
              dataset={datosSimuladosMulti}
              series={seriesRotacion}
              xAxis={[{ dataKey: 'x', label: period === 'anual' ? 'Mes' : period === 'mensual' ? 'Día' : 'Hora' }]}
              yAxis={[{ label: 'Frecuencia' }]}
            />
          </div>
        </div>
        {/* Botones al final */}
        <div className="button-group-row">
          <ButtonGroup variant="outlined" color="secondary" fullWidth>
            <Button
              fullWidth
              variant={filter === 'torre' ? 'contained' : 'outlined'}
              onClick={() => setFilter('torre')}
            >
              Torre
            </Button>
            <Button
              fullWidth
              variant={filter === 'nivel' ? 'contained' : 'outlined'}
              onClick={() => setFilter('nivel')}
            >
              Nivel
            </Button>
            <Button
              fullWidth
              variant={filter === 'sensor' ? 'contained' : 'outlined'}
              onClick={() => setFilter('sensor')}
            >
              Sensor
            </Button>
          </ButtonGroup>
        </div>
        <div className="button-group-row">
          <ButtonGroup variant="outlined" color="primary" fullWidth>
            <Button
              fullWidth
              variant={period === 'anual' ? 'contained' : 'outlined'}
              onClick={() => setPeriod('anual')}
            >
              Anual
            </Button>
            <Button
              fullWidth
              variant={period === 'mensual' ? 'contained' : 'outlined'}
              onClick={() => setPeriod('mensual')}
            >
              Mensual
            </Button>
            <Button
              fullWidth
              variant={period === 'diario' ? 'contained' : 'outlined'}
              onClick={() => setPeriod('diario')}
            >
              Diario
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
};

export default Graficas;