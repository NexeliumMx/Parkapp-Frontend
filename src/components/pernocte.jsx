import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Typography, CircularProgress, Alert } from '@mui/material';
import './pernocte.css';
import { usePernocte } from '../api/hooks/usePernocte';

const Pernocte = () => {
  const [fComplejo, setFComplejo] = useState('');
  const [fEstacionamiento, setFEstacionamiento] = useState('');
  const [fNivel, setFNivel] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const userID = 'fb713fca-4cbc-44b1-8a25-c6685c3efd31';
  const { data, loading, error } = usePernocte(userID);

  // Use fetched data or fallback to empty array
  const rows = Array.isArray(data) ? data : [];

  // Get unique values for filters, but filter dependent options
  const complejos = useMemo(() => [...new Set(rows.map(r => r.complex))], [rows]);

  // Filter estacionamientos based on selected complejo
  const estacionamientos = useMemo(() => {
    const filtered = fComplejo
      ? rows.filter(r => r.complex === fComplejo)
      : rows;
    return [...new Set(filtered.map(r => r.parking_alias))];
  }, [rows, fComplejo]);

  // Filter niveles based on selected complejo and estacionamiento
  const niveles = useMemo(() => {
    let filtered = rows;
    if (fComplejo) {
      filtered = filtered.filter(r => r.complex === fComplejo);
    }
    if (fEstacionamiento) {
      filtered = filtered.filter(r => r.parking_alias === fEstacionamiento);
    }
    return [...new Set(filtered.map(r => r.floor_alias))];
  }, [rows, fComplejo, fEstacionamiento]);

  // Filter and sort logic
  const filteredRows = useMemo(() => {
    return rows
      .filter(r =>
        (!fComplejo || r.complex === fComplejo) &&
        (!fEstacionamiento || r.parking_alias === fEstacionamiento) &&
        (!fNivel || r.floor_alias === fNivel)
      )
      .sort((a, b) => {
        const dateA = new Date(a.entry_time);
        const dateB = new Date(b.entry_time);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [rows, fComplejo, fEstacionamiento, fNivel, sortOrder]);

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
                onChange={e => {
                  setFComplejo(e.target.value);
                  setFEstacionamiento('');
                  setFNivel('');
                }}
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
                onChange={e => {
                  setFEstacionamiento(e.target.value);
                  setFNivel('');
                }}
                disabled={estacionamientos.length === 0}
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
                disabled={niveles.length === 0}
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
      {loading && (
        <div style={{ textAlign: 'center', margin: 32 }}>
          <CircularProgress />
        </div>
      )}
      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          Error al cargar los datos: {error.message}
        </Alert>
      )}
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
              <TableCell>Hora de cierre al llegar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, idx) => (
              <TableRow key={row.sensor_id || idx}>
                <TableCell>{row.complex}</TableCell>
                <TableCell>{row.parking_alias}</TableCell>
                <TableCell>{row.floor_alias}</TableCell>
                <TableCell>{row.sensor_alias}</TableCell>
                <TableCell>{new Date(row.entry_time).toLocaleString()}</TableCell>
                <TableCell>
                  {row.duration_parked
                    ? `${row.duration_parked.days || 0}d ${row.duration_parked.hours || 0}h ${row.duration_parked.minutes || 0}m`
                    : ''}
                </TableCell>
                <TableCell>{row.closing_time_on_arrival}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Pernocte;