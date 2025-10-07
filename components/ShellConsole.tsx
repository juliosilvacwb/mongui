"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ShellOutput {
  command: string;
  result: any;
  error?: string;
  executionTime?: number;
  timestamp: Date;
}

export default function ShellConsole() {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<ShellOutput[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final quando novo output é adicionado
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async () => {
    if (!command.trim()) return;

    setLoading(true);
    
    // Adicionar ao histórico de comandos
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    try {
      const response = await fetch("/api/shell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();

      setHistory((prev) => [
        ...prev,
        {
          command,
          result: result.data,
          error: result.success ? undefined : result.error,
          executionTime: result.executionTime,
          timestamp: new Date(),
        },
      ]);

      setCommand("");
    } catch (error: any) {
      setHistory((prev) => [
        ...prev,
        {
          command,
          result: null,
          error: error.message || "Erro de conexão",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter para executar
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      executeCommand();
      return;
    }

    // Enter simples também executa
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
      return;
    }

    // Seta para cima - comando anterior
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
      return;
    }

    // Seta para baixo - próximo comando
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
      return;
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCommandHistory([]);
    setHistoryIndex(-1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatOutput = (data: any): string => {
    if (data === null || data === undefined) return "null";
    if (typeof data === "string") return data;
    return JSON.stringify(data, null, 2);
  };

  return (
    <Paper
      sx={{
        height: "calc(100vh - 150px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6">💻 MongoDB Shell</Typography>
          <Typography variant="caption" color="text.secondary">
            Enter ou Ctrl+Enter para executar | ↑↓ para navegar no histórico
          </Typography>
        </Box>
        <Tooltip title="Limpar histórico">
          <IconButton size="small" onClick={clearHistory}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Output Area */}
      <Box
        ref={outputRef}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          bgcolor: (theme) => theme.palette.mode === "dark" ? "#1E1E1E" : "#F5F5F5",
          color: (theme) => theme.palette.mode === "dark" ? "#D4D4D4" : "#1E1E1E",
          fontFamily: "Roboto Mono, Consolas, Monaco, monospace",
          fontSize: "0.875rem",
        }}
      >
        {history.length === 0 && (
          <Box sx={{ color: (theme) => theme.palette.mode === "dark" ? "#6A9955" : "#008000", fontStyle: "italic" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              # 🍃 MongoDB Shell Interativo
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              # Comandos disponíveis:
            </Typography>
            <Typography variant="body2" component="div" sx={{ ml: 2 }}>
              • show dbs
              <br />
              • db.&lt;database&gt;.getCollectionNames()
              <br />
              • db.&lt;database&gt;.&lt;collection&gt;.find({`{}`})
              <br />
              • db.&lt;database&gt;.&lt;collection&gt;.findOne({`{}`})
              <br />
              • db.&lt;database&gt;.&lt;collection&gt;.insertOne({`{name: "Test"}`})
              <br />
              • db.&lt;database&gt;.&lt;collection&gt;.updateOne([{`{}`}, {`{$set: {...}}`}])
              <br />
              • db.&lt;database&gt;.&lt;collection&gt;.deleteOne({`{}`})
              <br />
              • db.&lt;database&gt;.&lt;collection&gt;.countDocuments({`{}`})
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              # Exemplo:
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, color: (theme) => theme.palette.mode === "dark" ? "#4EC9B0" : "#0000FF" }}>
              db.ccee.coletas.find({`{"id_coleta": "12345"}`})
            </Typography>
          </Box>
        )}

        {history.map((entry, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            {/* Command */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <Typography 
                sx={{ 
                  color: (theme) => theme.palette.mode === "dark" ? "#4EC9B0" : "#0000FF",
                  fontWeight: "bold",
                  flex: 1,
                  wordBreak: "break-all"
                }}
              >
                &gt; {entry.command}
              </Typography>
              <Tooltip title="Copiar comando">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(entry.command)}
                  sx={{ 
                    padding: "2px",
                    color: (theme) => theme.palette.mode === "dark" ? "#858585" : "#666666"
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Output */}
            {entry.error ? (
              <Typography 
                sx={{ 
                  color: (theme) => theme.palette.mode === "dark" ? "#F48771" : "#D32F2F",
                  ml: 2,
                  whiteSpace: "pre-wrap"
                }}
              >
                ❌ {entry.error}
              </Typography>
            ) : (
              <Box sx={{ ml: 2 }}>
                <Box 
                  sx={{ 
                    color: (theme) => theme.palette.mode === "dark" ? "#CE9178" : "#A31515",
                    position: "relative",
                    "&:hover .copy-btn": {
                      opacity: 1
                    }
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {formatOutput(entry.result)}
                  </pre>
                  <IconButton
                    className="copy-btn"
                    size="small"
                    onClick={() => copyToClipboard(formatOutput(entry.result))}
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      color: (theme) => theme.palette.mode === "dark" ? "#858585" : "#666666"
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                  {entry.executionTime !== undefined && (
                    <Typography 
                      variant="caption" 
                      sx={{ color: (theme) => theme.palette.mode === "dark" ? "#6A9955" : "#008000" }}
                    >
                      ⏱️ {entry.executionTime}ms
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ color: (theme) => theme.palette.mode === "dark" ? "#858585" : "#666666" }}
                  >
                    {entry.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ))}

        {loading && (
          <Typography sx={{ color: (theme) => theme.palette.mode === "dark" ? "#858585" : "#666666" }}>
            ⏳ Executando...
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2, display: "flex", gap: 1, bgcolor: "background.paper" }}>
        <TextField
          fullWidth
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite comando MongoDB (Enter para executar)"
          size="small"
          disabled={loading}
          multiline
          maxRows={4}
          sx={{
            "& textarea": {
              fontFamily: "Roboto Mono, Consolas, Monaco, monospace",
              fontSize: "0.875rem",
            },
          }}
        />
        <Tooltip title="Executar (Enter)">
          <span>
            <IconButton
              color="primary"
              onClick={executeCommand}
              disabled={loading || !command.trim()}
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "action.disabledBackground",
                  color: "action.disabled",
                }
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

