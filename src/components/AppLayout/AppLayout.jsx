// src/components/AppLayout/AppLayout.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import './AppLayout.css';
import MenuBar from '../MenuBar/MenuBar';
import LeftPanel from '../LeftPanel/LeftPanel';
import CenterPanel from '../CenterPanel/CenterPanel';
import RightPanel from '../RightPanel/RightPanel';
import StatusBar from '../StatusBar/StatusBar';
import { v4 as uuidv4 } from 'uuid';

function AppLayout() {
    // --- State ---
    const initialCellId = uuidv4();
    const [cells, setCells] = useState([{ id: initialCellId, query: '', results: null, error: null, rowCount: 0, isFilterEnabled: false, isRunning: false }]);
    const [activeCellId, setActiveCellId] = useState(initialCellId);
    const [statsData, setStatsData] = useState({ cellId: null, columnIndex: null, columnName: null, stats: null });
    const [statusMessage, setStatusMessage] = useState("Ready");
    const statusTimeoutRef = useRef(null);
    const centerPanelRef = useRef(null);
    const newlyAddedCellIdRef = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState(":memory:");
    const [lastQueryTime, setLastQueryTime] = useState(null);

    const showStatus = useCallback((message, duration = 5000) => {
        setStatusMessage(message);
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
        }
        if (duration > 0) {
            statusTimeoutRef.current = setTimeout(() => {
                setStatusMessage("Ready");
                statusTimeoutRef.current = null;
            }, duration);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);

    const addCell = useCallback(() => {
        const newId = uuidv4();
        const newCell = {
            id: newId,
            query: '',
            results: null,
            error: null,
            rowCount: 0,
            isFilterEnabled: false,
            isRunning: false
        };
        setCells(prevCells => [...prevCells, newCell]);
        setActiveCellId(newId);
        showStatus(`Added query cell (${cells.length + 1} total).`, 3000);
        newlyAddedCellIdRef.current = newId;
    }, [cells.length, showStatus]);

    const deleteCell = useCallback((idToDelete) => {
        let nextActiveId = null;
        setCells(prevCells => {
            const indexToDelete = prevCells.findIndex(cell => cell.id === idToDelete);
            const remainingCells = prevCells.filter(cell => cell.id !== idToDelete);
            if (activeCellId === idToDelete) {
                if (remainingCells.length > 0) {
                    nextActiveId = remainingCells[Math.max(0, indexToDelete - 1)].id;
                }
                setStatsData({ cellId: null, columnIndex: null, columnName: null, stats: null });
            }
            showStatus(`Cell removed (${remainingCells.length} left).`, 3000);
            return remainingCells;
        });
    }, [activeCellId, showStatus]);

    const updateCellState = useCallback((cellId, updates) => {
        setCells(prevCells => prevCells.map(cell =>
            cell.id === cellId ? { ...cell, ...updates } : cell
        ));
        if (statsData.cellId === cellId && (updates.results !== undefined || updates.error !== undefined)) {
            setStatsData({ cellId: null, columnIndex: null, columnName: null, stats: null });
        }
    }, [statsData.cellId]);

    const updateCellQuery = useCallback((cellId, newQuery) => {
        updateCellState(cellId, { query: newQuery });
    }, [updateCellState]);

    const runQuery = useCallback(async (cellId) => {
        const cell = cells.find(c => c.id === cellId);
        if (!cell) return;

        const startTime = performance.now();
        showStatus("Running query...");
        updateCellState(cellId, {
            isRunning: true,
            error: null,
            results: null,
            rowCount: 0,
            isFilterEnabled: false
        });
        setStatsData({ cellId: null, columnIndex: null, columnName: null, stats: null });

        await new Promise(resolve => setTimeout(resolve, 500));

        let newResults = null;
        let newError = null;
        let newRowCount = 0;
        let newIsFilterEnabled = false;
        let statusEndMsg = "Query finished.";
        let queryDuration = null;

        try {
            const query = cell.query;
            if (query.toLowerCase().includes('error')) {
                throw new Error('Simulated backend query execution failed!');
            } else if (query.trim() === '') {
                newResults = [];
                newRowCount = 0;
                statusEndMsg="Query finished. 0 rows returned.";
            } else if (query.toLowerCase().includes('select')) {
                const mockData = Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, i) => ({
                    id: i + 1,
                    product_name: `Widget ${String.fromCharCode(65 + (i % 26))}-${i}`,
                    category_id: Math.floor(Math.random() * 5) + 101,
                    price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
                    created_at: new Date(Date.now() - Math.random() * 1e10).toISOString().split('T')[0],
                    description: i % 5 === 0 ? null : `Desc ${i+1}. `.repeat(Math.floor(Math.random()*3)+1) + (i % 10 === 3 ? 'Long desc. '.repeat(5) : ''),
                }));
                newResults = mockData;
                newRowCount = mockData.length;
                newIsFilterEnabled = true;
                statusEndMsg = `Query finished. ${newRowCount} rows returned.`;
            } else {
                const messages = ["Command executed successfully.", "1 row affected.", "Table created."];
                newResults = [{ status: messages[Math.floor(Math.random() * messages.length)] }];
                newRowCount = 1;
                statusEndMsg = newResults[0].status;
            }
        } catch (err) {
            console.error("Query execution error:", err);
            newError = err.message || 'An unknown error occurred';
            newResults = null;
            newRowCount = 0;
            statusEndMsg = `Query failed: ${newError}`;
        } finally {
            const endTime = performance.now();
            queryDuration = endTime - startTime;
            updateCellState(cellId, {
                isRunning: false,
                results: newResults,
                error: newError,
                rowCount: newRowCount,
                isFilterEnabled: newIsFilterEnabled
            });
            setLastQueryTime(queryDuration);
            showStatus(statusEndMsg + (queryDuration ? ` (${(queryDuration).toFixed(1)}ms)` : ''), newError ? 0 : 7000);
        }
    }, [cells, updateCellState, showStatus]);

    const handleColumnHeaderClick = useCallback((cellId, columnIndex, columnName) => {
        showStatus(`Calculating stats for '${columnName}'...`);
        const cell = cells.find(c => c.id === cellId);
        if (!cell || !cell.results || cell.error || !Array.isArray(cell.results) || cell.results.length === 0) {
            showStatus("Cannot calculate stats: No valid results.", 4000);
            setStatsData({ cellId: null, columnIndex: null, columnName: null, stats: null });
            return;
        }

        const columnData = cell.results.map(row => row[columnName]).filter(val => val !== null && val !== undefined);
        const totalRows = cell.results.length;
        const nonNullCount = columnData.length;
        const nullCount = totalRows - nonNullCount;
        const uniqueValues = new Set(columnData);
        const distinctCount = uniqueValues.size;

        let numericStats = {};
        const isPotentiallyNumeric = columnData.length > 0 && !isNaN(Number(columnData[0]));
        if (isPotentiallyNumeric && columnData.length > 0) {
            const numbers = columnData.map(Number).filter(n => !isNaN(n));
            if (numbers.length > 0) {
                numericStats.min = Math.min(...numbers);
                numericStats.max = Math.max(...numbers);
                numericStats.sum = numbers.reduce((a, b) => a + b, 0);
                numericStats.mean = numericStats.sum / numbers.length;
            }
        }

        const mockStats = {
            total: totalRows,
            nonNull: nonNullCount,
            nulls: nullCount,
            distinct: distinctCount,
            ...numericStats
        };

        setStatsData({
            cellId: cellId,
            columnIndex: columnIndex,
            columnName: columnName,
            stats: mockStats
        });

        showStatus(`Stats ready for '${columnName}'.`, 4000);
    }, [cells, showStatus]);

    const handleSchemaItemClick = useCallback((schema, name, type) => {
        if (!activeCellId) {
            showStatus("Cannot generate query: No active cell.", 3000);
            return;
        }

        const safeSchema = schema && schema !== 'main' ? `"${schema.replace(/"/g, '""')}".` : '';
        const safeName = `"${name.replace(/"/g, '""')}"`;
        const generatedQuery = `SELECT *\nFROM ${safeSchema}${safeName}\nLIMIT 100;`;

        updateCellQuery(activeCellId, generatedQuery);
        showStatus(`Generated query for ${safeSchema}${safeName}`, 3000);
    }, [activeCellId, updateCellQuery, showStatus]);

    useEffect(() => {
        if (newlyAddedCellIdRef.current && centerPanelRef.current) {
            const newCellElement = centerPanelRef.current.querySelector(`[data-cell-id="${newlyAddedCellIdRef.current}"]`);
            if (newCellElement) {
                newCellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            newlyAddedCellIdRef.current = null;
        }
    }, [cells]);

    useEffect(() => {
        const activeExists = cells.some(cell => cell.id === activeCellId);
        if (!activeExists && cells.length > 0) {
            setActiveCellId(cells[cells.length - 1].id);
        } else if (cells.length === 0) {
            setActiveCellId(null);
        }
    }, [cells, activeCellId]);

    // --- Render ---
    return (
        <div className="app-container">
            <MenuBar />
            <header className="app-header">SwiftQuery : By Data & Insights Team</header>
            <div className="app-main-content-wrapper" ref={centerPanelRef}>
                <PanelGroup direction="horizontal">
                    <Panel defaultSize={20} minSize={15} order={1}>
                        <div className="panel-content-wrapper left">
                            {/* Pass showStatus down */}
                            <LeftPanel
                                addCell={addCell}
                                onSchemaItemClick={handleSchemaItemClick}
                                showStatus={showStatus}
                             />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="resize-handle-outer" />
                    <Panel defaultSize={50} minSize={30} order={2}>
                        <div className="panel-content-wrapper center">
                            <CenterPanel
                                cells={cells}
                                deleteCell={deleteCell}
                                updateCellQuery={updateCellQuery}
                                runQuery={runQuery}
                                setActiveCellId={setActiveCellId}
                                activeCellId={activeCellId}
                                onColumnHeaderClick={handleColumnHeaderClick}
                            />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="resize-handle-outer" />
                    <Panel defaultSize={30} minSize={15} order={3}>
                        <div className="panel-content-wrapper right">
                            <RightPanel statsInfo={statsData} />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
            <StatusBar message={statusMessage} connectionStatus={connectionStatus} queryTime={lastQueryTime} />
            <footer className="app-footer">For any queries contact : support@sbilife.co.in</footer>
        </div>
    );
}

export default AppLayout;
