"use client";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import Typography from "@mui/material/Typography";
import { useThemeMode } from "@/components/ThemeRegistry";
import { useTranslation } from "@/lib/i18n/TranslationContext";

export default function Home() {
  const { toggleTheme, mode } = useThemeMode();
  const { t } = useTranslation();

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
          {t.app.welcome}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.app.selectCollection}
        </Typography>
      </Box>
    </Box>
  );
}
