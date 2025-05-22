import React from "react";
import "./topbar.css";


const Topbar = ({ collapsed, setCollapsed }) => (
  <header className="topbar">
    <button
      className="collapse-btn"
      onClick={() =>setCollapsed((c) => !c)}
      aria-label="Toggle sidebar"
      style={{ marginRight: 16 }}
    >
      {collapsed ? "☰" : "⮜"}
    </button>
    <div className="topbar-logo">PARKAPP</div>
    <div className="topbar-actions">
      <button className="topbar-btn" aria-label="Settings">
        <span role="img" aria-label="settings">⚙️</span>
      </button>
      <button className="topbar-btn" aria-label="Profile">
        <span role="img" aria-label="profile">👤</span>
      </button>
    </div>
  </header>
);

export default Topbar;