import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TableNameModal.css';

function TableNameModal({
    isOpen,
    onClose,
    onSubmit,
    suggestedName = '',
    fileName = ''
}) {
    const [tableName, setTableName] = useState(suggestedName);
    const inputRef = useRef(null); // Ref for focusing the input

    // Reset table name when dialog opens and focus input
    useEffect(() => {
        if (isOpen) {
            setTableName(suggestedName);
            // Focus the input shortly after the dialog opens
            // Use setTimeout to ensure the element is rendered and visible
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select(); // Select text for easy replacement
            }, 100); // Small delay
            return () => clearTimeout(timer); // Cleanup timer on close/re-render
        }
    }, [isOpen, suggestedName]);

    const handleInputChange = (event) => {
        setTableName(event.target.value);
    };

    const handleSubmit = useCallback((event) => {
        event.preventDefault(); // Prevent default form submission if wrapped in form
        const trimmedName = tableName.trim();
        if (trimmedName) {
            onSubmit(trimmedName); // Pass the final name to the parent handler
            // onClose(); // onSubmit should handle closing if successful
        } else {
            alert("Please enter a valid table name.");
            inputRef.current?.focus(); // Refocus if invalid
        }
    }, [tableName, onSubmit]); // Include onClose if needed here

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    // Prevent clicks inside the dialog from closing it via the overlay
    const handleDialogClick = (e) => {
        e.stopPropagation();
    };

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) {
        return null;
    }

    return (
        <div className="table-name-modal-overlay" onClick={handleCancel}>
            <div className="table-name-modal-content" onClick={handleDialogClick}>
                <h2>Import File</h2>
                <p className="modal-file-info">
                    Importing file: <strong>{fileName || '(No file specified)'}</strong>
                </p>
                {/* Wrap input handling in a form for better accessibility & Enter key submission */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <label htmlFor="tableNameInput" className="modal-label">
                        Enter name for new table:
                    </label>
                    <input
                        ref={inputRef} // Assign ref
                        id="tableNameInput"
                        type="text"
                        className="modal-input"
                        value={tableName}
                        onChange={handleInputChange}
                        placeholder="e.g., imported_sales"
                        required // Basic HTML5 validation
                    />
                    <div className="modal-actions">
                        {/* Type="button" prevents default form submission for Cancel */}
                        <button type="button" className="app-button modal-cancel-button" onClick={handleCancel}>
                            Cancel
                        </button>
                        {/* Default button type is "submit" which triggers form's onSubmit */}
                        <button type="submit" className="app-button modal-import-button">
                            Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TableNameModal;
