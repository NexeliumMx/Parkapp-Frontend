import React, { useState } from 'react';
import './info.css';

// Example data with users and floors for demonstration
const estacionamientosData = [
  {
    estacionamiento: "Estacionamiento 1",
    complejo: "Complejo A",
    usuarios: 25,
    usuariosDetalle: [
      { username: "juanperez", asignado: "2023-01-10" },
      { username: "mariagomez", asignado: "2023-02-15" }
    ],
    pisos: 3,
    pisosDetalle: [
      { nombre: "Piso 1", sensores: 40 },
      { nombre: "Piso 2", sensores: 40 },
      { nombre: "Piso 3", sensores: 40 }
    ],
    lugares: 120,
    instalacion: "2022-01-15",
    mantenimiento: "2024-06-10"
  },
  {
    estacionamiento: "Estacionamiento 2",
    complejo: "Complejo B",
    usuarios: 18,
    usuariosDetalle: [
      { username: "carlossanchez", asignado: "2022-11-20" },
      { username: "lauradiaz", asignado: "2023-03-05" }
    ],
    pisos: 2,
    pisosDetalle: [
      { nombre: "Piso 1", sensores: 40 },
      { nombre: "Piso 2", sensores: 40 }
    ],
    lugares: 80,
    instalacion: "2021-09-10",
    mantenimiento: "2024-05-20"
  }
  // Puedes agregar más filas según sea necesario
];

const Info = () => {
  // Only one expanded at a time: { type: 'usuarios'|'pisos', idx: number } or null
  const [expanded, setExpanded] = useState(null);

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
          {estacionamientosData.map((row, idx) => (
            <React.Fragment key={idx}>
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
                    {row.usuarios}
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
                    {row.pisos}
                    <span className="expand-icon">
                      {expanded?.type === 'pisos' && expanded.idx === idx ? '▼' : '▶'}
                    </span>
                  </span>
                </td>
                <td>{row.lugares}</td>
                <td>{row.instalacion}</td>
                <td>{row.mantenimiento}</td>
              </tr>
              {expanded?.type === 'usuarios' && expanded.idx === idx && (
                <tr>
                  <td colSpan={7}>
                    <table className="sub-table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Fecha de asignación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.usuariosDetalle.map((u, i) => (
                          <tr key={i}>
                            <td>{u.username}</td>
                            <td>{u.asignado}</td>
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
                        {row.pisosDetalle.map((p, i) => (
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
    </div>
  );
};

export default Info;