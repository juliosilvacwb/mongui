"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import TerminalIcon from "@mui/icons-material/Terminal";
import HomeIcon from "@mui/icons-material/Home";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Chip, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/TranslationContext";
import { useState } from "react";

interface AppBarTopProps {
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  connectionStatus?: "connected" | "disconnected" | "connecting";
}

export default function AppBarTop({
  onToggleTheme,
  isDarkMode = true,
  connectionStatus = "connected",
}: AppBarTopProps) {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const isShellPage = pathname === "/shell";
  const isHomePage = pathname === "/";

  const statusColors = {
    connected: "success",
    disconnected: "error",
    connecting: "warning",
  } as const;

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchor(null);
  };

  const handleLanguageChange = (lang: "en" | "pt") => {
    setLanguage(lang);
    handleLangMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8
              }
            }}
          >
            🍃 Mongui
          </Typography>
        </Link>
        
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={t.appBar[connectionStatus]}
            color={statusColors[connectionStatus]}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />

          {!isHomePage && (
            <Tooltip title={t.appBar.home}>
              <Link href="/" passHref style={{ textDecoration: "none", color: "inherit" }}>
                <IconButton color="inherit">
                  <HomeIcon />
                </IconButton>
              </Link>
            </Tooltip>
          )}

          <Tooltip title={t.appBar.language}>
            <IconButton color="inherit" onClick={handleLangMenuOpen}>
              <LanguageIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={langMenuAnchor}
            open={Boolean(langMenuAnchor)}
            onClose={handleLangMenuClose}
          >
            <MenuItem 
              onClick={() => handleLanguageChange("en")}
              selected={language === "en"}
            >
              <ListItemIcon>
                <Box sx={{ fontSize: "1.5rem" }}>🇺🇸</Box>
              </ListItemIcon>
              <ListItemText>English</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => handleLanguageChange("pt")}
              selected={language === "pt"}
            >
              <ListItemIcon>
                <Box sx={{ fontSize: "1.5rem" }}>🇧🇷</Box>
              </ListItemIcon>
              <ListItemText>Português</ListItemText>
            </MenuItem>
          </Menu>

          <Tooltip title={isDarkMode ? t.appBar.lightTheme : t.appBar.darkTheme}>
            <IconButton color="inherit" onClick={onToggleTheme}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
