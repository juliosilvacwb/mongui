"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams, ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { Box, Paper, Typography, Button, IconButton, Snackbar, Alert } from "@mui/material";

// Registrar módulos do AG Grid Community
ModuleRegistry.registerModules([AllCommunityModule]);
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DocumentModal from "./DocumentModal";
import QueryPanel from "./QueryPanel";

interface DocumentGridProps {
  dbName: string;
  collectionName: string;
}

export default function DocumentGrid({ dbName, collectionName }: DocumentGridProps) {
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
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: "success" | "error" 
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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
              sortable: true,
              filter: true,
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
        setSnackbar({ open: true, message: "Documento excluído", severity: "success" });
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
          sortable: true,
          filter: true,
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
            : "Documento criado";
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
          setSnackbar({ open: true, message: "Documento atualizado", severity: "success" });
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

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <>
      <QueryPanel
        dbName={dbName}
        collectionName={collectionName}
        pageSize={paginationPageSize}
        onQueryResult={handleQueryResult}
      />
      
      <Paper sx={{ height: "calc(100vh - 250px)", width: "100%", position: "relative" }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">
              {dbName} → {collectionName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {!isCustomQuery && totalCount > 0 ? (
                <>
                  {currentPage * paginationPageSize + 1}-
                  {Math.min((currentPage + 1) * paginationPageSize, totalCount)} de {totalCount} documento(s)
                </>
              ) : (
                `${totalCount} documento(s)`
              )}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleCreate}>
              Novo
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
                Limpar Filtro
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

        <Box 
          className="ag-theme-material ag-theme-dark"
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
            domLayout="normal"
            rowHeight={52}
            headerHeight={56}
            suppressRowClickSelection={true}
            getRowId={(params) => params.data._id}
            theme="legacy"
          />
        </Box>
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
