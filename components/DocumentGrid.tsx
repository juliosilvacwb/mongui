"use client";

import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Box, Paper, Typography, Button, IconButton, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DocumentModal from "./DocumentModal";

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
    fetchDocuments();
  }, [dbName, collectionName]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/documents?db=${dbName}&collection=${collectionName}`
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Gerar colunas dinamicamente baseado nas chaves do primeiro documento
        const firstDoc = result.data[0];
        const generatedColumns: GridColDef[] = Object.keys(firstDoc).map((key) => ({
          field: key,
          headerName: key,
          width: key === "_id" ? 220 : 150,
          flex: key === "_id" ? 0 : 1,
        }));

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

  const handleEdit = () => {
    if (!selectedRow) {
      setSnackbar({ open: true, message: "Selecione um documento", severity: "error" });
      return;
    }
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRow) {
      setSnackbar({ open: true, message: "Selecione um documento", severity: "error" });
      return;
    }

    if (!confirm("Deseja realmente excluir este documento?")) return;

    try {
      const response = await fetch(
        `/api/documents?db=${dbName}&collection=${collectionName}&id=${selectedRow._id}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (result.success) {
        setSnackbar({ open: true, message: "Documento excluído", severity: "success" });
        fetchDocuments();
        setSelectedRow(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: "Erro: " + error.message, severity: "error" });
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

  return (
    <>
      <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">
              {dbName} → {collectionName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rows.length} documento(s)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleCreate}>
              Novo
            </Button>
            <IconButton size="small" onClick={handleEdit} disabled={!selectedRow}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} disabled={!selectedRow} color="error">
              <DeleteIcon />
            </IconButton>
            <IconButton size="small" onClick={fetchDocuments}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          onRowSelectionModelChange={(newSelection) => {
            const selectionArray = Array.isArray(newSelection) ? newSelection : [];
            if (selectionArray.length > 0) {
              const selectedId = selectionArray[0];
              const selected = rows.find((row) => row.id === selectedId);
              setSelectedRow(selected || null);
            } else {
              setSelectedRow(null);
            }
          }}
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
