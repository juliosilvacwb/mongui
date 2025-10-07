# 🎨 Guia de Tema - Mongui

Este documento descreve o sistema de temas implementado no Mongui.

---

## 🌓 Modos Disponíveis

### Dark Mode (Padrão)
- Background: `#1C1C1C`
- Paper: `#2C2C2C`
- Primary: `#00ED64` (Verde MongoDB)
- Text: `#FFFFFF`

### Light Mode
- Background: `#F5F5F5`
- Paper: `#FFFFFF`
- Primary: `#00684A` (Verde Escuro)
- Text: `#000000`

---

## 🎨 Paleta Completa

### Primary (Verde MongoDB)
```css
Dark Mode:
  main: #00ED64
  light: #4DFFA1
  dark: #00B84F
  contrast: #000000

Light Mode:
  main: #00684A
  light: #00A86B
  dark: #004D35
  contrast: #FFFFFF
```

### Secondary
```css
Dark Mode:
  main: #E3FCF7
  light: #FFFFFF
  dark: #B0E9E0
  contrast: #000000

Light Mode:
  main: #001E2B
  light: #003D5B
  dark: #000000
  contrast: #FFFFFF
```

### Error
```css
Dark Mode: #F44336
Light Mode: #D32F2F
```

### Warning
```css
Dark Mode: #FF9800
Light Mode: #F57C00
```

### Info
```css
Dark Mode: #2196F3
Light Mode: #1976D2
```

### Success
```css
Dark Mode: #4CAF50
Light Mode: #388E3C
```

---

## 📐 Typography

### Fontes
```css
Font Family: 'Roboto', 'Segoe UI', 'Arial', sans-serif
Mono Font: 'Roboto Mono', 'Consolas', 'Monaco', monospace
```

### Hierarquia
```css
H1: 2.5rem, 700
H2: 2rem, 700
H3: 1.75rem, 600
H4: 1.5rem, 600
H5: 1.25rem, 600
H6: 1rem, 600
Body1: 1rem
Body2: 0.875rem
Button: none (no uppercase), 500
```

---

## 🎭 Transições

### Durations
```typescript
shortest: 150ms
shorter: 200ms
short: 250ms
standard: 300ms
complex: 375ms
enteringScreen: 225ms
leavingScreen: 195ms
```

### Easing
```typescript
easeInOut: cubic-bezier(0.4, 0, 0.2, 1)
easeOut: cubic-bezier(0.0, 0, 0.2, 1)
easeIn: cubic-bezier(0.4, 0, 1, 1)
sharp: cubic-bezier(0.4, 0, 0.6, 1)
```

---

## 🎬 Animações CSS

### fadeIn
```css
Duração: 0.3s
Easing: ease-in-out
Uso: Componentes que aparecem
```

### slideInUp
```css
Duração: 0.4s
Easing: ease-out
Uso: Modais, tooltips
```

### pulse
```css
Duração: 2s
Infinite: true
Uso: Loading indicators
```

### shimmer
```css
Duração: 2s
Infinite: true
Uso: Skeleton screens
```

**Como usar:**
```jsx
<div className="fade-in">Conteúdo</div>
<div className="slide-in-up">Modal</div>
<div className="pulse">Loading...</div>
<div className="skeleton">Skeleton</div>
```

---

## 📜 Scrollbar Customizada

### Dark Mode
```css
Track: #1E1E1E
Thumb: #464646
Thumb Hover: #00ED64 (verde MongoDB)
Border Radius: 5px
Width/Height: 10px
```

### Light Mode
```css
Track: #E0E0E0
Thumb: #B0B0B0
Thumb Hover: #00684A (verde escuro)
Border Radius: 5px
Width/Height: 10px
```

---

## 🎯 Component Overrides

### MuiButton
- Border Radius: 8px
- Text Transform: none
- Hover: translateY(-1px) + shadow
- No default shadow em contained

### MuiIconButton
- Hover: background sutil (alpha 0.08 dark, 0.04 light)

### MuiDrawer
- Background: #252525 (dark) | #FAFAFA (light)
- Border: 1px solid rgba

### MuiAppBar
- Background: #2C2C2C (dark) | #FFFFFF (light)
- Shadow: sutil

