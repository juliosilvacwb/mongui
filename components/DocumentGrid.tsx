"use client";

import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Box, Paper, Typography } from "@mui/material";
import { useState, useEffect } from "react";

interface DocumentGridProps {
  dbName: string;
  collectionName: string;
}

export default function DocumentGrid({ dbName, collectionName }: DocumentGridProps) {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6">
          {dbName} → {collectionName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rows.length} documento(s)
        </Typography>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem",
          },
        }}
      />
    </Paper>
  );
}
