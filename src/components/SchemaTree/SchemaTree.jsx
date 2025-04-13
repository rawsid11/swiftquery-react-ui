// src/components/SchemaTree/SchemaTree.jsx
import React, { useState, useEffect } from 'react';
import TreeNode from './TreeNode';
import './SchemaTree.css';
import { mockDatabaseSchema } from '../../mockSchemaData';

function SchemaTree({ onItemClick }) {
  const [schemaData, setSchemaData] = useState(null);
  // --- Add State for Selection ---
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  // --- End State ---

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mockDatabaseSchema && typeof mockDatabaseSchema === 'object') {
        setSchemaData(mockDatabaseSchema);
      } else {
        console.error('mockDatabaseSchema is undefined or not an object');
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!schemaData) {
    return (
      <div
        className="schema-tree loading"
        aria-live="polite"
        aria-busy="true"
      >
        Loading schema...
      </div>
    );
  }

  return (
    <div
      className="schema-tree"
      role="tree"
      aria-label="Database Schema"
    >
      {schemaData && (
        <TreeNode
          node={schemaData}
          onItemClick={onItemClick}
          level={0}
          // --- Pass Selection State Down ---
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          // --- End Pass Selection ---
        />
      )}
    </div>
  );
}

export default SchemaTree;
