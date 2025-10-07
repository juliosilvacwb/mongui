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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

interface DeleteCollectionModalProps {
  open: boolean;
  dbName: string;
  collectionName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCollectionModal({
  open,
  dbName,
  collectionName,
  onClose,
  onSuccess,
}: DeleteCollectionModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setConfirmation("");
      setError(null);
    }
  }, [open]);

  const handleDelete = async () => {
    if (confirmation !== collectionName) {
      setError("Nome da collection não coincide. Digite exatamente como aparece acima.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collections/delete?db=${encodeURIComponent(dbName)}&collection=${encodeURIComponent(collectionName)}&confirmation=${encodeURIComponent(confirmation)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError("Erro ao deletar collection: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmationValid = confirmation === collectionName;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="error" />
          Deletar Collection
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Alerta de perigo */}
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
            </Typography>
            <Typography variant="body2">
              Você está prestes a deletar a collection <strong>{collectionName}</strong>{" "}
              e TODOS os seus documentos do database <strong>{dbName}</strong>.
              <br />
              <br />
              Esta operação NÃO pode ser desfeita!
            </Typography>
          </Alert>

          {/* Informação da collection */}
          <Box
            sx={{
              bgcolor: "background.default",
              p: 2,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Collection que será deletada:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Database: <strong>{dbName}</strong>
            </Typography>
            <Typography variant="h6" color="error.main" fontWeight={600}>
              {collectionName}
            </Typography>
          </Box>

          {/* Campo de confirmação */}
          <Typography variant="body2" sx={{ mb: 1 }} fontWeight={500}>
            Digite o nome da collection para confirmar:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={collectionName}
            error={confirmation.length > 0 && !isConfirmationValid}
            helperText={
              confirmation.length > 0 && !isConfirmationValid
                ? "Nome não coincide"
                : `Digite: ${collectionName}`
            }
            disabled={loading}
            sx={{
              "& input": {
                fontFamily: "monospace",
                fontWeight: 600,
              },
            }}
          />

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
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading || !isConfirmationValid}
          startIcon={<DeleteIcon />}
        >
          {loading ? "Deletando..." : "Deletar Collection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

