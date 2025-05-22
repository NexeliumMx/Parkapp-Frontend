import React, { useState } from 'react';
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

const datos = [  
  { sensor_id: "1", parking: "Torre A", level: "Nivel 1", row: 1, column: 1, rotacion: 14.2, ocupacion: 45 },
  { sensor_id: "2", parking: "Torre A", level: "Nivel 1", row: 1, column: 2, rotacion: 0, ocupacion: 78 },
  { sensor_id: "3", parking: "Torre A", level: "Nivel 2", row: 1, column: 1, rotacion: 90, ocupacion: 32 },
  { sensor_id: "4", parking: "Torre A", level: "Nivel 2", row: 2, column: 1, rotacion: 180, ocupacion: 91 },
  { sensor_id: "5", parking: "Torre B", level: "Nivel 1", row: 1, column: 1, rotacion: 45, ocupacion: 12 },
  { sensor_id: "6", parking: "Torre B", level: "Nivel 1", row: 1, column: 2, rotacion: 270, ocupacion: 67 },
  { sensor_id: "7", parking: "Torre B", level: "Nivel 2", row: 2, column: 1, rotacion: 0, ocupacion: 88 },
  { sensor_id: "8", parking: "Torre B", level: "Nivel 2", row: 2, column: 2, rotacion: 180, ocupacion: 23 },
  { sensor_id: "9", parking: "Torre C", level: "Nivel 1", row: 1, column: 1, rotacion: 90, ocupacion: 55 },
  { sensor_id: "10", parking: "Torre C", level: "Nivel 1", row: 1, column: 2, rotacion: 0, ocupacion: 76 },
  { sensor_id: "11", parking: "Torre C", level: "Nivel 2", row: 1, column: 1, rotacion: 270, ocupacion: 43 },
  { sensor_id: "12", parking: "Torre C", level: "Nivel 3", row: 1, column: 1, rotacion: 180, ocupacion: 89 },
  { sensor_id: "13", parking: "Torre C", level: "Nivel 3", row: 2, column: 1, rotacion: 45, ocupacion: 34 },
  { sensor_id: "14", parking: "Torre D", level: "Nivel 1", row: 1, column: 1, rotacion: 90, ocupacion: 65 },
  { sensor_id: "15", parking: "Torre D", level: "Nivel 1", row: 2, column: 1, rotacion: 0, ocupacion: 92 },
  { sensor_id: "16", parking: "Torre D", level: "Nivel 2", row: 1, column: 1, rotacion: 180, ocupacion: 21 },
  { sensor_id: "17", parking: "Torre D", level: "Nivel 2", row: 1, column: 2, rotacion: 270, ocupacion: 78 },
  { sensor_id: "18", parking: "Torre D", level: "Nivel 3", row: 1, column: 1, rotacion: 45, ocupacion: 44 },
  { sensor_id: "19", parking: "Torre D", level: "Nivel 3", row: 2, column: 1, rotacion: 90, ocupacion: 87 },
  { sensor_id: "20", parking: "Torre D", level: "Nivel 3", row: 2, column: 2, rotacion: 0, ocupacion: 56 }
];

// Utilidades para obtener opciones únicas y dependientes
const getUniqueTowers = (data) => [...new Set(data.map(d => d.parking))];
const getUniqueLevels = (data, selectedTowers) => [
  ...new Set(
    data
      .filter(d => selectedTowers.length === 0 || selectedTowers.includes(d.parking))
      .map(d => d.level)
  ),
];
const getUniquePlaces = (data, selectedTowers, selectedLevels) => [
  ...new Set(
    data
      .filter(d =>
        (selectedTowers.length === 0 || selectedTowers.includes(d.parking)) &&
        (selectedLevels.length === 0 || selectedLevels.includes(d.level))
      )
      .map(d => `Lugar ${d.row}-${d.column}`)
  ),
];

// Genera datos simulados para múltiples elementos seleccionados (torres, niveles o lugares)
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

