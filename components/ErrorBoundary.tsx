"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { Box, Typography, Button, Paper, Container, Alert } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import BugReportIcon from "@mui/icons-material/BugReport";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Captura erros não tratados em toda a aplicação
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Atualiza o state para renderizar UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    console.error("❌ Error Boundary capturou um erro:", error);
    console.error("📋 Error Info:", errorInfo);

    // Atualizar state com informações do erro
    this.setState({
      error,
      errorInfo,
    });

    // Em produção, você poderia enviar para um serviço de monitoring
    // Ex: Sentry, LogRocket, DataDog, etc.
    if (process.env.NODE_ENV === "production") {
      // TODO: Enviar para serviço de monitoring
      // sendErrorToMonitoring(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
            p: 3,
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              {/* Ícone */}
              <ErrorOutlineIcon
                sx={{
                  fontSize: 80,
                  color: "error.main",
                  mb: 2,
                }}
              />

              {/* Título */}
              <Typography variant="h4" gutterBottom fontWeight={600}>
                Oops! Algo deu errado
              </Typography>

              {/* Descrição */}
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Desculpe, ocorreu um erro inesperado na aplicação.
                <br />
                Nossa equipe foi notificada e está trabalhando para resolver.
              </Typography>

              {/* Detalhes do erro (apenas em desenvolvimento) */}
              {isDevelopment && this.state.error && (
                <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Detalhes do Erro (Desenvolvimento):
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      overflow: "auto",
                      maxHeight: 200,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {"\n\nStack Trace:\n"}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </Typography>
                </Alert>
              )}

              {/* Ações */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                >
                  Recarregar Página
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                >
                  Voltar ao Início
                </Button>

                {isDevelopment && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<BugReportIcon />}
                    onClick={this.handleReset}
                  >
                    Resetar Erro (Dev)
                  </Button>
                )}
              </Box>

              {/* Dicas */}
              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  💡 Dicas:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • Tente recarregar a página
                  <br />
                  • Limpe o cache do navegador
                  <br />
                  • Verifique sua conexão com a internet
                  <br />
                  • Se o problema persistir, entre em contato com o suporte
                </Typography>
              </Box>

              {/* Footer */}
              {!isDevelopment && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: "block", mt: 3 }}
                >
                  Erro ID: {Date.now().toString(36)}
                </Typography>
              )}
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

