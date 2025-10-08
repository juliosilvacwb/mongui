"use client";

import { useState, useEffect } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import QueryHelpModal from "./QueryHelpModal";
import { useTranslation } from "@/lib/i18n/TranslationContext";

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
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("{}");
  const [sort, setSort] = useState("{}");
  const [error, setError] = useState<string | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [showTypeAlert, setShowTypeAlert] = useState(true);

  // Verificar se o usuário já fechou o alerta antes
  useEffect(() => {
    const alertDismissed = localStorage.getItem('mongui-type-alert-dismissed');
    if (alertDismissed === 'true') {
      setShowTypeAlert(false);
    }
  }, []);

  const handleCloseTypeAlert = () => {
    setShowTypeAlert(false);
    localStorage.setItem('mongui-type-alert-dismissed', 'true');
  };

  const handleQuery = async () => {
    // Validar JSON do filtro
    try {
      JSON.parse(filter);
    } catch (err: any) {
      setError(`${t.queryPanel.invalidFilterJson}: ${err.message}`);
      return;
    }

    // Validar JSON da ordenação
    try {
      JSON.parse(sort);
    } catch (err: any) {
      setError(`${t.queryPanel.invalidSortJson}: ${err.message}`);
      return;
    }

    // Se chegou aqui, ambos são válidos
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
          limit: pageSize,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(t.messages.queryExecuted, result.data.length, t.documentGrid.documents);
        onQueryResult(result.data);
        setError(null);
      } else {
        console.error(t.messages.errorExecutingQuery, result.error);
        setError(result.error);
      }
    } catch (err: any) {
      console.error(t.messages.errorExecutingQuery, err);
      setError(`${t.messages.errorExecutingQuery}: ${err.message}`);
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
            <Typography variant="subtitle1">🔍 {t.queryPanel.advancedQuery}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t.queryPanel.filterEntireCollection}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t.queryPanel.viewGuide} arrow>
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
              label={t.queryPanel.filter}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder='{ "idade": { "$gt": 25 } }'
              multiline
              rows={3}
              size="small"
              sx={{ flex: 2 }}
            />
            <TextField
              label={t.queryPanel.sort}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              placeholder='{ "idade": -1 }'
              multiline
              rows={3}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
          
          {showTypeAlert && (
            <Box 
              sx={{ 
                mt: 1.5, 
                p: 1.5, 
                bgcolor: "warning.main", 
                color: "warning.contrastText", 
                borderRadius: 1,
                fontSize: "0.8rem",
                position: "relative"
              }}
            >
              <IconButton
                size="small"
                onClick={handleCloseTypeAlert}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  color: "warning.contrastText",
                  padding: "2px",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.1)"
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <Box sx={{ fontWeight: "bold", mb: 0.5, pr: 3 }}>⚠️ {t.queryPanel.typesWarning}</Box>
              <Box sx={{ fontFamily: "monospace" }}>
                {t.queryPanel.typesExample}
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            💡 {t.queryPanel.limit}: {pageSize >= 1000 ? `${pageSize / 1000}K` : pageSize} {t.queryPanel.documentsPerPage}
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
              {t.queryPanel.executeQuery}
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
