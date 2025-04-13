// src/components/StatusBar/StatusBar.jsx
import React from 'react';
import './StatusBar.css';
import { FiDatabase, FiClock } from 'react-icons/fi'; // Example icons

// Accept message and potentially other info later (type, progress)
function StatusBar({
    message = "Ready",
    connectionStatus = ":memory:", // Mock connection status
    queryTime = null // Mock query time in ms
}) {
  return (
    <div className="status-bar">
      {/* Main Message Area */}
      <span className="status-message">{message}</span>

      {/* Spacer */}
      <div className="status-spacer"></div>

      {/* Query Time (Optional) */}
      {queryTime !== null && (
          <span className="status-section query-time" title="Last Query Execution Time">
              <FiClock size="0.9em" style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}/>
              {queryTime < 1 ? (queryTime * 1000).toFixed(1) + ' µs' : queryTime < 1000 ? queryTime.toFixed(1) + ' ms' : (queryTime / 1000).toFixed(2) + ' s'}
          </span>
      )}

      {/* Connection Status */}
      <span className="status-section connection-status" title="Database Connection">
         <FiDatabase size="0.9em" style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}/>
         {connectionStatus || "Not Connected"}
      </span>
    </div>
  );
}

export default StatusBar;
