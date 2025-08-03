import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Nightlight } from "@mui/icons-material"; // MUI moon icon
import "./sidebar.css";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link 
              to="/" 
              className={`sidebar-link${location.pathname === "/" ? " active" : ""}`}
            >
              <span className="sidebar-icon">🏠</span>
              {!collapsed && <span className="sidebar-label">Home</span>}
            </Link>
          </li>
          <li>
            <Link 
              to="/mapa" 
              className={`sidebar-link${location.pathname === "/mapa" ? " active" : ""}`}
            >
              <span className="sidebar-icon">🗺️</span>
              {!collapsed && <span className="sidebar-label">Mapa</span>}
            </Link>
          </li>
          <li>
            <Link 
              to="/graficas" 
              className={`sidebar-link${location.pathname === "/graficas" ? " active" : ""}`}
            >
              <span className="sidebar-icon">📊</span>
              {!collapsed && <span className="sidebar-label">Gráficas</span>}
            </Link>
          </li>
          <li>
            <Link 
              to="/tablas" 
              className={`sidebar-link${location.pathname === "/tablas" ? " active" : ""}`}
            >
              <span className="sidebar-icon">📋</span>
              {!collapsed && <span className="sidebar-label">Tabla</span>}
            </Link>
          </li>
          <li>
            <Link 
              to="/pernocte" 
              className={`sidebar-link${location.pathname === "/pernocte" ? " active" : ""}`}
            >
              <span className="sidebar-icon"><Nightlight fontSize="small" /></span>
              {!collapsed && <span className="sidebar-label">Pernocte</span>}
            </Link>
          </li>
          <li>
            <Link 
              to="/info" 
              className={`sidebar-link${location.pathname === "/info" ? " active" : ""}`}
            >
              <span className="sidebar-icon">ℹ️</span>
              {!collapsed && <span className="sidebar-label">Info</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;