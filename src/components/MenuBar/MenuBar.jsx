// src/components/MenuBar/MenuBar.jsx
import React from 'react';
import './MenuBar.css';

// Mock handlers - replace with Tauri API calls later
const handleMenuClick = (action) => {
    alert(`Menu Action (Not Implemented): ${action}`);
    console.log(`Menu Action: ${action}`);
    // Later: invoke(`menu_action_${action}`) or use Tauri event listeners
};

function MenuBar() {
  return (
    <div className="menu-bar" role="menubar" aria-label="Main Menu">
      <div className="menu-item" role="menuitem" aria-haspopup="true">
        <span title="File Operations">File</span>
        <div className="dropdown-content" role="menu">
          <button
            onClick={() => handleMenuClick('new_memory_db')}
            role="menuitem"
            title="Create a new in-memory database"
          >
            New In-Memory DB
          </button>
          <button
            onClick={() => handleMenuClick('open_db')}
            role="menuitem"
            title="Open an existing SQLite database file"
          >
            Open Database...
          </button>
          <button
            onClick={() => handleMenuClick('save_db_as')}
            role="menuitem"
            title="Save current database to a file"
          >
            Save Database As...
          </button>
          <hr />
          <button
            onClick={() => handleMenuClick('refresh_schema')}
            role="menuitem"
            title="Refresh the database schema (F5)"
          >
            Refresh Schema (F5)
          </button>
          <hr />
          <button
            onClick={() => handleMenuClick('exit')}
            role="menuitem"
            title="Close the application"
          >
            Exit
          </button>
        </div>
      </div>
      {/* Add other top-level menus later (Edit, View, Help?) */}
      {/* <div className="menu-item"><span>Edit</span></div> */}
      {/* <div className="menu-item"><span>Help</span></div> */}
    </div>
  );
}

export default MenuBar;