const Graficas = ({ sidebarCollapsed = false }) => {
  const [period, setPeriod] = useState('anual');
  const [filter, setFilter] = useState('torre');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [selectedTowers, setSelectedTowers] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // Opciones dinámicas
  const towerOptions = getUniqueTowers(datos);
  const levelOptions = getUniqueLevels(datos, selectedTowers);
  const placeOptions = getUniquePlaces(datos, selectedTowers, selectedLevels);

  // Determina el tipo de filtro y los elementos seleccionados
  let tipo = 'torre';
  let seleccionados = selectedTowers.length ? selectedTowers : towerOptions;
  if (filter === 'nivel') {
    tipo = 'nivel';
    seleccionados = selectedLevels.length ? selectedLevels : levelOptions;
  } else if (filter === 'sensor') {
    tipo = 'lugar';
    seleccionados = selectedPlaces.length ? selectedPlaces : placeOptions;
  }

  // Genera datos simulados para los elementos seleccionados
  const datosSimuladosMulti = generarDatosSimuladosMulti({
    tipo,
    seleccionados,
    periodo: period,
  });

  // Series dinámicas para ocupación
  const seriesOcupacion = seleccionados.map(nombre => ({
    dataKey: `ocupacion_${nombre}`,
    label: `Ocupación ${nombre}`,
  }));

  // Series dinámicas para rotación
  const seriesRotacion = seleccionados.map(nombre => ({
    dataKey: `rotacion_${nombre}`,
    label: `Rotación ${nombre}`,
  }));

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
                Año
                <FormControl fullWidth>
                  <Select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                    <MenuItem value="2025">2025</MenuItem>
                  </Select>
                </FormControl>
              </label>
              {/* Mes */}
              {(period === 'mensual' || period === 'diario') && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Mes
                  <FormControl fullWidth>
                    <Select
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="1">Enero</MenuItem>
                      <MenuItem value="2">Febrero</MenuItem>
                      <MenuItem value="3">Marzo</MenuItem>
                      <MenuItem value="4">Abril</MenuItem>
                      <MenuItem value="5">Mayo</MenuItem>
                      <MenuItem value="6">Junio</MenuItem>
                      <MenuItem value="7">Julio</MenuItem>
                      <MenuItem value="8">Agosto</MenuItem>
                      <MenuItem value="9">Septiembre</MenuItem>
                      <MenuItem value="10">Octubre</MenuItem>
                      <MenuItem value="11">Noviembre</MenuItem>
                      <MenuItem value="12">Diciembre</MenuItem>
                    </Select>
                  </FormControl>
                </label>
              )}
              {/* Día */}
              {period === 'diario' && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Día
                  <FormControl fullWidth>
                    <Select
                      value={day}
                      onChange={e => setDay(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {[...Array(31)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
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
              {/* Torre */}
              {(filter === 'torre' || filter === 'nivel' || filter === 'sensor') && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Torre
                  {filter === 'torre' ? (
                    <Select
                      multiple
                      value={selectedTowers}
                      onChange={e =>
                        setSelectedTowers(
                          typeof e.target.value === 'string'
                            ? e.target.value.split(',')
                            : e.target.value
                        )
                      }
                      renderValue={selected => selected.join(', ')}
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      {towerOptions.map(tower => (
                        <MenuItem key={tower} value={tower}>
                          <Checkbox checked={selectedTowers.indexOf(tower) > -1} />
                          <ListItemText primary={tower} />
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      value={selectedTowers[0] || ''}
                      onChange={e => setSelectedTowers([e.target.value])}
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {towerOptions.map(tower => (
                        <MenuItem key={tower} value={tower}>
                          {tower}
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
                      value={selectedLevels}
                      onChange={e =>
                        setSelectedLevels(
                          typeof e.target.value === 'string'
                            ? e.target.value.split(',')
                            : e.target.value
                        )
                      }
                      renderValue={selected => selected.join(', ')}
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      {levelOptions.map(level => (
                        <MenuItem key={level} value={level}>
                          <Checkbox checked={selectedLevels.indexOf(level) > -1} />
                          <ListItemText primary={level} />
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      value={selectedLevels[0] || ''}
                      onChange={e => setSelectedLevels([e.target.value])}
                      style={{ minWidth: 120, width: "100%" }}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {levelOptions.map(level => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </label>
              )}
              {/* Lugar */}
              {filter === 'sensor' && (
                <label style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  Lugar
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
                    renderValue={selected => selected.join(', ')}
                    style={{ minWidth: 120, width: "100%" }}
                  >
                    {placeOptions.map(place => (
                      <MenuItem key={place} value={place}>
                        <Checkbox checked={selectedPlaces.indexOf(place) > -1} />
                        <ListItemText primary={place} />
                      </MenuItem>
                    ))}
                  </Select>
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