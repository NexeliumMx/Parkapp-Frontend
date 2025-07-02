import React from "react";
import "./dashboard.css";
import { Gauge } from "@mui/x-charts/Gauge";
import { Divider } from "@mui/material";
import { useFetchParkingLevels } from "../api/hooks/fetchParkingLevels";

const Dashboard = () => {
  const { data, isLoading, error } = useFetchParkingLevels("fb713fca-4cbc-44b1-8a25-c6685c3efd31");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  // Group by complex, then by parking_id
  const complexes = data
    ? data.reduce((acc, row) => {
        if (!acc[row.complex]) acc[row.complex] = {};
        const parkings = acc[row.complex];
        if (!parkings[row.parking_id]) {
          parkings[row.parking_id] = {
            parking: row.parking_alias,
            parking_id: row.parking_id,
            levels: [],
            totalCapacity: 0,
            totalOccupied: 0,
          };
        }
        parkings[row.parking_id].levels.push(row);
        parkings[row.parking_id].totalCapacity += row.capacity;
        parkings[row.parking_id].totalOccupied += row.occupied;
        return acc;
      }, {})
    : {};

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Home page</h1>
      <h4 className="dashboard-subtitle">Residencial Lomas de Bezares</h4>
      {/* Render complexes and their parkings */}
      {Object.entries(complexes).map(([complexName, parkings]) => (
        <div key={complexName} className="complex-section">
          <h2 className="complex-title">{complexName}</h2>
          <Divider sx={{ my: 1, borderColor: "#000000", borderWidth: 2, borderRadius:3 }} />          <div className="dashboard-cards">
            {Object.values(parkings).map(({ parking, parking_id, levels }) => {
              // Ensure numeric addition
              const totalCapacity = levels.reduce((sum, level) => sum + Number(level.capacity), 0);
              const totalOccupied = levels.reduce((sum, level) => sum + Number(level.occupied), 0);
              const totalVacant = totalCapacity - totalOccupied;
              return (
                <div key={parking_id} className="card">
                  <div className="card-top">
                    <div className="card-header">
                      <h2 className="card-title">{parking}</h2>
                      <div className="card-divider"></div>
                      <div className="card-info-container">
                        <p className="card-info">{levels.length} niveles</p>
                        <p className="card-info">{totalCapacity} lugares</p>
                      </div>
                    </div>
                    <div className="card-top-gauge">
                      <Gauge
                        value={totalCapacity ? (totalVacant / totalCapacity) * 100 : 0}
                        startAngle={0}
                        endAngle={360}
                        innerRadius="80%"
                        outerRadius="100%"
                        text={null}
                      />
                      <div className="top-gauge-overlay">
                        <span className="top-gauge-vacant">
                          {Math.round(totalCapacity ? (totalVacant / totalCapacity) * 100 : 0)}%
                        </span>
                        <span className="top-gauge-label">Disponibilidad</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-levels">
                    {levels.map(level => (
                      <div key={level.floor} className="level-box">
                        <p className="level-name">{level.floor_alias}</p>
                        <div className="level-vacant">
                          <div className="gauge-container">
                            <Gauge
                              value={Number(level.capacity) ? ((Number(level.capacity) - Number(level.occupied)) / Number(level.capacity)) * 100 : 0}
                              startAngle={0}
                              endAngle={360}
                              innerRadius="80%"
                              outerRadius="100%"
                              text={null}
                            />
                            <div className="gauge-overlay">
                              <span className="gauge-vacant">{Number(level.capacity) - Number(level.occupied)}</span>
                              <span className="gauge-label">vacantes</span>
                            </div>
                          </div>
                        </div>
                        <p className="level-status">Disponibilidad</p>
                      </div>
                    ))}
                  </div>
                  <div className="card-buttons">
                    <button className="card-button">Ir a mapa</button>
                    <button className="card-button">Ir a tabla</button>
                  </div>
                </div>
              );
            })}
          </div>
          <Divider sx={{ marginTop: 5, borderColor: "#000000", borderWidth: 2, borderRadius:3 }} />
        </div>
      ))}
    </div>
  );
};

export default Dashboard;