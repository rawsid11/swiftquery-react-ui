// src/components/CenterPanel/CenterPanel.jsx
import React from 'react';
import './CenterPanel.css';
import QueryCell from '../QueryCell/QueryCell';

// Accept new props
function CenterPanel({
  cells, // Now contains full cell state (query, results, error...)
  deleteCell,
  updateCellQuery, // Still needed for direct edits in AceEditor
  runQuery,        // New: function to trigger query execution
  activeCellId,
  setActiveCellId,
  onColumnHeaderClick // New: function to handle stats trigger
}) {

  return (
    <>
      <div className="query-area-container">
         {cells.map((cell) => (
            <QueryCell
              key={cell.id}
              // Pass the whole cell object
              cellData={cell}
              // Pass handlers
              onQueryChange={(newQuery) => updateCellQuery(cell.id, newQuery)}
              onRunQuery={() => runQuery(cell.id)}
              onDelete={() => deleteCell(cell.id)}
              onColumnHeaderClick={onColumnHeaderClick} // Pass down
              // Active state management
              isActive={cell.id === activeCellId}
              onFocus={() => setActiveCellId(cell.id)}
            />
         ))}
         {cells.length === 0 && (
            <div className="no-cells-placeholder">
                Click "Add Query Cell" to start.
            </div>
         )}
      </div>
    </>
  );
}

export default CenterPanel;
