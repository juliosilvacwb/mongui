"use client";

import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Paper, Typography, Alert, IconButton, Tooltip, Snackbar, TextField, Button, CircularProgress } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DocumentGrid from "./DocumentGrid";

interface CollectionViewProps {
  dbName: string;
  collectionName: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collection-tabpanel-${index}`}
      aria-labelledby={`collection-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function CollectionView({
  dbName,
  collectionName,
}: CollectionViewProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedValidator, setEditedValidator] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchSchema();
  }, [dbName, collectionName]);

  const fetchSchema = async () => {
    setLoadingSchema(true);
    try {
      const response = await fetch(
        `/api/collections/schema?db=${dbName}&collection=${collectionName}`
      );
      const result = await response.json();

      if (result.success) {
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const copySchemaToClipboard = () => {
    if (schemaInfo && schemaInfo.validator) {
      navigator.clipboard.writeText(JSON.stringify(schemaInfo.validator, null, 2))
        .then(() => {
          setSnackbarMessage("Schema copiado para área de transferência");
          setSnackbarOpen(true);
        })
        .catch(() => {
          setSnackbarMessage("Erro ao copiar schema");
          setSnackbarOpen(true);
        });
    }
  };

  const handleEditClick = () => {
    if (schemaInfo && schemaInfo.validator) {
      setEditedValidator(JSON.stringify(schemaInfo.validator, null, 2));
      setIsEditing(true);
      setValidationError("");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedValidator("");
    setValidationError("");
  };

  const handleGenerateSchema = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/collections/analyze?db=${dbName}&collection=${collectionName}&sampleSize=100`
      );
      const result = await response.json();

      if (result.success) {
        setEditedValidator(JSON.stringify(result.data.validator, null, 2));
        setIsEditing(true);
        setValidationError("");
        setSnackbarMessage(`Schema gerado analisando ${result.data.stats.documentsAnalyzed} documentos`);
        setSnackbarOpen(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setSnackbarMessage("Erro ao gerar schema: " + error.message);
      setSnackbarOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveValidation = async () => {
    // Validar JSON
    try {
      const parsedValidator = JSON.parse(editedValidator);
      
      setIsSaving(true);
      setValidationError("");

      const response = await fetch("/api/collections/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: dbName,
          collection: collectionName,
          validator: parsedValidator,
          validationLevel: "strict",
          validationAction: "error"
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbarMessage("Validação salva com sucesso!");
        setSnackbarOpen(true);
        setIsEditing(false);
        setEditedValidator("");
        // Recarregar schema
        await fetchSchema();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        setValidationError("JSON inválido: " + error.message);
      } else {
        setValidationError("Erro ao salvar: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box 
        sx={{ 
          borderBottom: 1, 
          borderColor: "divider",
          mb: 0,
          bgcolor: "background.paper"
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="collection tabs"
          sx={{
            minHeight: "48px",
            px: 2,
            "& .MuiTab-root": {
              minHeight: "48px",
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              minWidth: 120,
            },
          }}
        >
          <Tab
            icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Documents"
            id="collection-tab-0"
            aria-controls="collection-tabpanel-0"
          />
          <Tab
            icon={<VerifiedUserIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Validation"
            id="collection-tab-1"
            aria-controls="collection-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <Box sx={{ mt: 2 }}>
          <DocumentGrid dbName={dbName} collectionName={collectionName} />
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 3, mt: 2 }}>
          {loadingSchema ? (
            <Typography>Carregando informações de validação...</Typography>
          ) : schemaInfo && schemaInfo.hasValidation ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VerifiedUserIcon color="primary" />
                Schema de Validação
              </Typography>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Configuração
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Alert severity="info" sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      <strong>Nível:</strong>{" "}
                      {schemaInfo.validationLevel === "strict"
                        ? "Rigoroso (Strict)"
                        : schemaInfo.validationLevel === "moderate"
                        ? "Moderado (Moderate)"
                        : schemaInfo.validationLevel}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {schemaInfo.validationLevel === "strict"
                        ? "Aplica validação a todos os documentos"
                        : "Aplica validação apenas a documentos novos ou já válidos"}
                    </Typography>
                  </Alert>

                  <Alert severity="info" sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      <strong>Ação:</strong>{" "}
                      {schemaInfo.validationAction === "error"
                        ? "Bloquear (Error)"
                        : "Avisar (Warn)"}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {schemaInfo.validationAction === "error"
                        ? "Rejeita operações que violem o schema"
                        : "Registra avisos mas permite a operação"}
                    </Typography>
                  </Alert>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Regras de Validação
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!isEditing ? (
                    <>
                      <Tooltip title="Copiar schema">
                        <IconButton size="small" onClick={copySchemaToClipboard}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar validação">
                        <IconButton size="small" onClick={handleEditClick} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Cancelar">
                        <IconButton size="small" onClick={handleCancelEdit}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Salvar validação">
                        <IconButton 
                          size="small" 
                          onClick={handleSaveValidation}
                          color="primary"
                          disabled={isSaving}
                        >
                          {isSaving ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>

              {validationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationError}
                </Alert>
              )}

              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={editedValidator}
                  onChange={(e) => setEditedValidator(e.target.value)}
                  variant="outlined"
                  error={!!validationError}
                  sx={{
                    "& textarea": {
                      fontFamily: "Roboto Mono, monospace",
                      fontSize: "0.813rem",
                    },
                  }}
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 0,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                    overflow: "hidden",
                    maxHeight: "500px",
                  }}
                >
                  <Box
                    component="pre"
                    sx={{
                      margin: 0,
                      fontFamily: "Roboto Mono, monospace",
                      fontSize: "0.813rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: (theme) => theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                      p: 2,
                      overflow: "auto",
                      maxHeight: "500px",
                    }}
                  >
                    {JSON.stringify(schemaInfo.validator, null, 2)}
                  </Box>
                </Paper>
              )}

              {schemaInfo.validator.$jsonSchema && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Resumo do Schema
                  </Typography>
                  <ValidationSummary schema={schemaInfo.validator.$jsonSchema} />
                </Box>
              )}
            </Box>
          ) : !isEditing ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <VerifiedUserIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma Validação Configurada
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta coleção não possui validação de schema ativa.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                Crie uma validação personalizada ou gere automaticamente baseada nos documentos existentes.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                  onClick={handleGenerateSchema}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Gerando..." : "Gerar Automaticamente"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditedValidator(JSON.stringify({
                      $jsonSchema: {
                        bsonType: "object",
                        required: [],
                        properties: {}
                      }
                    }, null, 2));
                    setIsEditing(true);
                  }}
                >
                  Criar Manualmente
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VerifiedUserIcon color="primary" />
                Criar Schema de Validação
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Defina as regras de validação no formato JSON Schema. 
                  Os campos em "required" serão obrigatórios e "properties" define as restrições de cada campo.
                </Typography>
              </Alert>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Regras de Validação
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Cancelar">
                    <IconButton size="small" onClick={handleCancelEdit}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Salvar validação">
                    <IconButton 
                      size="small" 
                      onClick={handleSaveValidation}
                      color="primary"
                      disabled={isSaving}
                    >
                      {isSaving ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {validationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationError}
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={20}
                value={editedValidator}
                onChange={(e) => setEditedValidator(e.target.value)}
                variant="outlined"
                error={!!validationError}
                placeholder='{"$jsonSchema": {"bsonType": "object", "required": ["campo1"], "properties": {...}}}'
                sx={{
                  "& textarea": {
                    fontFamily: "Roboto Mono, monospace",
                    fontSize: "0.813rem",
                  },
                }}
              />
            </Box>
          )}
        </Paper>
      </TabPanel>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

// Componente auxiliar para mostrar resumo do schema
function ValidationSummary({ schema }: { schema: any }) {
  const required = schema.required || [];
  const properties = schema.properties || {};

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {required.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Campos Obrigatórios ({required.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {required.map((field: string) => (
              <Box
                key={field}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                  borderRadius: 1,
                  fontSize: "0.813rem",
                  fontFamily: "monospace",
                }}
              >
                {field}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {Object.keys(properties).length > 0 && (
        <Box>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Propriedades ({Object.keys(properties).length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Object.entries(properties).map(([key, value]: [string, any]) => (
              <Box
                key={key}
                sx={{
                  p: 1.5,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {key}
                  </Typography>
                  {value.bsonType && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        borderRadius: 0.5,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {value.bsonType}
                    </Box>
                  )}
                  {required.includes(key) && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: "error.main",
                        color: "error.contrastText",
                        borderRadius: 0.5,
                        fontSize: "0.75rem",
                      }}
                    >
                      obrigatório
                    </Box>
                  )}
                </Box>
                {value.description && (
                  <Typography variant="caption" color="text.secondary">
                    {value.description}
                  </Typography>
                )}
                {value.enum && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Valores: {value.enum.join(", ")}
                  </Typography>
                )}
                {(value.minimum !== undefined || value.maximum !== undefined) && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {value.minimum !== undefined && `Min: ${value.minimum}`}
                    {value.minimum !== undefined && value.maximum !== undefined && " | "}
                    {value.maximum !== undefined && `Max: ${value.maximum}`}
                  </Typography>
                )}
                {value.pattern && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5, fontFamily: "monospace" }}
                  >
                    Padrão: {value.pattern}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
