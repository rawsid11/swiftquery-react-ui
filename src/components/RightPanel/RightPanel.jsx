// src/components/RightPanel/RightPanel.jsx
import React from 'react';
import './RightPanel.css';

// Accept statsInfo prop
function RightPanel({ statsInfo }) {
  const { columnName, stats } = statsInfo;

  // Helper to format numbers nicely
  const formatNumber = (num) => {
      if (num === null || num === undefined) return 'N/A';
      // Basic formatting, could use Intl.NumberFormat for locale support
      if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(2);
      if (Math.abs(num) > 1e9) return num.toExponential(2);
      return num.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }

  return (
    <> {/* Use fragment */}
      <h2 className="panel-header-label">Column Statistics</h2>
      <div className="stats-content-display">
        {columnName && stats ? (
          <div className="stats-details">
            <div className="stats-header">
                Column: <strong>{columnName}</strong>
            </div>
            {/* <div className="stats-item">Data Type: {statsInfo.dataType || 'N/A'}</div> */}

            <div className="stats-group">Stats (Mock Data):</div>
            <div className="stats-item">Total Rows (in result): {formatNumber(stats.total)}</div>
            <div className="stats-item">Non-Null Count: {formatNumber(stats.nonNull)}</div>
            <div className="stats-item">Null Count: {formatNumber(stats.nulls)} ({stats.total > 0 ? ((stats.nulls / stats.total) * 100).toFixed(1) : '0.0'}%)</div>
            <div className="stats-item">Distinct Values: {formatNumber(stats.distinct)}</div>

            {/* Conditionally show numeric stats */}
            {stats.mean !== undefined && (
                <>
                    <div className="stats-group">Numeric (Mock):</div>
                    <div className="stats-item">Min: {formatNumber(stats.min)}</div>
                    <div className="stats-item">Max: {formatNumber(stats.max)}</div>
                    <div className="stats-item">Mean: {formatNumber(stats.mean)}</div>
                    {/* Add Median, StdDev etc. when calculated */}
                </>
            )}

            {/* Add Top Values later */}

          </div>
        ) : (
          <div className="stats-content-placeholder">
            Click on a result column header to see stats.
          </div>
        )}
      </div>
    </>
  );
}

export default RightPanel;
