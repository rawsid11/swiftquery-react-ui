// src/components/LeftPanel/LeftPanel.jsx
import React, { useState, useCallback } from 'react';
import './LeftPanel.css';
import SchemaTree from '../SchemaTree/SchemaTree';
import TableNameModal from '../TableNameModal/TableNameModal';

function LeftPanel({ addCell, onSchemaItemClick, showStatus }) {
    const [isTableNameModalOpen, setIsTableNameModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ fileName: '', suggestedName: '', simulatedPath: '' });

    const handleLoadDataFile = useCallback(() => {
        console.log("Load Data File button clicked");
        showStatus("Simulating file selection...", 0);

        // Simulate opening file dialog and getting a path
        const simulatedFilePath = `/Users/fakeuser/Documents/data/mock_sales_${Date.now() % 100}.csv`;

        if (!simulatedFilePath) {
            showStatus("File selection cancelled (simulated).", 3000);
            console.log("File selection cancelled.");
            return;
        }
        console.log("Simulated file selection:", simulatedFilePath);

        // Extract suggested name
        const baseName = simulatedFilePath.split('/').pop();
        const suggestedTableName = (baseName.split('.').slice(0, -1).join('.') || 'new_table')
                                    .replace(/[^a-zA-Z0-9_]/g, '_')
                                    .substring(0, 60);

        // Set data for modal and open it
        setModalData({
            fileName: baseName,
            suggestedName: suggestedTableName,
            simulatedPath: simulatedFilePath
        });
        setIsTableNameModalOpen(true);
        showStatus("Ready");
    }, [showStatus]);

    const handleModalClose = useCallback(() => {
        setIsTableNameModalOpen(false);
        console.log("Table name modal closed.");
    }, []);

    const handleModalSubmit = useCallback((tableName) => {
        console.log(`Table name submitted: ${tableName}`);
        console.log(`Simulating loading '${modalData.simulatedPath}' into table '${tableName}'...`);
        showStatus(`Simulating load into table: ${tableName}...`, 0);

        // Simulate backend call delay
        setTimeout(() => {
            showStatus(`Simulated load complete for table: ${tableName}`, 5000);
        }, 1500);

        handleModalClose();
    }, [modalData, handleModalClose, showStatus]);

    return (
        <>
            <div className="left-panel-top-buttons">
                <button
                    className="app-button load-button"
                    onClick={handleLoadDataFile}
                    title="Load CSV, Parquet, Excel, or DB file" // Added tooltip
                >
                    Load Data File
                </button>
                <button
                    className="app-button add-cell-button"
                    onClick={addCell}
                    title="Add a new query editor cell" // Added tooltip
                >
                    Add Query Cell
                </button>
            </div>
            <h2 className="panel-header-label">Database Schema:</h2>
            <div className="schema-tree-container">
                <SchemaTree onItemClick={onSchemaItemClick} />
            </div>

            <TableNameModal
                isOpen={isTableNameModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                fileName={modalData.fileName}
                suggestedName={modalData.suggestedName}
            />
        </>
    );
}

export default LeftPanel;
