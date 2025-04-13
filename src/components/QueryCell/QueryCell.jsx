// src/components/QueryCell/QueryCell.jsx
import React, { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import FilterDialog from '../FilterDialog/FilterDialog';
// Import sort icons
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
// Import loading spinner icon
import { BiLoaderAlt } from 'react-icons/bi';
// Import error icon
import { MdError } from 'react-icons/md';
import './QueryCell.css';

// Ace editor imports
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

// --- Loading Indicator Component ---
function LoadingIndicator() {
  return (
    <div className="loading-container">
      <BiLoaderAlt className="loading-spinner" />
      <span className="loading-text">Running query...</span>
    </div>
  );
}

// --- Error Message Component ---
function ErrorMessage({ message }) {
  return (
    <div className="error-container">
      <div className="error-icon-container">
        <MdError className="error-icon" />
      </div>
      <div className="error-message">
        <h4>Query Error</h4>
        <p>{message}</p>
      </div>
    </div>
  );
}

// --- TanStack Table Component ---
function ResultsTableTanstack({ data, cellId, onHeaderClick }) {
  const tableData = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const [columnWidths, setColumnWidths] = useState({});
  const tableRef = useRef(null);
  const resizingRef = useRef({
    isResizing: false,
    columnId: null,
    startX: 0,
    startWidth: 0
  });

  // Initialize column widths when data changes
  useEffect(() => {
    if (tableData.length > 0) {
      const columns = Object.keys(tableData[0]);
      const initialWidths = {};
      columns.forEach(column => {
        initialWidths[column] = initialWidths[column] || 150; // Default width
      });
      setColumnWidths(initialWidths);
    }
  }, [tableData]);

  // Handlers for column resizing
  const onMouseDown = (e, columnId) => {
    e.preventDefault();

    // Find the th element
    const headerCell = e.target.closest('th');
    const startWidth = headerCell.offsetWidth;

    resizingRef.current = {
      isResizing: true,
      columnId,
      startX: e.clientX,
      startWidth
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Add a class to the body to indicate resizing is in progress
    document.body.classList.add('column-resizing');
  };

  const onMouseMove = useCallback((e) => {
    if (resizingRef.current.isResizing) {
      const { columnId, startX, startWidth } = resizingRef.current;
      const width = Math.max(100, startWidth + (e.clientX - startX));

      setColumnWidths(prev => ({
        ...prev,
        [columnId]: width
      }));
    }
  }, []);

  const onMouseUp = useCallback(() => {
    resizingRef.current.isResizing = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.classList.remove('column-resizing');
  }, [onMouseMove]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('column-resizing');
    };
  }, [onMouseMove, onMouseUp]);

  const columns = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    return Object.keys(tableData[0]).map((key, index) => ({
      accessorKey: key,
      id: key,
      header: ({ header, column }) => {
        const sortIcon = <FaSort />;
        return (
          <div className="table-header-content">
            <span
              className="table-header-clickable"
              onClick={() => onHeaderClick(cellId, index, key)}
              title={`Show statistics for ${key}`}
            >
              {key}
            </span>
            <span className="sort-icon" title="Sort (Not Implemented)">
              {sortIcon}
            </span>
          </div>
        );
      },
      cell: info => {
         const value = info.getValue();
         if (value === null || typeof value === 'undefined') {
            return <span className="null-value">NULL</span>;
         }
         let displayValue = String(value);
         if (displayValue.length > 100) {
             displayValue = displayValue.substring(0, 97) + '...';
         }
         return displayValue;
      },
    }));
  }, [tableData, onHeaderClick, cellId]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!tableData || tableData.length === 0) {
    return <div className="results-table-placeholder">No results to display</div>;
  }

  return (
    <div className="results-table-container" ref={tableRef}>
      <table className="results-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const columnId = header.column.id;
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="resizable-header"
                    style={{ width: `${columnWidths[columnId] || 150}px` }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}

                    {/* Resize handle */}
                    <div
                      className="column-resize-handle"
                      onMouseDown={(e) => onMouseDown(e, columnId)}
                      title="Drag to resize column"
                    />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => {
                const columnId = cell.column.id;
                return (
                  <td
                    key={cell.id}
                    style={{ width: `${columnWidths[columnId] || 150}px` }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Pagination Component ---
function PaginationControls({ currentPage, totalPages, totalRows, onPageChange, pageSize = 500 }) {
    if (totalPages <= 1) {
        return null;
    }
    const handlePrev = () => { if (currentPage > 1) { onPageChange(currentPage - 1); } };
    const handleNext = () => { if (currentPage < totalPages) { onPageChange(currentPage + 1); } };

    return (
        <div className="pagination-controls">
            <button
                className="app-button pagination-button prev-button"
                onClick={handlePrev}
                disabled={currentPage <= 1}
                title="Go to previous page"
            >
                &lt;&lt; Previous
            </button>
            <span className="page-info-label">
                Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
                {totalRows !== null && ` (${pageSize.toLocaleString()} rows/page) — Total Matching: ${totalRows.toLocaleString()}`}
            </span>
            <button
                className="app-button pagination-button next-button"
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                title="Go to next page"
            >
                Next &gt;&gt;
            </button>
        </div>
    );
}

// --- Query Cell Component ---
function QueryCell({
    cellData,
    onQueryChange,
    onRunQuery,
    onDelete,
    onColumnHeaderClick,
    isActive,
    onFocus
}) {
    const { id, query, results, error, rowCount, isFilterEnabled, isRunning } = cellData;
    const [paginationInfo, setPaginationInfo] = useState({
        isPaginated: false, currentPage: 1, totalPages: 1, totalRows: null, pageSize: 500
    });
    const editorRef = useRef(null);

    // --- State for Filter Dialog ---
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    // Store applied filters locally for display (eventually lift to AppLayout)
    const [activeFilters, setActiveFilters] = useState([]);
    // --- End Filter Dialog State ---

    // Extract column names from results for the dialog (memoized)
    const resultColumnNames = useMemo(() => {
        if (results && Array.isArray(results) && results.length > 0 && !results[0]?.status) {
            return Object.keys(results[0]);
        }
        return []; // Return empty if no results or it's a status message
    }, [results]);


    useEffect(() => {
        if (isActive && editorRef.current) {
            // Optional: Focus editor when cell becomes active
            // editorRef.current.editor.focus();
        }
    }, [isActive, id]);

    const handleQueryChange = useCallback((newQuery) => {
        onQueryChange(newQuery);
    }, [onQueryChange]);

    const handleRunQueryInternal = async () => {
        setPaginationInfo({ isPaginated: false, currentPage: 1, totalPages: 1, totalRows: null, pageSize: 500 });
        // Reset active filters when running a new base query? Optional.
        // setActiveFilters([]);
        await onRunQuery();

        setTimeout(() => {
            const currentCellData = cellData;
            if (currentCellData.results && !currentCellData.error && Array.isArray(currentCellData.results) && currentCellData.results.length >= 0) {
                const displayedRowCount = currentCellData.results.length;
                const mockTotalRows = displayedRowCount + Math.floor(Math.random() * 3000) + (displayedRowCount > 0 ? 500 : 0);
                const mockPageSize = 500;
                const mockTotalPages = Math.ceil(mockTotalRows / mockPageSize);
                if (mockTotalPages > 1) {
                    setPaginationInfo({ isPaginated: true, currentPage: 1, totalPages: mockTotalPages, totalRows: mockTotalRows, pageSize: mockPageSize });
                } else {
                    setPaginationInfo({ isPaginated: false, currentPage: 1, totalPages: 1, totalRows: displayedRowCount, pageSize: mockPageSize });
                }
            } else {
                setPaginationInfo({ isPaginated: false, currentPage: 1, totalPages: 1, totalRows: currentCellData.rowCount, pageSize: 500 });
            }
        }, 0);
    };

    // --- Filter Dialog Handlers ---
    const openFilterDialog = useCallback(() => {
        if (resultColumnNames.length > 0) { // Only open if columns are available
            setIsFilterDialogOpen(true);
        } else {
            alert("No result columns available to filter.");
        }
    }, [resultColumnNames]);

    const closeFilterDialog = useCallback(() => {
        setIsFilterDialogOpen(false);
    }, []);

    const handleApplyFilters = useCallback((appliedFilters) => {
        console.log(`Filters applied for cell ${id}:`, appliedFilters);
        setActiveFilters(appliedFilters); // Store applied filters locally (for now)
        // TODO: Trigger onRunQuery again, passing filters to AppLayout
        // This will require modifying onRunQuery prop and AppLayout state
        alert(`Filters applied (See console). Re-running query with filters is not yet implemented.`);
        // For now, just close the dialog
        // closeFilterDialog(); // Already closed by FilterDialog itself
    }, [id /*, onRunQuery - add later */]);
    // --- End Filter Dialog Handlers ---

    const handleDelete = () => {
        console.log(`Delete button clicked in cell ${id}`);
        onDelete();
    };

    const getStatusLabel = () => {
        if (isRunning) return "Running...";
        if (error) return `Error: ${error}`;
        if (results === null) return "";
        if (Array.isArray(results) && results.length === 1 && results[0]?.status) {
            return results[0].status;
        }
        if (paginationInfo.isPaginated) {
            const startRow = ((paginationInfo.currentPage - 1) * paginationInfo.pageSize) + 1;
            const endRow = startRow + (results?.length || 0) - 1;
            return `Displaying rows ${startRow.toLocaleString()} - ${endRow.toLocaleString()}`;
        }
        return `${(results?.length || 0).toLocaleString()} Rows Displayed`;
    };

    const handlePageChange = (newPage) => {
        console.log(`Cell ${id}: Requesting page change to ${newPage}`);
        setPaginationInfo(prev => ({ ...prev, currentPage: newPage }));
        // TODO: Trigger actual data fetch for the new page
    };

    // Determine filter button text
    const filterButtonText = activeFilters.length > 0 ? `⚙️ Filter (${activeFilters.length})` : '⚙️ Filter';

    // Render different content based on query state
    const renderResultContent = () => {
        if (isRunning) {
            return <LoadingIndicator />;
        } else if (error) {
            return <ErrorMessage message={error} />;
        } else if (results && Array.isArray(results)) {
            return (
                <>
                    <ResultsTableTanstack
                        data={results}
                        cellId={id}
                        onHeaderClick={onColumnHeaderClick}
                    />
                    {paginationInfo.isPaginated && (
                        <PaginationControls
                            currentPage={paginationInfo.currentPage}
                            totalPages={paginationInfo.totalPages}
                            totalRows={paginationInfo.totalRows}
                            onPageChange={handlePageChange}
                            pageSize={paginationInfo.pageSize}
                        />
                    )}
                </>
            );
        } else if (results && results[0]?.status) {
            // For non-query statements that return a status
            return (
                <div className="success-message">
                    {results[0].status}
                </div>
            );
        }
        return null;
    };

    return (
        <> {/* Use Fragment to render dialog outside the main div */}
            {/* Added data-cell-id attribute here */}
            <div className={`query-cell-frame ${isActive ? 'active' : ''}`} onClick={onFocus} data-cell-id={id}>
                <div className="query-cell-toolbar">
                    <button
                        className="app-button run-button"
                        onClick={handleRunQueryInternal}
                        disabled={isRunning}
                        title="Run Query (Cmd/Ctrl+Enter)"
                    >
                        {isRunning ? 'Running...' : '▶ Run'}
                    </button>
                    {/* Connect filter button */}
                    <button
                        className="app-button filter-button"
                        disabled={!isFilterEnabled || resultColumnNames.length === 0 || isRunning}
                        onClick={openFilterDialog}
                        title="Filter Results"
                    >
                        {filterButtonText}
                    </button>
                    <button
                        className="app-button delete-button"
                        onClick={handleDelete}
                        disabled={isRunning}
                        title="Delete this query cell"
                    >
                        ❌ Delete
                    </button>
                </div>

                <AceEditor
                    ref={editorRef}
                    mode="sql"
                    theme="github"
                    onChange={handleQueryChange}
                    value={query}
                    name={`sql-editor-${id}`}
                    editorProps={{ $blockScrolling: true }}
                    width="100%"
                    height="120px"
                    fontSize={14}
                    showPrintMargin={false}
                    showGutter={true}
                    highlightActiveLine={true}
                    placeholder="Write SQL query here..."
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 2,
                        useWorker: false
                    }}
                    style={{ border: '1px solid #CE93D8', borderRadius: '3px' }}
                    onFocus={onFocus}
                />

                {(results !== null || error || isRunning) && (
                    <div className="results-area">
                        <div className={`row-count-label ${error ? 'error' : ''}`}>
                            {getStatusLabel()}
                        </div>
                        {renderResultContent()}
                    </div>
                )}
            </div>

            {/* Render Filter Dialog Conditionally */}
            <FilterDialog
                isOpen={isFilterDialogOpen}
                onClose={closeFilterDialog}
                onApply={handleApplyFilters}
                columnNames={resultColumnNames}
                initialFilters={activeFilters} // Pass current filters for editing
            />
        </>
    );
}

export default QueryCell;
