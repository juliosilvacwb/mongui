"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoIcon from "@mui/icons-material/Info";
import QueryHelpModal from "./QueryHelpModal";

interface QueryPanelProps {
  dbName: string;
  collectionName: string;
  pageSize: number;
  onQueryResult: (results: any[]) => void;
}

export default function QueryPanel({
  dbName,
  collectionName,
  pageSize,
  onQueryResult,
}: QueryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("{}");
  const [sort, setSort] = useState("{}");
  const [error, setError] = useState<string | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleQuery = async () => {
    try {
      const parsedFilter = JSON.parse(filter);
      const parsedSort = JSON.parse(sort);

      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: dbName,
          collection: collectionName,
          filter: parsedFilter,
          sort: parsedSort,
          limit: pageSize, // Usar o pageSize da paginação
        }),
      });

      const result = await response.json();

      if (result.success) {
        onQueryResult(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError("Erro ao executar query: " + err.message);
    }
  };

  return (
    <>
      <Paper sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box 
            sx={{ flex: 1, cursor: "pointer" }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="subtitle1">🔍 Consulta Avançada</Typography>
            <Typography variant="caption" color="text.secondary">
              Filtra TODA a collection no MongoDB
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Ver guia de operadores e exemplos" arrow>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  setHelpModalOpen(true);
                }}
                color="primary"
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            <TextField
              label="Filtro (JSON)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder='{ "idade": { "$gt": 25 } }'
              multiline
              rows={3}
              size="small"
              sx={{ flex: 2 }}
            />
            <TextField
              label="Ordenação (JSON)"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              placeholder='{ "idade": -1 }'
              multiline
              rows={3}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            💡 Limite: {pageSize >= 1000 ? `${pageSize / 1000}K` : pageSize} documento(s) por página (ajuste na paginação abaixo)
          </Typography>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleQuery}
            >
              Executar Query
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>

    <QueryHelpModal 
      open={helpModalOpen}
      onClose={() => setHelpModalOpen(false)}
    />
  </>
  );
}
