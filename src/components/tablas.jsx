import React, {useState} from 'react';
import './tablas.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

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
const Tablas = () => {
  // Filter states
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedRow, setSelectedRow] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  
  // Sort states
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  //Filtro por años con rango enable
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
  // Get unique values for filters
  const uniqueTowers = [...new Set(datos.map(item => item.parking))];
  const availableLevels = [...new Set(datos
    .filter(item => !selectedTower || item.parking === selectedTower)
    .map(item => item.level))];
  const availableRows = [...new Set(datos
    .filter(item => 
      (!selectedTower || item.parking === selectedTower) &&
      (!selectedLevel || item.level === selectedLevel)
    )
    .map(item => item.row))].sort((a, b) => a - b);
  const availableColumns = [...new Set(datos
    .filter(item =>
      (!selectedTower || item.parking === selectedTower) &&
      (!selectedLevel || item.level === selectedLevel) &&
      (!selectedRow || item.row === Number(selectedRow))
    )
    .map(item => item.column))].sort((a, b) => a - b);

  // Filter data
  const filteredData = datos.filter(item =>
    (!selectedTower || item.parking === selectedTower) &&
    (!selectedLevel || item.level === selectedLevel) &&
    (!selectedRow || item.row === Number(selectedRow)) &&
    (!selectedColumn || item.column === Number(selectedColumn))
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    
    const factor = sortOrder === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * factor;
  });

  return (
    <div>
      <h1 className="tablas-title">Tablas de sensores</h1>
      <h4 className="tablas-subtitle">Residencial Lomas de Bezares</h4>
    <div className="tables-container">
      <div className="controls-container">
        {/* Filter Box */}
        <div className="filter-box">
          <h2>Filtros</h2>
          <div className="filter-content">
            <div className="filter-group">
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
                    setSelectedRow('');
                    setSelectedColumn('');
                  }}
                >
                  <MenuItem value="">Todas las torres</MenuItem>
                  {uniqueTowers.map(tower => (
                    <MenuItem key={tower} value={tower}>{tower}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="filter-group">
              <FormControl fullWidth>
                <InputLabel id="level-label">Nivel</InputLabel>
                <Select
                  labelId="level-label"
                  id="level"
                  value={selectedLevel}
                  label="Nivel"
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    setSelectedRow('');
                    setSelectedColumn('');
                  }}
                >
                  <MenuItem value="">Todos los niveles</MenuItem>
                  {availableLevels.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="filter-group">
              <FormControl fullWidth>
                <InputLabel id="row-label">Fila</InputLabel>
                <Select
                  labelId="row-label"
                  id="row"
                  value={selectedRow}
                  label="Fila"
                  onChange={(e) => {
                    setSelectedRow(e.target.value);
                    setSelectedColumn('');
                  }}
                >
                  <MenuItem value="">Todas las filas</MenuItem>
                  {availableRows.map(row => (
                    <MenuItem key={row} value={row}>Fila {row}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="filter-group">
              <FormControl fullWidth>
                <InputLabel id="column-label">Columna</InputLabel>
                <Select
                  labelId="column-label"
                  id="column"
                  value={selectedColumn}
                  label="Columna"
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <MenuItem value="">Todas las columnas</MenuItem>
                  {availableColumns.map(column => (
                    <MenuItem key={column} value={column}>Columna {column}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {/* Sort Box */}
        <div className="sort-box">
          <h2>Ordenar</h2>
          <div className="sort-content">
            <div className="sort-group">
              <label htmlFor="sortBy">Ordenar por</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sin orden</option>
                <option value="rotacion">Rotación</option>
                <option value="ocupacion">Ocupación</option>
              </select>
            </div>

            <div className="sort-group">
              <label htmlFor="sortOrder">Orden</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={!sortBy}
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Box */}
      <div className="content-box">
        <div className="filtros-rango-multilinea">
          {/* Año */}
          <div className="filtro-ano-rango">
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
</div>

          {/* Mes */}
          <div className="filtro-ano-rango">
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
</div>

          {/* Día */}
          <div className="filtro-ano-rango">
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
</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Torre</th>
              <th>Nivel</th>
              <th>Fila</th>
              <th>Columna</th>
              <th>Rotación</th>
              <th>Ocupación</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.sensor_id}>
                <td>{item.sensor_id}</td>
                <td>{item.parking}</td>
                <td>{item.level}</td>
                <td>{item.row}</td>
                <td>{item.column}</td>
                <td>{item.rotacion}</td>
                <td>{item.ocupacion}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default Tablas;