"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";

interface QueryHelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function QueryHelpModal({ open, onClose }: QueryHelpModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        📚 Guia de Consultas MongoDB
      </DialogTitle>
      <DialogContent>
        <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
          {/* Operadores de Comparação */}
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
            Operadores de Comparação
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip label="$eq" size="small" />
            <Chip label="$ne" size="small" />
            <Chip label="$gt" size="small" />
            <Chip label="$gte" size="small" />
            <Chip label="$lt" size="small" />
            <Chip label="$lte" size="small" />
            <Chip label="$in" size="small" />
            <Chip label="$nin" size="small" />
          </Box>

          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: "#1E1E1E", 
            color: "#D4D4D4", 
            p: 2, 
            borderRadius: 1,
            fontSize: "0.85rem",
            fontFamily: "monospace"
          }}>
{`// Igual
{ "idade": 25 }
{ "idade": { "$eq": 25 } }

// Maior que
{ "idade": { "$gt": 18 } }

// Maior ou igual
{ "preco": { "$gte": 100 } }

// Menor que
{ "estoque": { "$lt": 10 } }

// Em um array de valores
{ "categoria": { "$in": ["livros", "tech"] } }

// Não está em array
{ "status": { "$nin": ["cancelado", "expirado"] } }`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Operadores Lógicos */}
          <Typography variant="h6" gutterBottom>
            Operadores Lógicos
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip label="$and" size="small" />
            <Chip label="$or" size="small" />
            <Chip label="$not" size="small" />
            <Chip label="$nor" size="small" />
          </Box>

          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: "#1E1E1E", 
            color: "#D4D4D4", 
            p: 2, 
            borderRadius: 1,
            fontSize: "0.85rem",
            fontFamily: "monospace"
          }}>
{`// AND - Todas condições devem ser verdadeiras
{ "$and": [
  { "idade": { "$gte": 18 } },
  { "status": "ativo" }
]}

// OR - Pelo menos uma condição verdadeira
{ "$or": [
  { "categoria": "urgente" },
  { "prioridade": { "$gte": 5 } }
]}

// NOT - Negação
{ "idade": { "$not": { "$lt": 18 } } }`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Operadores de String */}
          <Typography variant="h6" gutterBottom>
            Busca em Texto
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip label="$regex" size="small" />
            <Chip label="$text" size="small" />
            <Chip label="$exists" size="small" />
          </Box>

          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: "#1E1E1E", 
            color: "#D4D4D4", 
            p: 2, 
            borderRadius: 1,
            fontSize: "0.85rem",
            fontFamily: "monospace"
          }}>
{`// Regex - Busca por padrão (case insensitive)
{ "nome": { "$regex": "João", "$options": "i" } }

// Começa com
{ "email": { "$regex": "^admin" } }

// Termina com
{ "arquivo": { "$regex": "\\.pdf$" } }

// Campo existe
{ "telefone": { "$exists": true } }

// Campo não existe
{ "deletedAt": { "$exists": false } }`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Ordenação */}
          <Typography variant="h6" gutterBottom>
            Ordenação
          </Typography>
          
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: "#1E1E1E", 
            color: "#D4D4D4", 
            p: 2, 
            borderRadius: 1,
            fontSize: "0.85rem",
            fontFamily: "monospace"
          }}>
{`// Crescente (A-Z, 0-9)
{ "nome": 1 }

// Decrescente (Z-A, 9-0)
{ "idade": -1 }

// Múltiplos campos
{ "prioridade": -1, "nome": 1 }

// Por data (mais recente primeiro)
{ "createdAt": -1 }`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Exemplos Práticos */}
          <Typography variant="h6" gutterBottom>
            Exemplos Práticos
          </Typography>
          
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: "#1E1E1E", 
            color: "#D4D4D4", 
            p: 2, 
            borderRadius: 1,
            fontSize: "0.85rem",
            fontFamily: "monospace"
          }}>
{`// Usuários ativos maiores de idade
Filtro: { "$and": [
  { "idade": { "$gte": 18 } },
  { "status": "ativo" }
]}
Ordenação: { "createdAt": -1 }

// Produtos em promoção
Filtro: { "preco": { "$lt": 100 }, "estoque": { "$gt": 0 } }
Ordenação: { "preco": 1 }

// Emails que começam com "admin"
Filtro: { "email": { "$regex": "^admin", "$options": "i" } }
Ordenação: { "email": 1 }

// Documentos criados em 2024
Filtro: { "createdAt": { 
  "$gte": "2024-01-01",
  "$lt": "2025-01-01"
}}
Ordenação: { "createdAt": -1 }`}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

