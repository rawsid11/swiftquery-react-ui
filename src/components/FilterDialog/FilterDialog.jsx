// src/components/FilterDialog/FilterDialog.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './FilterDialog.css';

// Define operators and whether they require a value input
const OPERATORS = [
  { value: 'contains', label: 'contains', requiresValue: true, tooltip: 'Value exists anywhere in the column' },
  { value: 'does_not_contain', label: 'does not contain', requiresValue: true, tooltip: 'Value does not exist in the column' },
  { value: 'starts_with', label: 'starts with', requiresValue: true, tooltip: 'Column begins with this value' },
  { value: 'ends_with', label: 'ends with', requiresValue: true, tooltip: 'Column ends with this value' },
  { value: '=', label: '=', requiresValue: true, tooltip: 'Exact match (equals)' },
  { value: '<>', label: '<>', requiresValue: true, tooltip: 'Not equal to value' },
  { value: '>', label: '>', requiresValue: true, tooltip: 'Greater than value' },
  { value: '>=', label: '>=', requiresValue: true, tooltip: 'Greater than or equal to value' },
  { value: '<', label: '<', requiresValue: true, tooltip: 'Less than value' },
  { value: '<=', label: '<=', requiresValue: true, tooltip: 'Less than or equal to value' },
  { value: 'is_null', label: 'is null', requiresValue: false, tooltip: 'Column has no value (NULL)' },
  { value: 'is_not_null', label: 'is not null', requiresValue: false, tooltip: 'Column has any value (not NULL)' },
  { value: 'in', label: 'in (comma-sep)', requiresValue: true, tooltip: 'Value is in comma-separated list' },
  { value: 'not_in', label: 'not in (comma-sep)', requiresValue: true, tooltip: 'Value is not in comma-separated list' },
];

const getOperatorRequiresValue = (opValue) => {
    const op = OPERATORS.find(o => o.value === opValue);
    return op ? op.requiresValue : true; // Default to true if operator not found
}

