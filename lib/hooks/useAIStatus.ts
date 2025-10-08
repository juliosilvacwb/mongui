"use client";

import { useState, useEffect } from "react";

interface AIStatus {
  enabled: boolean;
  provider: 'openai' | 'groq' | null;
  message: string;
  model?: string;
  loading: boolean;
}

/**
 * Hook para verificar status da configuração de IA
 */
export function useAIStatus() {
  const [aiStatus, setAIStatus] = useState<AIStatus>({
    enabled: false,
    provider: null,
    message: "Verificando configuração...",
    loading: true,
  });

  useEffect(() => {
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await fetch("/api/ai/status");
      const result = await response.json();

      if (result.success) {
        setAIStatus({
          enabled: result.data.enabled,
          provider: result.data.provider,
          message: result.data.message,
          model: result.data.model,
          loading: false,
        });
      } else {
        setAIStatus({
          enabled: false,
          provider: null,
          message: "Erro ao verificar status da IA",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar status da IA:", error);
      setAIStatus({
        enabled: false,
        provider: null,
        message: "IA não configurada",
        loading: false,
      });
    }
  };

  const refresh = () => {
    setAIStatus((prev) => ({ ...prev, loading: true }));
    fetchAIStatus();
  };

  return { ...aiStatus, refresh };
}
