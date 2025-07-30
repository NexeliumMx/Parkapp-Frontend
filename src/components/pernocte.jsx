import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';

const rows = [
  {
    complejo: 'Complex 1',
    estacionamiento: 'Parking 1',
    nivel: 'Nivel 2',
    lugar: 'A-15',
    tiempoLlegada: '2025-07-29 08:15',
    antiguedad: '3 horas'
  },
  {
    complejo: 'Complex 2',
    estacionamiento: 'Parking 2',
    nivel: 'Nivel 1',
    lugar: 'B-03',
    tiempoLlegada: '2025-07-29 06:30',
    antiguedad: '5 horas'
  }
];

// Get unique values for filters
const complejos = [...new Set(rows.map(r => r.complejo))];
const estacionamientos = [...new Set(rows.map(r => r.estacionamiento))];
const niveles = [...new Set(rows.map(r => r.nivel))];

const Pernocte = () => {
  const [fComplejo, setFComplejo] = useState('');
  const [fEstacionamiento, setFEstacionamiento] = useState('');
  const [fNivel, setFNivel] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort logic
  const filteredRows = rows
    .filter(r =>
      (!fComplejo || r.complejo === fComplejo) &&
      (!fEstacionamiento || r.estacionamiento === fEstacionamiento) &&
      (!fNivel || r.nivel === fNivel)
    )
    .sort((a, b) => {
      const dateA = new Date(a.tiempoLlegada);
      const dateB = new Date(b.tiempoLlegada);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <div>
      <div className="mapa-header-row">
        <h1 className="mapa-title">Monitor de pernocte</h1>
      </div>
      <h4 className="mapa-subtitle">Visualiza y filtra los vehículos que han pernoctado en el lote</h4>
      <Card style={{ marginBottom: 24 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros y ordenamiento</Typography>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <FormControl size="small" style={{ minWidth: 140 }}>
              <InputLabel id="complejo-label">Complejo</InputLabel>
              <Select
                labelId="complejo-label"
                value={fComplejo}
                label="Complejo"
                onChange={e => setFComplejo(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {complejos.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" style={{ minWidth: 140 }}>
              <InputLabel id="estacionamiento-label">Estacionamiento</InputLabel>
              <Select
                labelId="estacionamiento-label"
                value={fEstacionamiento}
                label="Estacionamiento"
                onChange={e => setFEstacionamiento(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {estacionamientos.map(e => (
                  <MenuItem key={e} value={e}>{e}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" style={{ minWidth: 140 }}>
              <InputLabel id="nivel-label">Nivel</InputLabel>
              <Select
                labelId="nivel-label"
                value={fNivel}
                label="Nivel"
                onChange={e => setFNivel(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {niveles.map(n => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" style={{ minWidth: 180 }}>
              <InputLabel id="sort-label">Ordenar por llegada</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOrder}
                label="Ordenar por llegada"
                onChange={e => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Más reciente primero</MenuItem>
                <MenuItem value="desc">Más antiguo primero</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                setFComplejo('');
                setFEstacionamiento('');
                setFNivel('');
                setSortOrder('desc');
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Complejo</TableCell>
              <TableCell>Estacionamiento</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Lugar</TableCell>
              <TableCell>Tiempo de llegada</TableCell>
              <TableCell>Antigüedad en el lote</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.complejo}</TableCell>
                <TableCell>{row.estacionamiento}</TableCell>
                <TableCell>{row.nivel}</TableCell>
                <TableCell>{row.lugar}</TableCell>
                <TableCell>{row.tiempoLlegada}</TableCell>
                <TableCell>{row.antiguedad}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Pernocte;