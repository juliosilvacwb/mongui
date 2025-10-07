"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams, ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { Box, Paper, Typography, Button, IconButton, Snackbar, Alert, Chip, Tooltip, Collapse, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useThemeMode } from "./ThemeRegistry";

// Registrar módulos do AG Grid Community
ModuleRegistry.registerModules([AllCommunityModule]);
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import TableRowsIcon from "@mui/icons-material/TableRows";
import DataObjectIcon from "@mui/icons-material/DataObject";
import DocumentModal from "./DocumentModal";
import QueryPanel from "./QueryPanel";
import JsonViewer from "./JsonViewer";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface DocumentGridProps {
  dbName: string;
  collectionName: string;
}

export default function DocumentGrid({ dbName, collectionName }: DocumentGridProps) {
  const { mode } = useThemeMode();
  const { t } = useTranslation();
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [paginationPageSize, setPaginationPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCustomQuery, setIsCustomQuery] = useState(false);
  const [showFilterAlert, setShowFilterAlert] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "json">("grid");
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: "success" | "error" | "info" | "warning"
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Verificar se já viu o alerta antes
  useEffect(() => {
    const hasSeenAlert = localStorage.getItem('mongui-filter-alert-seen');
    if (hasSeenAlert) {
      setShowFilterAlert(false);
    }
  }, []);

  const dismissAlert = () => {
    setShowFilterAlert(false);
    localStorage.setItem('mongui-filter-alert-seen', 'true');
  };

  useEffect(() => {
    setCurrentPage(0);
    setPaginationPageSize(25);
    setIsCustomQuery(false);
    fetchDocuments(0, 25);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbName, collectionName]);

  const fetchDocuments = async (page: number = currentPage, pageSize: number = paginationPageSize) => {
    if (isCustomQuery) return; // Não buscar se estiver em modo query
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/documents?db=${dbName}&collection=${collectionName}&page=${page}&pageSize=${pageSize}`
      );
      const result = await response.json();

      if (result.success) {
        setTotalCount(result.totalCount || 0);
        
        if (result.data.length > 0) {
          // Gerar colunas dinamicamente baseado nas chaves do primeiro documento
          const firstDoc = result.data[0];
          const generatedColumns: ColDef[] = Object.keys(firstDoc)
            .filter(key => key !== 'id') // Remover campo id se existir
            .map((key) => ({
              field: key,
              headerName: key,
              sortable: false,
              filter: false,
              resizable: true,
              width: key === "_id" ? 220 : 150,
              flex: key === "_id" ? 0 : 1,
            }));

          // Adicionar coluna de ações
          generatedColumns.push({
            field: "actions",
            headerName: "",
            width: 100,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: (params: ICellRendererParams) => {
              return (
                <Box 
                  sx={{ 
                    display: "flex", 
                    gap: 0.5,
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                  className="action-buttons"
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditRow(params.data)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRow(params.data)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.main",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            },
          });

          setColumnDefs(generatedColumns);
          setRowData(result.data);
        } else {
          setColumnDefs([]);
          setRowData([]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedRow(null);
    setModalOpen(true);
  };

  const handleEditRow = (row: any) => {
    setSelectedRow(row);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeleteRow = async (row: any) => {
    if (!confirm("Deseja realmente excluir este documento?")) return;
    
    try {
      const response = await fetch(
        `/api/documents?db=${dbName}&collection=${collectionName}&id=${row._id}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (result.success) {
        setSnackbar({ open: true, message: t.messages.documentDeleted, severity: "success" });
        fetchDocuments(currentPage, paginationPageSize);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
    }
  };

  const handleQueryResult = (results: any[]) => {
    setIsCustomQuery(true);
    setCurrentPage(0);
    setTotalCount(results.length);
    
    if (results.length > 0) {
      const firstDoc = results[0];
      const generatedColumns: ColDef[] = Object.keys(firstDoc)
        .filter(key => key !== 'id')
        .map((key) => ({
          field: key,
          headerName: key,
          sortable: false,
          filter: false,
          resizable: true,
          width: key === "_id" ? 220 : 150,
          flex: key === "_id" ? 0 : 1,
        }));

      generatedColumns.push({
        field: "actions",
        headerName: "",
        width: 100,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <Box 
              sx={{ 
                display: "flex", 
                gap: 0.5,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
              className="action-buttons"
            >
              <IconButton
                size="small"
                onClick={() => handleEditRow(params.data)}
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteRow(params.data)}
                sx={{
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "error.contrastText",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        },
      });

      setColumnDefs(generatedColumns);
      setRowData(results);
    } else {
      // Quando query retorna vazio, limpar dados e mostrar mensagem
      setRowData([]);
      setColumnDefs([]);
      setSnackbar({ 
        open: true, 
        message: t.messages.noDocumentsFound, 
        severity: "warning" as "success" | "error" | "info" | "warning"
      });
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (modalMode === "create") {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            db: dbName,
            collection: collectionName,
            document: data,
          }),
        });
        const result = await response.json();
        if (result.success) {
          const count = result.data.insertedCount || 1;
          const message = count > 1 
            ? `${count} documentos criados` 
            : t.messages.documentCreated;
          setSnackbar({ open: true, message, severity: "success" });
          setCurrentPage(0);
          fetchDocuments(0, paginationPageSize);
        } else {
          throw new Error(result.error);
        }
      } else {
        const response = await fetch("/api/documents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            db: dbName,
            collection: collectionName,
            id: selectedRow._id,
            document: data,
          }),
        });
        const result = await response.json();
        if (result.success) {
          setSnackbar({ open: true, message: t.messages.documentUpdated, severity: "success" });
          fetchDocuments(currentPage, paginationPageSize);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
    }
  };

  const onPaginationChanged = useCallback((params: any) => {
    const newPage = params.api.paginationGetCurrentPage();
    const newPageSize = params.api.paginationGetPageSize();
    
    if (newPage !== currentPage || newPageSize !== paginationPageSize) {
      setCurrentPage(newPage);
      setPaginationPageSize(newPageSize);
      
      if (!isCustomQuery) {
        fetchDocuments(newPage, newPageSize);
      }
    }
    
    // Customizar labels do seletor de pageSize
    setTimeout(() => {
      const selector = document.querySelector('.ag-paging-page-size-selector select');
      if (selector) {
        const options = selector.querySelectorAll('option');
        options.forEach((option: any) => {
          const value = parseInt(option.value);
          if (value === 1000) option.textContent = '1K';
          else if (value === 10000) option.textContent = '10K';
          else if (value === 100000) option.textContent = '100K';
        });
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, paginationPageSize, isCustomQuery]);

  useEffect(() => {
    // Customizar labels iniciais
    const timer = setTimeout(() => {
      const selector = document.querySelector('.ag-paging-page-size-selector select');
      if (selector) {
        const options = selector.querySelectorAll('option');
        options.forEach((option: any) => {
          const value = parseInt(option.value);
          if (value === 1000) option.textContent = '1K';
          else if (value === 10000) option.textContent = '10K';
          else if (value === 100000) option.textContent = '100K';
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [rowData]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({ 
        open: true, 
        message: `"${label}" copiado para área de transferência`, 
        severity: "success" 
      });
    }).catch((err) => {
      console.error("Erro ao copiar:", err);
      setSnackbar({ 
        open: true, 
        message: "Erro ao copiar para área de transferência", 
        severity: "error" 
      });
    });
  };

  const handleCellClick = useCallback((params: any) => {
    // Não copiar se for a coluna de ações
    if (params.column.getColId() === "actions") return;
    
    const value = params.value;
    const fieldName = params.column.getColId();
    
    // Converter valor para string
    const textToCopy = typeof value === "object" 
      ? JSON.stringify(value) 
      : String(value || "");
    
    copyToClipboard(textToCopy, fieldName);
  }, []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: false,
    filter: false,
    resizable: true,
    onCellClicked: handleCellClick,
  }), [handleCellClick]);

  return (
    <>
      {/* Alerta educativo - aparece apenas na primeira vez */}
      <Collapse in={showFilterAlert && !isCustomQuery}>
        <Alert 
          severity="info" 
          onClose={dismissAlert}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            <strong>💡 Dica:</strong> Click nas células ou headers para copiar valores.
            Use a <strong>Consulta Avançada</strong> para filtrar e ordenar toda a collection.
          </Typography>
        </Alert>
      </Collapse>

      <QueryPanel
        dbName={dbName}
        collectionName={collectionName}
        pageSize={paginationPageSize}
        onQueryResult={handleQueryResult}
      />
      
      <Paper sx={{ height: showFilterAlert && !isCustomQuery ? "calc(100vh - 330px)" : "calc(100vh - 250px)", width: "100%", position: "relative", transition: "height 0.3s" }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">
              {dbName} → {collectionName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {!isCustomQuery && totalCount > 0 ? (
                  <>
                    {t.documentGrid.showing} {currentPage * paginationPageSize + 1}-
                    {Math.min((currentPage + 1) * paginationPageSize, totalCount)} {t.documentGrid.of} {totalCount.toLocaleString()} {t.documentGrid.documents}
                  </>
                ) : (
                  `${totalCount.toLocaleString()} ${t.documentGrid.documents}`
                )}
              </Typography>
              {!isCustomQuery && (
                <Tooltip 
                  title={t.documentGrid.clickToCopyTooltip}
                  arrow
                >
                  <Chip 
                    label={t.documentGrid.clickToCopy}
                    size="small" 
                    variant="outlined"
                    color="info"
                    sx={{ fontSize: "0.7rem", height: "20px" }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Toggle View Mode */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode !== null) {
                  setViewMode(newMode);
                }
              }}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  px: 2,
                  py: 0.5,
                  textTransform: "none",
                },
              }}
            >
              <ToggleButton value="grid" aria-label="visualização em tabela">
                <TableRowsIcon sx={{ mr: 0.5, fontSize: "1.2rem" }} />
                {t.documentGrid.table}
              </ToggleButton>
              <ToggleButton value="json" aria-label="visualização em JSON">
                <DataObjectIcon sx={{ mr: 0.5, fontSize: "1.2rem" }} />
                {t.documentGrid.json}
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleCreate}>
                {t.documentGrid.new}
              </Button>
              {isCustomQuery && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setIsCustomQuery(false);
                    setCurrentPage(0);
                    fetchDocuments(0, paginationPageSize);
                  }}
                >
                  {t.documentGrid.clearFilter}
                </Button>
              )}
              <IconButton 
                size="small" 
                onClick={() => {
                  setIsCustomQuery(false);
                  fetchDocuments(currentPage, paginationPageSize);
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Conditional Rendering: Grid or JSON View */}
        {viewMode === "grid" ? (
          <Box 
            className={`ag-theme-material ${mode === "dark" ? "ag-theme-dark" : "ag-theme-light"}`}
            sx={{ 
              height: "calc(100% - 80px)", 
              width: "100%",
              "& .action-buttons": {
                opacity: 0,
                transition: "opacity 0.2s",
              },
              "& .ag-row:hover .action-buttons": {
                opacity: 1,
              },
            }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={!isCustomQuery}
              paginationPageSize={paginationPageSize}
              paginationPageSizeSelector={[25, 50, 100, 1000, 10000, 100000]}
              suppressPaginationPanel={isCustomQuery}
              loading={loading}
              onPaginationChanged={onPaginationChanged}
              onColumnHeaderClicked={(params: any) => {
                const colId = params.column?.getColId ? params.column.getColId() : null;
                if (colId && colId !== "actions") {
                  copyToClipboard(colId, t.messages.fieldName);
                }
              }}
              domLayout="normal"
              rowHeight={52}
              headerHeight={56}
              suppressRowClickSelection={true}
              getRowId={(params) => params.data._id}
              theme="legacy"
            />
          </Box>
        ) : (
          <Box sx={{ height: "calc(100% - 80px)", width: "100%", overflow: "auto" }}>
            <JsonViewer 
              data={rowData} 
              title={`${dbName} → ${collectionName}`}
            />
          </Box>
        )}
      </Paper>

      <DocumentModal
        open={modalOpen}
        mode={modalMode}
        initialData={selectedRow}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
