import React, { useState, useMemo } from 'react';
import './info.css';
import { useFetchParkingInfo } from '../api/hooks/useFetchParkingInfo';
import { useUpdateAlias } from '../api/hooks/useUpdateAlias';

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

// --- EditableCell component ---
const EditableCell = ({ value, onSave, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  return (
    <td className={!isEditing ? "editable-td" : ""}>
      {isEditing ? (
        <div className="editable-cell-editing">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="editable-cell-input"
          />
          <button className="editable-cell-btn" onClick={handleSave}>Guardar</button>
          <button className="editable-cell-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
        </div>
      ) : (
        <div className="editable-cell-display">
          <span>{value}</span>
          {!disabled && (
            <span
              className="editable-cell-pencil"
              title="Editar"
              onClick={() => setIsEditing(true)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') setIsEditing(true);
              }}
              role="button"
              aria-label="Editar"
            >
              ✎
            </span>
          )}
        </div>
      )}
    </td>
  );
};

const Info = ({ sidebarCollapsed }) => {
  const userAdmin='fb713fca-4cbc-44b1-8a25-c6685c3efd31';
  const userNoAdmin='b4fa4f93-c6b6-440d-bed2-2f8820c49a08';  
  const userId = userAdmin; // Example user ID
  const { data, loading, error } = useFetchParkingInfo(userId);
  const { update, loading: updating, error: updateError } = useUpdateAlias();

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

  // Helper to update alias
  const handleAliasUpdate = async ({ field, new_value, parking_id, floor }) => {
    try {
      await update({ user_id: userId, field, new_value, parking_id, floor });
      window.location.reload(); // Or refetch data for a better UX
    } catch (e) {
      // Optionally show error
    }
  };

  const isRequestingUserAdmin = Array.isArray(data) && data.length > 0
  ? data[0].is_requesting_user_admin === true
  : false;

  return (
    <div className={`info${sidebarCollapsed ? ' collapsed' : ''}`}>
      <div className="info-header-row">
        <h1 className="info-title">Info</h1>
      </div>
      <h4 className="info-subtitle">Residencial Lomas de Bezares</h4>
      {loading && <div>Cargando información...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      {updateError && <div style={{ color: 'red' }}>Error al actualizar: {updateError.message}</div>}
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
                  <td>
                    <EditableCell
                      value={row.estacionamiento}
                      onSave={newVal =>
                        handleAliasUpdate({
                          field: 'parking_alias',
                          new_value: newVal,
                          parking_id: row.parking_id,
                        })
                      }
                        disabled={!isRequestingUserAdmin}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={row.complejo}
                      onSave={newVal =>
                        handleAliasUpdate({
                          field: 'complex',
                          new_value: newVal,
                          parking_id: row.parking_id,
                        })
                      }
                      disabled={!isRequestingUserAdmin}
                    />
                  </td>
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
                              <td className="user-admin-cell">
                                <span className="user-admin-username">{u.username}</span>
                                {u.administrator === 't' && (
                                  <span className="user-admin-admin" title="Administrador">admin</span>
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
                              <td>
                                <EditableCell
                                  value={p.nombre}
                                  onSave={newVal =>
                                    handleAliasUpdate({
                                      field: 'floor_alias',
                                      new_value: newVal,
                                      parking_id: row.parking_id,
                                      floor: i + 1 // Adjust if your floor index is different
                                    })
                                  }
                                  disabled={!isRequestingUserAdmin}
                                />
                              </td>
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