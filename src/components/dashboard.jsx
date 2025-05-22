import React from "react";
import "./dashboard.css";
import { Gauge } from "@mui/x-charts/Gauge";

const parkingData = [
  { parking: "Torre A", levels: [{ name: "Nivel 1", vacant: 7, capacity: 200 }, { name: "Nivel S2", vacant: 63, capacity: 200 }] },
  { parking: "Torre B", levels: [{ name: "Nivel 1", vacant: 7, capacity: 200 }, { name: "Nivel S2", vacant: 63, capacity: 200 }] },
  { parking: "Torre C", levels: [{ name: "Nivel 1", vacant: 7, capacity: 200 }, { name: "Nivel S2", vacant: 63, capacity: 200 }, { name: "Nivel S3", vacant: 2, capacity: 200 }] },
  { parking: "Torre D", levels: [{ name: "Nivel 1", vacant: 7, capacity: 200 }, { name: "Nivel S2", vacant: 63, capacity: 200 }, { name: "Nivel S3", vacant: 2, capacity: 200 }] },
];

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Home page</h1>
      <h4 className="dashboard-subtitle">Residencial Lomas de Bezares</h4>
      <div className="dashboard-cards">
        {parkingData.map(({ parking, levels }) => {
          // Calculate total vacant and capacity for the tower
          const totalVacant = levels.reduce((sum, level) => sum + level.vacant, 0);
          const totalCapacity = levels.reduce((sum, level) => sum + level.capacity, 0);
          
          return (
            <div key={parking} className="card">
              {/* Top section: grid container with header (title, divider, info) and top gauge */}
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

              {/* Levels Section */}
              <div className="card-levels">
                {levels.map(({ name, vacant, capacity }) => (
                  <div key={name} className="level-box">
                    <p className="level-name">{name}</p>
                    <div className="level-vacant">
                      <div className="gauge-container">
                        <Gauge
                          value={capacity ? (vacant / capacity) * 100 : 0}
                          startAngle={0}
                          endAngle={360}
                          innerRadius="80%"
                          outerRadius="100%"
                          
                          text={null}
                        />
                        <div className="gauge-overlay">
                          <span className="gauge-vacant">{vacant}</span>
                          <span className="gauge-label">vacantes</span>
                        </div>
                      </div>
                    </div>
                    <p className="level-status">Disponibilidad</p>
                  </div>
                ))}
              </div>

              {/* Buttons Section */}
              <div className="card-buttons">
                <button className="card-button">Ir a mapa</button>
                <button className="card-button">Ir a tabla</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;