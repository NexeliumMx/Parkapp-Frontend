import React, { useState, useMemo } from 'react';
import './info.css';
import { useFetchParkingInfo } from '../api/hooks/useFetchParkingInfo';

// Helper to parse authorized_users string to array of { user_id, username, administrator }
function parseAuthorizedUsers(str) {
  if (!str) return [];
  try {
    // Remove curly braces and split by '","'
    return str
      .replace(/^{|}$/g, '')
      .split(/","/)
      .map(s => {
        // Remove any leading/trailing quotes and parentheses
        const clean = s.replace(/^"?\(|\)"?$/g, '');
        const [user_id, username, administrator] = clean.split(',');
        return { user_id, username, administrator };
      });
  } catch {
    return [];
  }
}

// Group floors and users by parking_id
function groupParkingData(data) {
  if (!Array.isArray(data)) return [];
  const map = new Map();
  data.forEach(row => {
    if (!map.has(row.parking_id)) {
      map.set(row.parking_id, {
        parking_id: row.parking_id,
        estacionamiento: row.parking_alias,
        complejo: row.complex,
        usuarios: parseAuthorizedUsers(row.authorized_users),
        pisos: [],
        lugares: row.parking_sensors,
        instalacion: row.installation_date,
        mantenimiento: row.maintenance_date,
      });
    }
    map.get(row.parking_id).pisos.push({
      nombre: row.floor_alias,
      sensores: row.floor_sensors,
    });
  });
  return Array.from(map.values());
}

const Info = () => {
  const userId = 'fb713fca-4cbc-44b1-8a25-c6685c3efd31'; // Example user ID
  const { data, loading, error } = useFetchParkingInfo(userId);

  // Only one expanded at a time: { type: 'usuarios'|'pisos', idx: number } or null
  const [expanded, setExpanded] = useState(null);

  const estacionamientos = useMemo(() => groupParkingData(data), [data]);

  const handleExpand = (type, idx) => {
    if (expanded && expanded.type === type && expanded.idx === idx) {
      setExpanded(null);
    } else {
      setExpanded({ type, idx });
    }
  };

  return (
    <div className="header">
      <h1 className="title">Info</h1>
      <h4 className="subtitle">Residencial Lomas de Bezares</h4>
      {loading && <div>Cargando información...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      {!loading && !error && (
        <table className="info-table">
          <thead>
            <tr>
              <th>Estacionamiento</th>
              <th>Complejo</th>
              <th>Usuarios autorizados</th>
              <th>Número de pisos</th>
              <th>Número de lugares</th>
              <th>Fecha de instalación</th>
              <th>Fecha de mantenimiento</th>
            </tr>
          </thead>
          <tbody>
            {estacionamientos.map((row, idx) => (
              <React.Fragment key={row.parking_id}>
                <tr>
                  <td>{row.estacionamiento}</td>
                  <td>{row.complejo}</td>
                  <td
                    className="expandable-cell"
                    onClick={() => handleExpand('usuarios', idx)}
                    tabIndex={0}
                    aria-expanded={expanded?.type === 'usuarios' && expanded.idx === idx}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {row.usuarios.length}
                      <span className="expand-icon">
                        {expanded?.type === 'usuarios' && expanded.idx === idx ? '▼' : '▶'}
                      </span>
                    </span>
                  </td>
                  <td
                    className="expandable-cell"
                    onClick={() => handleExpand('pisos', idx)}
                    tabIndex={0}
                    aria-expanded={expanded?.type === 'pisos' && expanded.idx === idx}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {row.pisos.length}
                      <span className="expand-icon">
                        {expanded?.type === 'pisos' && expanded.idx === idx ? '▼' : '▶'}
                      </span>
                    </span>
                  </td>
                  <td>{row.lugares}</td>
                  <td>{row.instalacion ? new Date(row.instalacion).toLocaleDateString() : ''}</td>
                  <td>{row.mantenimiento ? new Date(row.mantenimiento).toLocaleDateString() : ''}</td>
                </tr>
                {expanded?.type === 'usuarios' && expanded.idx === idx && (
                  <tr>
                    <td colSpan={7}>
                      <table className="sub-table">
                        <thead>
                          <tr>
                            <th>Usuario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.usuarios.map((u, i) => (
                            <tr key={i}>
                              <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {u.username}
                                {u.administrator === 't' && (
                                  <span
                                    title="Administrador"
                                    style={{
                                      color: '#1976d2',
                                      fontWeight: 'bold',
                                      marginLeft: 4,
                                      fontSize: '1.1em',
                                    }}
                                  >
                                    ★
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
                {expanded?.type === 'pisos' && expanded.idx === idx && (
                  <tr>
                    <td colSpan={7}>
                      <table className="sub-table">
                        <thead>
                          <tr>
                            <th>Nombre del piso</th>
                            <th>Sensores</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.pisos.map((p, i) => (
                            <tr key={i}>
                              <td>{p.nombre}</td>
                              <td>{p.sensores}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Info;