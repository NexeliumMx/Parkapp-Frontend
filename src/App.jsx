import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/dashboard";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import Tablas from "./components/tablas";
import Graficas from "./components/graficas";
import Mapa from "./components/mapa";
import Pernocte from "./components/pernocte";
import Info from "./components/info";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="layout">
          <div className={`sidebar${collapsed ? " collapsed" : ""}`}>
            <Sidebar collapsed={collapsed} />
          </div>
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard sidebarCollapsed={collapsed} />} />
              <Route path="/mapa" element={<Mapa sidebarCollapsed={collapsed} />} />
              <Route path="/graficas" element={<Graficas sidebarCollapsed={collapsed} />} />
              <Route path="/tablas" element={<Tablas sidebarCollapsed={collapsed} />} />
              <Route path="/pernocte" element={<Pernocte sidebarCollapsed={collapsed} />} />
              <Route path="/info" element={<Info sidebarCollapsed={collapsed} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
export default App;