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
} from "@mui/material";

interface DocumentModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function DocumentModal({
  open,
  mode,
  initialData,
  onClose,
  onSave,
}: DocumentModalProps) {
  const [jsonText, setJsonText] = useState(
    initialData ? JSON.stringify(initialData, null, 2) : "{}"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setJsonText(initialData ? JSON.stringify(initialData, null, 2) : "{}");
      setError(null);
    }
  }, [open, initialData]);

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
      onClose();
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
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={15}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            variant="outlined"
            error={!!error}
            helperText={error}
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
