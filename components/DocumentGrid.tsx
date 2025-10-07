"use client";

import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Box, Paper, Typography, Button, IconButton, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
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
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
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
    // Resetar paginação ao mudar de collection
    setPaginationModel({ page: 0, pageSize: 25 });
    setIsCustomQuery(false);
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbName, collectionName]);

  useEffect(() => {
    if (!isCustomQuery) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/documents?db=${dbName}&collection=${collectionName}&page=${paginationModel.page}&pageSize=${paginationModel.pageSize}`
      );
      const result = await response.json();

      if (result.success) {
        setTotalCount(result.totalCount || 0);
        
        if (result.data.length > 0) {
          // Gerar colunas dinamicamente baseado nas chaves do primeiro documento
          const firstDoc = result.data[0];
        const generatedColumns: GridColDef[] = Object.keys(firstDoc).map((key) => ({
          field: key,
          headerName: key,
          width: key === "_id" ? 220 : 150,
          flex: key === "_id" ? 0 : 1,
        }));

        // Adicionar coluna de ações no final (visível apenas no hover)
        generatedColumns.push({
          field: "actions",
          headerName: "",
          width: 100,
          sortable: false,
          filterable: false,
          hideable: false,
          disableColumnMenu: true,
          renderCell: (params) => (
            <Box 
              sx={{ 
                display: "flex", 
                gap: 0.5,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                opacity: 0,
                transition: "opacity 0.2s",
                ".MuiDataGrid-row:hover &": {
                  opacity: 1,
                },
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleEditRow(params.row)}
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
                onClick={() => handleDeleteRow(params.row)}
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
          ),
        });

        setColumns(generatedColumns);

        // Preparar dados para o grid (usar _id como id)
        const gridRows = result.data.map((doc: any) => ({
          ...doc,
          id: doc._id,
        }));

        setRows(gridRows);
        } else {
          setColumns([]);
          setRows([]);
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

  const handleQueryResult = (results: any[]) => {
    // Marcar como query customizada (paginação client-side)
    setIsCustomQuery(true);
    setPaginationModel({ page: 0, pageSize: 25 });
    setTotalCount(results.length);
    
    // Preparar dados para o grid
    const gridRows = results.map((doc: any) => ({
      ...doc,
      id: doc._id,
    }));
    setRows(gridRows);

    // Atualizar colunas se necessário
    if (results.length > 0) {
      const firstDoc = results[0];
      const generatedColumns: GridColDef[] = Object.keys(firstDoc).map((key) => ({
        field: key,
        headerName: key,
        width: key === "_id" ? 220 : 150,
        flex: key === "_id" ? 0 : 1,
      }));

      // Adicionar coluna de ações no final
      generatedColumns.push({
        field: "actions",
        headerName: "",
        width: 100,
        sortable: false,
        filterable: false,
        hideable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Box 
            sx={{ 
              display: "flex", 
              gap: 0.5,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0,
              transition: "opacity 0.2s",
              ".MuiDataGrid-row:hover &": {
                opacity: 1,
              },
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleEditRow(params.row)}
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
              onClick={async () => {
                if (!confirm("Deseja realmente excluir este documento?")) return;
                
                try {
                  const response = await fetch(
                    `/api/documents?db=${dbName}&collection=${collectionName}&id=${params.row._id}`,
                    { method: "DELETE" }
                  );
                  const result = await response.json();

                  if (result.success) {
                    setSnackbar({ open: true, message: "Documento excluído", severity: "success" });
                    fetchDocuments();
                  } else {
                    throw new Error(result.error);
                  }
                } catch (error: any) {
                  setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
                }
              }}
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
        ),
      });

      setColumns(generatedColumns);
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
          // Detectar se foram criados múltiplos documentos
          const count = result.data.insertedCount || 1;
          const message = count > 1 
            ? `${count} documentos criados` 
            : "Documento criado";
          setSnackbar({ open: true, message, severity: "success" });
          setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); // Voltar para primeira página
          fetchDocuments();
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
          fetchDocuments();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
    }
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
        fetchDocuments();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
    }
  };

  return (
    <>
      <QueryPanel
        dbName={dbName}
        collectionName={collectionName}
        pageSize={paginationModel.pageSize}
        onQueryResult={handleQueryResult}
      />
      
      <Paper sx={{ height: "calc(100vh - 250px)", width: "100%", position: "relative" }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">
              {dbName} → {collectionName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 ? (
                <>
                  {paginationModel.page * paginationModel.pageSize + 1}-
                  {Math.min((paginationModel.page + 1) * paginationModel.pageSize, totalCount)} de {totalCount} documento(s)
                </>
              ) : (
                "0 documentos"
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
                  setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
                  fetchDocuments();
                }}
              >
                Limpar Filtro
              </Button>
            )}
            <IconButton 
              size="small" 
              onClick={() => {
                setIsCustomQuery(false);
                fetchDocuments();
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={totalCount}
          paginationMode={isCustomQuery ? "client" : "server"}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[
            { value: 25, label: "25" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
            { value: 1000, label: "1K" },
            { value: 10000, label: "10K" },
            { value: 100000, label: "100K" },
          ]}
          sx={{
            border: 0,
            "& .MuiDataGrid-cell": {
              fontSize: "0.875rem",
            },
          }}
        />
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
