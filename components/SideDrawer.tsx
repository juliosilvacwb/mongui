"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import StorageIcon from "@mui/icons-material/Storage";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import Typography from "@mui/material/Typography";

const DRAWER_WIDTH = 280;

interface Database {
  name: string;
  collections?: string[];
  expanded?: boolean;
}

export default function SideDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await fetch("/api/databases");
      const result = await response.json();
      
      if (result.success) {
        setDatabases(result.data.map((db: any) => ({ 
          name: db.name, 
          expanded: false 
        })));
      }
    } catch (error) {
      console.error("Erro ao buscar databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseClick = async (dbName: string) => {
    const db = databases.find((d) => d.name === dbName);
    
    if (db?.expanded) {
      // Fechar
      setDatabases((prev) =>
        prev.map((d) => (d.name === dbName ? { ...d, expanded: false } : d))
      );
    } else {
      // Abrir e carregar collections
      try {
        const response = await fetch(`/api/collections?db=${dbName}`);
        const result = await response.json();
        
        if (result.success) {
          setDatabases((prev) =>
            prev.map((d) =>
              d.name === dbName
                ? { 
                    ...d, 
                    expanded: true, 
                    collections: result.data.map((c: any) => c.name) 
                  }
                : d
            )
          );
        }
      } catch (error) {
        console.error("Erro ao buscar collections:", error);
      }
    }
  };

  const handleCollectionClick = (dbName: string, collectionName: string) => {
    // Navegar usando Next.js router (client-side navigation)
    router.push(`/${dbName}/${collectionName}`);
  };

  if (loading) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {databases.map((db) => (
            <div key={db.name}>
              <ListItemButton onClick={() => handleDatabaseClick(db.name)}>
                <ListItemIcon>
                  <StorageIcon />
                </ListItemIcon>
                <ListItemText primary={db.name} />
                {db.expanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={db.expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {db.collections?.map((collection) => (
                    <ListItemButton
                      key={collection}
                      sx={{ pl: 4 }}
                      selected={pathname === `/${db.name}/${collection}`}
                      onClick={() => handleCollectionClick(db.name, collection)}
                    >
                      <ListItemIcon>
                        <DescriptionIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={collection} 
                        primaryTypographyProps={{ fontSize: "0.875rem" }}
                      />
                    </ListItemButton>
                  )) || (
                    <ListItemButton sx={{ pl: 4 }} disabled>
                      <ListItemText 
                        primary="Sem collections" 
                        primaryTypographyProps={{ fontSize: "0.875rem", fontStyle: "italic" }}
                      />
                    </ListItemButton>
                  )}
                </List>
              </Collapse>
            </div>
          ))}

          {databases.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum database encontrado
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Drawer>
  );
}
