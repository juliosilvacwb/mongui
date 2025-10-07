"use client";

import { use } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBarTop from "@/components/AppBarTop";
import SideDrawer from "@/components/SideDrawer";
import DocumentGrid from "@/components/DocumentGrid";
import { useThemeMode } from "@/components/ThemeRegistry";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ db: string; collection: string }>;
}) {
  const { db, collection } = use(params);
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
        <DocumentGrid dbName={db} collectionName={collection} />
      </Box>
    </Box>
  );
}