function FilterDialog({
    isOpen,
    onClose,
    onApply,
    columnNames = [], // Default to empty array
    initialFilters = [] // Allow pre-populating filters
}) {
    const [filters, setFilters] = useState([]);
    const dialogRef = useRef(null);
    const initialFocusRef = useRef(null);

    // Initialize or reset filters when the dialog opens or initialFilters change
    useEffect(() => {
        if (isOpen) {
            const startingFilters = initialFilters && initialFilters.length > 0
                ? initialFilters.map(f => ({ ...f, id: uuidv4() })) // Add unique IDs if missing
                : [{ id: uuidv4(), column: columnNames[0] || '', operator: OPERATORS[0].value, value: '' }];
            setFilters(startingFilters);

            // Focus the first input when dialog opens
            setTimeout(() => {
                if (initialFocusRef.current) {
                    initialFocusRef.current.focus();
                }
            }, 100);
        }
    }, [isOpen, initialFilters, columnNames]);

    // Handle escape key to close dialog
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleAddFilterRow = useCallback(() => {
        setFilters(prev => [...prev, {
            id: uuidv4(),
            column: columnNames[0] || '',
            operator: OPERATORS[0].value,
            value: ''
        }]);
    }, [columnNames]);

    const handleRemoveFilterRow = useCallback((idToRemove) => {
        setFilters(prev => prev.filter(f => f.id !== idToRemove));
    }, []);

    const handleFilterChange = useCallback((id, field, newValue) => {
        setFilters(prev => prev.map(f => {
            if (f.id === id) {
                const updatedFilter = { ...f, [field]: newValue };
                // If operator changes, clear value if it's no longer required
                if (field === 'operator' && !getOperatorRequiresValue(newValue)) {
                    updatedFilter.value = '';
                }
                return updatedFilter;
            }
            return f;
        }));
    }, []);

    const handleClearAll = useCallback(() => {
        setFilters([{ id: uuidv4(), column: columnNames[0] || '', operator: OPERATORS[0].value, value: '' }]);
    }, [columnNames]);

    const handleApplyFilters = useCallback(() => {
        // Basic validation: check if required values are filled
        let isValid = true;
        for (const f of filters) {
            if (getOperatorRequiresValue(f.operator) && !f.value.trim()) {
                alert(`Please provide a value for the filter:\n'${f.column}' ${f.operator} ?`);
                isValid = false;
                break; // Stop validation on first error
            }
        }

        if (isValid) {
            // Remove temporary ID before applying
            const filtersToApply = filters.map(({ id, ...rest }) => rest);
            console.log('Applying filters:', filtersToApply);
            onApply(filtersToApply); // Pass validated filters to parent
            onClose(); // Close dialog after applying
        }
    }, [filters, onApply, onClose]);


    if (!isOpen) {
        return null; // Don't render anything if closed
    }

    // Prevent clicks inside the dialog from closing it
    const handleDialogClick = (e) => {
        e.stopPropagation();
    };

    // Get operator tooltip
    const getOperatorTooltip = (operatorValue) => {
        const op = OPERATORS.find(o => o.value === operatorValue);
        return op ? op.tooltip : '';
    };

    return (
        <div
            className="filter-dialog-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-dialog-title"
        >
            <div
                className="filter-dialog-content"
                onClick={handleDialogClick}
                ref={dialogRef}
            >
                <h2 id="filter-dialog-title">Filter Results</h2>

                <div className="filter-rows-container">
                    {filters.map((filter, index) => {
                        const requiresValue = getOperatorRequiresValue(filter.operator);
                        const operatorTooltip = getOperatorTooltip(filter.operator);

                        return (
                            <div key={filter.id} className="filter-row" role="group" aria-label={`Filter condition ${index + 1}`}>
                                <select
                                    className="filter-select filter-column"
                                    value={filter.column}
                                    onChange={(e) => handleFilterChange(filter.id, 'column', e.target.value)}
                                    aria-label={`Column for filter ${index + 1}`}
                                    title={`Select column to filter`}
                                    ref={index === 0 ? initialFocusRef : null}
                                >
                                    {columnNames.length === 0 && <option value="">(No Columns)</option>}
                                    {columnNames.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                                <select
                                    className="filter-select filter-operator"
                                    value={filter.operator}
                                    onChange={(e) => handleFilterChange(filter.id, 'operator', e.target.value)}
                                    aria-label={`Operator for filter ${index + 1}`}
                                    title={operatorTooltip}
                                >
                                    {OPERATORS.map(op => (
                                        <option key={op.value} value={op.value} title={op.tooltip}>
                                            {op.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="filter-input filter-value"
                                    value={filter.value}
                                    onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
                                    disabled={!requiresValue}
                                    placeholder={requiresValue ? 'Value...' : '(No value needed)'}
                                    aria-label={`Value for filter ${index + 1}`}
                                    title={requiresValue ? 'Enter filter value' : 'No value needed for this operator'}
                                />
                                <button
                                    className="filter-remove-button"
                                    onClick={() => handleRemoveFilterRow(filter.id)}
                                    disabled={filters.length <= 1} // Disable remove if only one row
                                    title="Remove this condition"
                                    aria-label={`Remove filter condition ${index + 1}`}
                                >
                                    ➖
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="filter-add-row">
                    <button
                        className="filter-add-button"
                        onClick={handleAddFilterRow}
                        title="Add another filter condition"
                    >
                        ➕ Add Condition
                    </button>
                </div>

                <div className="filter-dialog-actions">
                    <button
                        className="app-button clear-button"
                        onClick={handleClearAll}
                        title="Remove all conditions and start over"
                    >
                        Clear All
                    </button>
                    <div className="filter-dialog-actions-right">
                        <button
                            className="app-button cancel-button"
                            onClick={onClose}
                            title="Close without applying filters"
                        >
                            Cancel
                        </button>
                        <button
                            className="app-button apply-button"
                            onClick={handleApplyFilters}
                            title="Apply these filters to the results"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilterDialog;
