// src/components/SchemaTree/TreeNode.jsx
import React, { useState } from 'react';
import './SchemaTree.css';
import { FiFolder, FiFile, FiDatabase, FiEye, FiMinus } from 'react-icons/fi';
import { VscSymbolNamespace } from "react-icons/vsc";
import { BsDot } from "react-icons/bs";

const getIcon = (type, isOpen) => {
  const iconProps = { size: '1.1em', className: 'node-icon-svg', style: { verticalAlign: 'middle' } };
  switch (type) {
    case 'database': return <FiDatabase {...iconProps} />;
    case 'schema': return <VscSymbolNamespace {...iconProps} />;
    case 'table': return <FiFile {...iconProps} />;
    case 'view': return <FiEye {...iconProps} />;
    case 'column': return <BsDot {...iconProps} style={{ marginLeft: '-2px', marginRight: '1px', verticalAlign: 'middle' }}/>;
    default: return <FiMinus {...iconProps} />;
  }
};

function TreeNode({ node, level = 0, onItemClick, parentSchema = null, selectedNodeId, setSelectedNodeId }) {
  // Guard clause
  if (!node) {
    console.warn('TreeNode received undefined node');
    return null;
  }

  const [isOpen, setIsOpen] = useState(level < 1);
  const hasChildren = node && node.children && Array.isArray(node.children) && node.children.length > 0;
  const nodeType = node.type || 'unknown';

  const handleClick = (e) => {
    e.stopPropagation();

    // Set the selected node ID when clicked
    if (setSelectedNodeId) {
      setSelectedNodeId(node.id); // Select this node when clicked
    }

    // Trigger action only for tables/views
    if ((nodeType === 'table' || nodeType === 'view') && onItemClick) {
      onItemClick(parentSchema, node.name, nodeType);
    }

    // Toggle expand/collapse
    if (hasChildren && nodeType !== 'column') {
      setIsOpen(!isOpen);
    }
  };

  const getNodeLabel = () => {
    if (!node.name) return 'Unnamed';
    if (nodeType === 'column') {
      return `${node.name} (${node.dataType?.toUpperCase() || 'UNKNOWN'})`;
    }
    return node.name;
  };

  const getCursorStyle = () => {
    // Make all nodes selectable by default now
    return 'pointer';
  };

  // Get appropriate tooltip text based on node type
  const getTooltipText = () => {
    switch(nodeType) {
      case 'database':
        return `Database: ${node.name}`;
      case 'schema':
        return `Schema: ${node.name}`;
      case 'table':
        return `Click to generate SELECT query for table: ${node.name}`;
      case 'view':
        return `Click to generate SELECT query for view: ${node.name}`;
      case 'column':
        const nullable = node.isNullable ? 'NULL' : 'NOT NULL';
        const pk = node.isPrimaryKey ? ' (Primary Key)' : '';
        return `Column: ${node.name} - ${node.dataType?.toUpperCase() || 'UNKNOWN'} ${nullable}${pk}`;
      default:
        return node.name;
    }
  };

  // Check if the current node is selected
  const isSelected = node.id === selectedNodeId;

  return (
    <div className={`tree-node level-${level} type-${nodeType}`}>
      <div
        // Add conditional 'selected' class
        className={`node-content ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        style={{ cursor: getCursorStyle() }}
        title={getTooltipText()}
        role={nodeType === 'table' || nodeType === 'view' ? 'button' : 'treeitem'}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={isSelected}
        tabIndex={0} // Make focusable with keyboard
        onKeyDown={(e) => {
          // Handle keyboard navigation
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
      >
        <span
          className={`toggle-icon ${hasChildren && nodeType !== 'column' ? 'has-children' : ''} ${isOpen ? 'open' : 'closed'}`}
          onClick={(e) => {
            if (hasChildren && nodeType !== 'column') {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }
          }}
          role={hasChildren && nodeType !== 'column' ? 'button' : undefined}
          aria-label={hasChildren && nodeType !== 'column' ? (isOpen ? 'Collapse' : 'Expand') : undefined}
          title={hasChildren && nodeType !== 'column' ? (isOpen ? 'Collapse' : 'Expand') : undefined}
        >
          {hasChildren && nodeType !== 'column' ? (isOpen ? '▼' : '►') : ''}
        </span>
        <span className="node-icon-container" aria-hidden="true">
          {getIcon(nodeType, isOpen)}
        </span>
        <span className="node-label">
          {getNodeLabel()}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div className="node-children" role="group">
          {node.children.map((childNode, index) => (
            <TreeNode
              key={childNode?.id || `child-${index}`}
              node={childNode}
              level={level + 1}
              onItemClick={onItemClick}
              parentSchema={nodeType === 'schema' ? node.name : parentSchema}
              // Pass selection props down recursively
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
            />
          ))}
        </div>
      )}

      {!hasChildren && nodeType === 'schema' && isOpen && (
        <div className="node-children" role="group">
          <div className={`tree-node level-${level + 1} type-empty`}>
            <div className="node-content empty-node">
              (empty schema)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TreeNode;
