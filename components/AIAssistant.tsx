"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Alert,
  Collapse,
  CircularProgress,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SpeedIcon from "@mui/icons-material/Speed";
import { useAIStatus } from "@/lib/hooks/useAIStatus";
import { requestAICommand, formatAIError } from "@/lib/aiHelper";

interface AIAssistantProps {
  dbName: string;
  collectionName?: string;
  onCommandGenerated?: (command: string) => void;
  onExecuteCommand?: (command: string) => void;
}

interface CommandSuggestion {
  command: string;
  explanation: string;
  performanceTip?: string;
  warning?: string;
  fromCache?: boolean;
}

export default function AIAssistant({
  dbName,
  collectionName,
  onCommandGenerated,
  onExecuteCommand,
}: AIAssistantProps) {
  const aiStatus = useAIStatus();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<CommandSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);

  // Exemplos de prompts contextualizados
  const examplePrompts = collectionName ? [
    `buscar todos os documentos`,
    `contar documentos por status`,
    `documentos criados nos últimos 7 dias`,
    `top 10 mais recentes`,
  ] : [
    `listar todas as collections`,
    `estatísticas do database`,
    `documentos de uma collection`,
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || !collectionName) {
      setError("Digite um prompt válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await requestAICommand(prompt, dbName, collectionName);
      setSuggestion(result);
      setShowExamples(false);
      
      if (onCommandGenerated) {
        onCommandGenerated(result.command);
      }
    } catch (err: any) {
      setError(formatAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleCopyCommand = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion.command);
    }
  };

  const handleExecuteCommand = () => {
    if (suggestion && onExecuteCommand) {
      onExecuteCommand(suggestion.command);
      // Limpar após executar
      setSuggestion(null);
      setPrompt("");
    }
  };

  const handleUseExample = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  const handleClear = () => {
    setPrompt("");
    setSuggestion(null);
    setError(null);
    setShowExamples(true);
  };

  if (aiStatus.loading) {
    return (
      <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Verificando configuração de IA...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!aiStatus.enabled) {
    return (
      <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              Assistente IA Desabilitado
            </Typography>
          </Box>
          <Tooltip title={aiStatus.message}>
            <Chip 
              label="Configure API Key" 
              size="small" 
              variant="outlined"
              sx={{ cursor: "help" }}
            />
          </Tooltip>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: "background.paper",
        border: 2,
        borderColor: "primary.main",
        position: "relative"
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "primary.main" }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Assistente IA MongoDB
          </Typography>
          <Chip 
            label={aiStatus.provider === 'openai' ? 'OpenAI' : 'Groq'} 
            size="small" 
            color="primary"
            variant="outlined"
          />
          {aiStatus.model && (
            <Chip 
              label={aiStatus.model} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
        <IconButton size="small" onClick={handleClear}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Input Area */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Descreva o que você quer fazer... (ex: buscar usuários ativos dos últimos 30 dias)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !collectionName}
          helperText={!collectionName ? "Selecione uma collection para usar IA" : "Ctrl+Enter para gerar"}
          sx={{
            "& .MuiInputBase-root": {
              fontFamily: "Roboto, sans-serif",
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || !collectionName}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? "Gerando..." : "Gerar"}
        </Button>
      </Box>

      {/* Examples */}
      <Collapse in={showExamples && !suggestion && !error && !loading}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            💡 Exemplos de prompts:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {examplePrompts.map((example, idx) => (
              <Chip
                key={idx}
                label={example}
                size="small"
                variant="outlined"
                onClick={() => handleUseExample(example)}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>
      </Collapse>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Suggestion */}
      {suggestion && (
        <Box>
          <Divider sx={{ mb: 2 }} />
          
          {/* From Cache Indicator */}
          {suggestion.fromCache && (
            <Chip 
              label="⚡ Resposta do cache" 
              size="small" 
              color="success" 
              sx={{ mb: 1 }}
            />
          )}

          {/* Command */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5, display: "block" }}>
              Comando Gerado:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                position: "relative",
              }}
            >
              <Box
                component="pre"
                sx={{
                  margin: 0,
                  fontFamily: "Roboto Mono, monospace",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: (theme) => theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                  pr: 8,
                }}
              >
                {suggestion.command}
              </Box>
              <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
                <Tooltip title="Copiar comando">
                  <IconButton size="small" onClick={handleCopyCommand}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {onExecuteCommand && (
                  <Tooltip title="Executar comando">
                    <IconButton size="small" onClick={handleExecuteCommand} color="primary">
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Explanation */}
          {suggestion.explanation && (
            <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Explicação:</strong> {suggestion.explanation}
              </Typography>
            </Alert>
          )}

          {/* Performance Tip */}
          {suggestion.performanceTip && (
            <Alert severity="success" icon={<SpeedIcon />} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Dica de Performance:</strong> {suggestion.performanceTip}
              </Typography>
            </Alert>
          )}

          {/* Warning */}
          {suggestion.warning && (
            <Alert severity="warning" icon={<WarningAmberIcon />}>
              <Typography variant="body2">
                <strong>Atenção:</strong> {suggestion.warning}
              </Typography>
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