### MuiTooltip
- Background: #464646 (dark) | #616161 (light)
- Font Size: 0.75rem
- Padding: 8px 12px
- Border Radius: 6px

### MuiListItemButton
- Selected: primary color com alpha 0.16 (dark) | 0.12 (light)
- Selected Hover: alpha aumentado 0.24 (dark) | 0.18 (light)

### MuiDialog
- Border Radius: 12px

### MuiTextField
- Border Transition: 0.2s ease

---

## 🔧 Utility Classes

### Scrollbar
```css
.no-scrollbar - Esconde scrollbar completamente
.smooth-scroll - Adiciona scroll-behavior: smooth
```

### Loading
```css
.skeleton - Efeito shimmer para loading
```

### Acessibilidade
```css
.sr-only - Screen reader only (visível apenas para leitores de tela)
```

---

## 💡 Como Usar no Código

### Hook useThemeMode
```typescript
import { useThemeMode } from "@/components/ThemeRegistry";

function MyComponent() {
  const { toggleTheme, mode } = useThemeMode();
  
  return (
    <button onClick={toggleTheme}>
      Tema atual: {mode}
    </button>
  );
}
```

### Acessar Cores do Tema
```typescript
import { useTheme } from "@mui/material/styles";

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText 
    }}>
      Verde MongoDB
    </div>
  );
}
```

### Usar Palette no sx prop
```jsx
<Box sx={{ 
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': {
    bgcolor: 'primary.dark'
  }
}}>
  Conteúdo
</Box>
```

---

## 🎨 Selection Styling

```css
Dark Mode:
  Background: #00ED64
  Color: #000

Light Mode:
  Background: #00684A
  Color: #FFF
```

---

## 🖼️ Shadows

### Dark Mode
- Mais intensas (rgba com alpha 0.5)
- 24 níveis de sombra

### Light Mode
- Mais sutis (Material Design padrão)
- Graduação suave

---

## ♿ Accessibility

### Focus Styles
```css
Outline: 2px solid #00ED64 (dark) | #00684A (light)
Outline Offset: 2px
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
```

---

## 🖨️ Print Styles

Ao imprimir:
- Backgrounds transparentes
- Cores pretas
- Sem sombras
- Links sublinhados
- Page break control

---

## 💾 Persistência

O tema é salvo automaticamente no `localStorage`:

```typescript
Key: "mongui-theme"
Values: "dark" | "light"
```

Carregamento ao montar:
```typescript
useEffect(() => {
  const savedMode = localStorage.getItem("mongui-theme");
  if (savedMode) setMode(savedMode);
}, []);
```

---

## 🔄 Troca de Tema Suave

Previne flash durante troca:

```typescript
const toggleTheme = () => {
  // Desabilita transições temporariamente
  document.body.classList.add("disable-transitions");
  
  setMode(newMode);
  
  // Re-habilita após 50ms
  setTimeout(() => {
    document.body.classList.remove("disable-transitions");
  }, 50);
};
```

---

## 📱 Responsividade

Todos os componentes são responsivos:
- Breakpoints Material UI padrão
- Mobile-first approach
- Touch-friendly (min 44px targets)

---

## 🎯 Best Practices

1. **Sempre use theme.palette** ao invés de cores hardcoded
2. **Use sx prop** para styling inline com type safety
3. **Prefira useTheme()** ao invés de importar cores diretamente
4. **Teste em ambos temas** (dark e light)
5. **Verifique contraste** (WCAG AAA quando possível)
6. **Use transitions** para melhor UX
7. **Considere prefers-reduced-motion** para acessibilidade

---

## 🚀 Exemplo Completo

```typescript
import { useThemeMode } from "@/components/ThemeRegistry";
import { useTheme } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export default function ExampleComponent() {
  const { toggleTheme, mode } = useThemeMode();
  const theme = useTheme();
  
  return (
    <Box 
      className="fade-in"
      sx={{ 
        bgcolor: 'background.paper',
        p: 3,
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Button 
        variant="contained" 
        onClick={toggleTheme}
        sx={{
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'translateY(-2px)'
          }
        }}
      >
        Trocar para {mode === 'dark' ? 'Claro' : 'Escuro'}
      </Button>
    </Box>
  );
}
```

---

**Desenvolvido com ❤️ para Mongui** 🍃✨

