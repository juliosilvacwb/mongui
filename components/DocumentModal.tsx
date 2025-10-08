"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";

interface DocumentModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: any;
  dbName?: string;
  collectionName?: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function DocumentModal({
  open,
  mode,
  initialData,
  dbName,
  collectionName,
  onClose,
  onSave,
}: DocumentModalProps) {
  const [jsonText, setJsonText] = useState(
    initialData ? JSON.stringify(initialData, null, 2) : "{}"
  );
  const [error, setError] = useState<string | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);

  useEffect(() => {
    if (open) {
      setJsonText(initialData ? JSON.stringify(initialData, null, 2) : "{}");
      setError(null);
      
      // Buscar schema de validação se disponível
      if (dbName && collectionName) {
        fetchSchema();
      }
    }
  }, [open, initialData, dbName, collectionName]);

  const fetchSchema = async () => {
    setLoadingSchema(true);
    try {
      const response = await fetch(
        `/api/collections/schema?db=${dbName}&collection=${collectionName}`
      );
      const result = await response.json();
      
      if (result.success && result.data.hasValidation) {
        setSchemaInfo(result.data);
      } else {
        setSchemaInfo(null);
      }
    } catch (err) {
      console.error("Erro ao buscar schema:", err);
      setSchemaInfo(null);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Validar que é um objeto ou array de objetos
      if (mode === "create") {
        if (Array.isArray(parsed)) {
          // Se for array, validar que todos os itens são objetos
          if (parsed.length === 0) {
            setError("Array não pode estar vazio");
            return;
          }
          if (!parsed.every(item => typeof item === "object" && item !== null)) {
            setError("Todos os itens do array devem ser objetos");
            return;
          }
        } else if (typeof parsed !== "object" || parsed === null) {
          setError("Deve ser um objeto ou um array de objetos");
          return;
        }
      } else {
        // No modo edit, deve ser apenas um objeto
        if (Array.isArray(parsed)) {
          setError("Modo edição aceita apenas um objeto");
          return;
        }
        if (typeof parsed !== "object" || parsed === null) {
          setError("Deve ser um objeto");
          return;
        }
      }
      
      setError(null);
      onSave(parsed);
    } catch (err: any) {
      setError("JSON inválido: " + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Novo Documento(s)" : "Editar Documento"}
      </DialogTitle>
      <DialogContent>
        {mode === "create" && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            💡 Digite um objeto {`{...}`} ou um array de objetos {`[{...}, {...}]`}
          </Typography>
        )}
        
        {/* Aviso sobre validação de schema */}
        {schemaInfo && schemaInfo.hasValidation && (
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ mb: 2, mt: 1 }}
          >
            <Typography variant="body2" fontWeight="bold">
              Esta coleção possui validação de schema ativa
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Nível: {schemaInfo.validationLevel === "strict" ? "Rigoroso" : "Moderado"} | 
              Ação: {schemaInfo.validationAction === "error" ? "Bloquear" : "Avisar"}
            </Typography>
            
            <Accordion 
              sx={{ 
                mt: 1, 
                boxShadow: 'none',
                '&:before': { display: 'none' },
                bgcolor: 'transparent'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption" fontWeight="bold">
                  Ver regras de validação
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="pre"
                  sx={{
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    bgcolor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {JSON.stringify(schemaInfo.validator, null, 2)}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Alert>
        )}

        {/* Mensagem de erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            variant="outlined"
            error={!!error}
            placeholder={mode === "create" ? '{"nome": "Teste"} ou [{"nome": "Doc1"}, {"nome": "Doc2"}]' : '{"campo": "valor"}'}
            sx={{
              fontFamily: "monospace",
              "& textarea": {
                fontFamily: "Roboto Mono, monospace",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
