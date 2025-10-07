"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "@/lib/i18n/TranslationContext";

interface JsonViewerProps {
  data: any[];
  title?: string;
}

export default function JsonViewer({ data, title }: JsonViewerProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Função para syntax highlighting manual
  const highlightJson = (json: string): string => {
    // Substituir chaves (keys)
    json = json.replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:');
    
    // Substituir valores string
    json = json.replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>');
    
    // Substituir números
    json = json.replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>');
    
    // Substituir booleanos e null
    json = json.replace(/: (true|false|null)/g, ': <span class="json-boolean">$1</span>');
    
    return json;
  };

  const jsonString = JSON.stringify(data, null, 2);
  const highlightedJson = highlightJson(jsonString);

  return (
    <Paper
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
          {title && (
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
              {title}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {data.length.toLocaleString()} {t.documentGrid.documents} • {t.documentGrid.jsonPrettyFormat}
          </Typography>
        </Box>

        <Tooltip title={copied ? t.documentGrid.copied : t.documentGrid.copyJson}>
          <IconButton
            onClick={handleCopy}
            color={copied ? "success" : "default"}
            sx={{
              transition: "all 0.2s ease",
            }}
          >
            {copied ? <CheckIcon /> : <ContentCopyIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* JSON Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 3,
          bgcolor: (theme) => theme.palette.mode === "dark" ? "#1E1E1E" : "#F5F5F5",
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: "'Roboto Mono', 'Consolas', 'Monaco', monospace",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: highlightedJson }}
        />
      </Box>
    </Paper>
  );
}
