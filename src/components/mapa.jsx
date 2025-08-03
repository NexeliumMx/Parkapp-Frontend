import React, { useState } from 'react';
import './mapa.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import KonvaRenderer from "./konvaRenderer";
import parkingImage from "../assets/map_testing/background-image.jpeg";
import mapStageData from "../assets/map_testing/stage.json";
import mapObjectsData from "../assets/map_testing/objects.json";
import constSensorData from "../assets/map_testing/sensors.json";
import { useLevelImage } from '../api/hooks/useLevelImage';
import { useFetchLevelsbyUser } from '../api/hooks/useLevelbyUser';

const user_id = "fb713fca-4cbc-44b1-8a25-c6685c3efd31";

mapObjectsData.forEach(obj => {
  const found = constSensorData.some(sensor => sensor.linkedKonvaId === obj.id);
  if (!found) {
    console.warn(`No sensor linked for Konva object with id: ${obj.id}`);
  }
});


const Mapa = () => {
  // States for filters
  const [selectedTorre, setSelectedTorre] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedView, setSelectedView] = useState('rotacion');
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
  const [period, setPeriod] = useState('tiempo-real'); // 'tiempo-real', 'rotacion', 'ocupacion'
  // Example options for torre and nivel


  // Custom hook usage
  //const { imageData, loading, error } = useLevelImage(selectedTorre, selectedNivel);
  // Fetch parkings/levels for user
  const { data: userLevels, isLoading: userLevelsLoading, error: userLevelsError } = useFetchLevelsbyUser(user_id);

  // Get torres (parkings) from userLevels
  const torres = userLevels ? userLevels.map(p => ({
    parking_id: p.parking_id,
    parking_alias: p.parking_alias,
    complex: p.complex
  })) : [];

  // Get niveles (floors) for the selected torre
  const niveles = userLevels && selectedTorre
    ? (userLevels.find(p => p.parking_id === selectedTorre)?.levels || [])
    : [];

  // Use image hook with selected torre and nivel
  const selectedNivelObj = niveles.find(n => n.floor === Number(selectedNivel));
  const { imageData, loading, error } = useLevelImage(selectedTorre, selectedNivel);

  return (
    <div>
      <div className="mapa-header-row">
        <h1 className="mapa-title">Frecuencia de rotaciones por lugar</h1>
        <div className="mapa-header-selects">
          <FormControl size="small" style={{ minWidth: 120, marginRight: 16 }}>
            <InputLabel id="torre-label">Torre</InputLabel>
            <Select
              labelId="torre-label"
              value={selectedTorre}
              label="Torre"
              onChange={e => {
                setSelectedTorre(e.target.value);
                setSelectedNivel(''); // Reset nivel when torre changes
              }}
              disabled={userLevelsLoading || !userLevels}
            >
              <MenuItem value="">Todas</MenuItem>
              {torres.map(torre => (
                <MenuItem key={torre.parking_id} value={torre.parking_id}>
                  {torre.parking_alias} ({torre.complex})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" style={{ minWidth: 120 }}>
            <InputLabel id="nivel-label">Nivel</InputLabel>
            <Select
              labelId="nivel-label"
              value={selectedNivel}
              label="Nivel"
              onChange={e => setSelectedNivel(e.target.value)}
              disabled={!selectedTorre || niveles.length === 0}
            >
              <MenuItem value="">Todos</MenuItem>
              {niveles.map(nivel => (
                <MenuItem key={nivel.floor} value={nivel.floor}>
                  {nivel.floor_alias} (Piso {nivel.floor})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <h4 className="mapa-subtitle">Residencial Lomas de Bezares</h4>
      <div className="mapa-container">
        <div className="filtros-tiempo-row">
          <ButtonGroup className="filtros-modo-botones" variant="outlined" color="primary">
            <Button
              variant={period === 'tiempo-real' ? 'contained' : 'outlined'}
              onClick={() => setPeriod('tiempo-real')}
            >
              Tiempo real
            </Button>
            <Button
              variant={period === 'rotacion' ? 'contained' : 'outlined'}
              onClick={() => setPeriod('rotacion')}
            >
              Rotación
            </Button>
            <Button
              variant={period === 'ocupacion' ? 'contained' : 'outlined'}
              onClick={() => setPeriod('ocupacion')}
            >
              Ocupación
            </Button>
          </ButtonGroup>

          <div className="filtros-divider" style={{ visibility: (period === 'rotacion' || period === 'ocupacion') ? 'visible' : 'hidden' }} />

          {/* Año */}
          <div className="filtro-ano-rango">
            {(period === 'rotacion' || period === 'ocupacion') && (
              <div className="filtro-ano-selectores">
                <div className="filtro-ano-selectores-row filtro-centrado">
                  <div className="filtro-titulo">Año</div>
                  <div className="filtro-dropdown-row">
                    {!rangeEnabled ? (
                      <FormControl fullWidth size="small">
                        <InputLabel id="year-label">Año</InputLabel>
                        <Select
                          labelId="year-label"
                          value={year}
                          label="Año"
                          onChange={e => setYear(e.target.value)}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          <MenuItem value="2024">2024</MenuItem>
                          <MenuItem value="2025">2025</MenuItem>
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
            )}
          </div>

          {/* Mes */}
          <div className="filtro-ano-rango">
            {(period === 'rotacion' || period === 'ocupacion') && (
              <div className="filtro-ano-selectores">
                <div className="filtro-ano-selectores-row filtro-centrado">
                  <div className="filtro-titulo">Mes</div>
                  <div className="filtro-dropdown-row">
                    {!monthRangeEnabled ? (
                      <FormControl fullWidth size="small">
                        <InputLabel id="month-label">Mes</InputLabel>
                        <Select
                          labelId="month-label"
                          value={month}
                          label="Mes"
                          onChange={e => setMonth(e.target.value)}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          {[...Array(12)].map((_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                              {new Date(0, i).toLocaleString('es', { month: 'long' })}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <>
                        <FormControl size="small" style={{ minWidth: 110, marginRight: 8 }}>
                          <InputLabel id="month-from-label">De</InputLabel>
                          <Select
                            labelId="month-from-label"
                            value={monthFrom}
                            label="De"
                            onChange={e => setMonthFrom(e.target.value)}
                          >
                            <MenuItem value="">Mes</MenuItem>
                            {[...Array(12)].map((_, i) => (
                              <MenuItem key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('es', { month: 'long' })}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <span style={{ margin: '0 8px' }}>a</span>
                        <FormControl size="small" style={{ minWidth: 110 }}>
                          <InputLabel id="month-to-label">A</InputLabel>
                          <Select
                            labelId="month-to-label"
                            value={monthTo}
                            label="A"
                            onChange={e => setMonthTo(e.target.value)}
                          >
                            <MenuItem value="">Mes</MenuItem>
                            {[...Array(12)].map((_, i) => (
                              <MenuItem key={i + 1} value={i + 1}>
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
            )}
          </div>

          {/* Día */}
          <div className="filtro-ano-rango">
            {(period === 'rotacion' || period === 'ocupacion') && (
              <div className="filtro-ano-selectores">
                <div className="filtro-ano-selectores-row filtro-centrado">
                  <div className="filtro-titulo">Día</div>
                  <div className="filtro-dropdown-row">
                    {!dayRangeEnabled ? (
                      <FormControl fullWidth size="small">
                        <InputLabel id="day-label">Día</InputLabel>
                        <Select
                          labelId="day-label"
                          value={day}
                          label="Día"
                          onChange={e => setDay(e.target.value)}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          {[...Array(31)].map((_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
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
                              <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
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
                              <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
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
            )}
          </div>

          {/* Hora */}
          <div className="filtro-ano-rango">
            {(period === 'rotacion' || period === 'ocupacion') && (
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
                            <MenuItem key={i} value={i}>{i}:00</MenuItem>
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
                              <MenuItem key={i} value={i}>{i}:00</MenuItem>
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
                              <MenuItem key={i} value={i}>{i}:00</MenuItem>
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
            )}
          </div>
        </div>

        {/* Map Visualization */}
        <div className="map-visualization">
          <div className="map-content">
            <div className="map-placeholder">
              {error && (
                <div style={{ color: 'red', marginBottom: 12 }}>
                  Error al cargar la imagen del nivel: {error}
                </div>
                
              )}
              <KonvaRenderer
                stage={mapStageData}
                objects={mapObjectsData}
                backgroundUrl={imageData?.url} 
                period={period}
                sensorData={constSensorData}
              />   
            </div>
            
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Mapa;