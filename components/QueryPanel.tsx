"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Collapse,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface QueryPanelProps {
  dbName: string;
  collectionName: string;
  onQueryResult: (results: any[]) => void;
}

export default function QueryPanel({
  dbName,
  collectionName,
  onQueryResult,
}: QueryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("{}");
  const [sort, setSort] = useState("{}");
  const [limit, setLimit] = useState("50");
  const [error, setError] = useState<string | null>(null);

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
          limit: parseInt(limit, 10),
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
    <Paper sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle1">🔍 Consulta Avançada</Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Filtro (JSON)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder='{ "idade": { "$gt": 25 } }'
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ordenação (JSON)"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                placeholder='{ "idade": -1 }'
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Limite"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                type="number"
                size="small"
              />
            </Grid>
          </Grid>

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
  );
}
