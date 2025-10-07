"use client";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import Typography from "@mui/material/Typography";
import { useThemeMode } from "@/components/ThemeRegistry";

export default function Home() {
  const { toggleTheme, mode } = useThemeMode();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBarTop 
        onToggleTheme={toggleTheme}
        isDarkMode={mode === "dark"}
      />
      <SideDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h5" gutterBottom>
          Bem-vindo ao Mongui
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecione um database e collection no menu lateral para começar.
        </Typography>
      </Box>
    </Box>
  );
}
