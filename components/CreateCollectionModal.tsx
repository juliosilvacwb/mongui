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
  Chip,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

interface CreateCollectionModalProps {
  open: boolean;
  dbName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCollectionModal({
  open,
  dbName,
  onClose,
  onSuccess,
}: CreateCollectionModalProps) {
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setCollectionName("");
      setError(null);
    }
  }, [open]);

  // Validação em tempo real
  const validateName = (name: string): string | null => {
    if (!name || name.trim() === "") {
      return "Nome não pode estar vazio";
    }

    if (name.length > 120) {
      return "Máximo 120 caracteres";
    }

    if (name.toLowerCase().startsWith("system.")) {
      return "Não pode começar com 'system.' (reservado)";
    }

    if (name.includes("$")) {
      return "Não pode conter '$'";
    }

    if (name.includes("\0")) {
      return "Não pode conter caractere nulo";
    }

    if (name.trim() !== name) {
      return "Não pode começar/terminar com espaço";
    }

    const recommendedPattern = /^[a-zA-Z0-9_-]+$/;
    if (!recommendedPattern.test(name)) {
      const hasSpecialChars = /[^a-zA-Z0-9_-]/.test(name);
      if (hasSpecialChars) {
        return "Recomendado: use apenas a-z, A-Z, 0-9, _ ou -";
      }
    }

    return null;
  };

  const handleCreate = async () => {
    const validationError = validateName(collectionName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/collections/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbName, collectionName }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError("Erro ao criar collection: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleCreate();
    }
  };

  const currentError = validateName(collectionName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon color="primary" />
          Criar Nova Collection
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Database atual */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Database: <strong>{dbName}</strong>
            </Typography>
          </Alert>

          <TextField
            autoFocus
            fullWidth
            label="Nome da Collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="exemplo: usuarios"
            error={!!currentError}
            helperText={currentError || "Use apenas letras, números, _ ou -"}
            disabled={loading}
            sx={{
              mb: 2,
            }}
          />

          {/* Restrições do MongoDB */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              📋 Restrições do MongoDB:
            </Typography>
            <Box sx={{ fontSize: "0.875rem" }}>
              • Máximo <strong>120 caracteres</strong>
              <br />
              • Não pode começar com: <strong>system.</strong>
              <br />
              • Não pode conter: <Chip label="$" size="small" />
              <br />• Recomendado: <strong>a-z, A-Z, 0-9, _ ou -</strong>
            </Box>
          </Alert>

          {/* Erro da API */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !!currentError || !collectionName}
          startIcon={<DescriptionIcon />}
        >
          {loading ? "Criando..." : "Criar Collection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

