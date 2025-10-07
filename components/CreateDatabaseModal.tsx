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
import StorageIcon from "@mui/icons-material/Storage";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface CreateDatabaseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDatabaseModal({
  open,
  onClose,
  onSuccess,
}: CreateDatabaseModalProps) {
  const { t } = useTranslation();
  const [dbName, setDbName] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setDbName("");
      setCollectionName("");
      setError(null);
    }
  }, [open]);

  // Validação em tempo real
  const validateName = (name: string): string | null => {
    if (!name || name.trim() === "") {
      return "Nome não pode estar vazio";
    }

    if (name.length > 64) {
      return "Máximo 64 caracteres";
    }

    const reservedNames = ["admin", "local", "config"];
    if (reservedNames.includes(name.toLowerCase())) {
      return `'${name}' é reservado pelo MongoDB`;
    }

    const invalidChars = ["/", "\\", ".", '"', "*", "<", ">", ":", "|", "?", "$", " "];
    for (const char of invalidChars) {
      if (name.includes(char)) {
        return `Não pode conter: '${char === " " ? "espaço" : char}'`;
      }
    }

    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(name)) {
      return "Use apenas: a-z, A-Z, 0-9, _ ou -";
    }

    return null;
  };

  // Validação da collection
  const validateCollectionName = (name: string): string | null => {
    if (!name || name.trim() === "") {
      return "Nome da collection não pode estar vazio";
    }

    if (name.length > 120) {
      return "Máximo 120 caracteres";
    }

    if (name.toLowerCase().startsWith("system.")) {
      return "Não pode começar com 'system.'";
    }

    if (name.includes("$")) {
      return "Não pode conter '$'";
    }

    if (name.trim() !== name) {
      return "Não pode começar/terminar com espaço";
    }

    return null;
  };

  const handleCreate = async () => {
    const dbValidationError = validateName(dbName);
    if (dbValidationError) {
      setError(dbValidationError);
      return;
    }

    const collectionValidationError = validateCollectionName(collectionName);
    if (collectionValidationError) {
      setError(collectionValidationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/databases/create", {
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
      setError("Erro ao criar database: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleCreate();
    }
  };

  const currentDbError = validateName(dbName);
  const currentCollectionError = validateCollectionName(collectionName);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StorageIcon color="primary" />
          {t.createDatabase.title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Nome do Database */}
          <TextField
            autoFocus
            fullWidth
            label={t.createDatabase.databaseName}
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.createDatabase.placeholder}
            error={!!currentDbError}
            helperText={currentDbError || t.createDatabase.useOnlyLetters}
            disabled={loading}
            sx={{
              mb: 2,
            }}
          />

          {/* Nome da Collection Inicial */}
          <TextField
            fullWidth
            label={t.createDatabase.collectionName}
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.createDatabase.collectionPlaceholder}
            error={!!currentCollectionError}
            helperText={currentCollectionError || t.createDatabase.firstCollection}
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
              <strong>Database:</strong>
              <br />
              • Máximo <strong>64 caracteres</strong>
              <br />
              • Não pode ser: <strong>admin, local, config</strong>
              <br />
              <br />
              <strong>Collection:</strong>
              <br />
              • Máximo <strong>120 caracteres</strong>
              <br />
              • Não pode começar com: <strong>system.</strong>
              <br />
              • Não pode conter: <Chip label="$" size="small" />
              <br />
              <br />
              <strong>Ambos:</strong>
              <br />• Use apenas: <strong>a-z, A-Z, 0-9, _ ou -</strong>
            </Box>
          </Alert>

          {/* Nota sobre collection inicial */}
          <Alert severity="info">
            <Typography variant="body2">
              💡 <strong>Nota:</strong> O MongoDB cria o database automaticamente ao
              criar a primeira collection. Você pode adicionar mais collections depois.
            </Typography>
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
          {t.createDatabase.cancel}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !!currentDbError || !!currentCollectionError || !dbName || !collectionName}
          startIcon={<StorageIcon />}
        >
          {loading ? t.createDatabase.creating : t.createDatabase.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

