"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
import { Button, Divider, Snackbar, Alert, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TerminalIcon from "@mui/icons-material/Terminal";
import CreateDatabaseModal from "./CreateDatabaseModal";
import CreateCollectionModal from "./CreateCollectionModal";
import DeleteDatabaseModal from "./DeleteDatabaseModal";
import DeleteCollectionModal from "./DeleteCollectionModal";
import { useTranslation } from "@/lib/i18n/TranslationContext";

const DRAWER_WIDTH = 280;

interface Database {
  name: string;
  collections?: string[];
  expanded?: boolean;
}

export default function SideDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDbModalOpen, setCreateDbModalOpen] = useState(false);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [deleteDbModalOpen, setDeleteDbModalOpen] = useState(false);
  const [deleteCollectionModalOpen, setDeleteCollectionModalOpen] = useState(false);
  const [selectedDbForCollection, setSelectedDbForCollection] = useState<string>("");
  const [selectedDbForDelete, setSelectedDbForDelete] = useState<string>("");
  const [selectedCollectionForDelete, setSelectedCollectionForDelete] = useState<{
    db: string;
    collection: string;
  }>({ db: "", collection: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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

  const handleCreateDatabase = () => {
    setCreateDbModalOpen(true);
  };

  const handleCreateCollection = (dbName: string) => {
    setSelectedDbForCollection(dbName);
    setCreateCollectionModalOpen(true);
  };

  const handleDatabaseCreated = () => {
    setSnackbar({
      open: true,
      message: t.messages.databaseCreated,
      severity: "success",
    });
    fetchDatabases();
  };

  const handleCollectionCreated = () => {
    setSnackbar({
      open: true,
      message: t.messages.collectionCreated,
      severity: "success",
    });
    // Recarregar collections do database selecionado
    if (selectedDbForCollection) {
      handleDatabaseClick(selectedDbForCollection);
    }
  };

  const handleDeleteDatabase = (dbName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDbForDelete(dbName);
    setDeleteDbModalOpen(true);
  };

  const handleDeleteCollection = (dbName: string, collectionName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCollectionForDelete({ db: dbName, collection: collectionName });
    setDeleteCollectionModalOpen(true);
  };

  const handleDatabaseDeleted = () => {
    setSnackbar({
      open: true,
      message: t.messages.databaseDeleted,
      severity: "success",
    });
    // Redirecionar para home se estava na página do database deletado
    if (pathname.startsWith(`/${selectedDbForDelete}`)) {
      router.push("/");
    }
    fetchDatabases();
  };

  const handleCollectionDeleted = () => {
    setSnackbar({
      open: true,
      message: t.messages.collectionDeleted,
      severity: "success",
    });
    // Redirecionar para home se estava na página da collection deletada
    if (pathname === `/${selectedCollectionForDelete.db}/${selectedCollectionForDelete.collection}`) {
      router.push("/");
    }
    // Recarregar collections do database
    handleDatabaseClick(selectedCollectionForDelete.db);
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
      
      {/* Botão Criar Database */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateDatabase}
          size="small"
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
          }}
        >
          {t.sidebar.newDatabase}
        </Button>
      </Box>

      <Divider />

      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <List>
          {databases.map((db) => (
            <div key={db.name}>
            {/* Database Item */}
            <ListItemButton
              onClick={() => handleDatabaseClick(db.name)}
              sx={{
                "&:hover .db-actions": {
                  opacity: 1,
                },
              }}
            >
              <ListItemIcon>
                <StorageIcon />
              </ListItemIcon>
              <ListItemText primary={db.name} />
              
              <Tooltip title={t.sidebar.openShell}>
                <IconButton
                  className="db-actions"
                  component={Link}
                  href={`/shell/${db.name}`}
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    opacity: 0,
                    transition: "opacity 0.2s",
                    mr: 0.5,
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  <TerminalIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t.sidebar.deleteDatabase}>
                <IconButton
                  className="db-actions"
                  size="small"
                  onClick={(e) => handleDeleteDatabase(db.name, e)}
                  sx={{
                    opacity: 0,
                    transition: "opacity 0.2s",
                    mr: 0.5,
                    "&:hover": {
                      color: "error.main",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {db.expanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

              {/* Collections List */}
              <Collapse in={db.expanded} timeout="auto" unmountOnExit>
                {/* Botão Criar Collection */}
                <Box sx={{ pl: 4, pr: 2, pt: 1, pb: 0.5 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateCollection(db.name);
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      fontSize: "0.8rem",
                      py: 0.5,
                    }}
                  >
                    {t.sidebar.newCollection}
                  </Button>
                </Box>

                <List component="div" disablePadding>
                  {db.collections?.map((collection) => (
                    <ListItemButton
                      key={collection}
                      sx={{ 
                        pl: 4,
                        "&:hover .delete-collection-btn": {
                          opacity: 1,
                        },
                      }}
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
                      <Tooltip title={t.sidebar.deleteCollection}>
                        <IconButton
                          className="delete-collection-btn"
                          size="small"
                          onClick={(e) => handleDeleteCollection(db.name, collection, e)}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            "&:hover": {
                              color: "error.main",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemButton>
                  )) || (
                    <ListItemButton sx={{ pl: 4 }} disabled>
                      <ListItemText 
                        primary={t.sidebar.noCollections}
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
                {t.sidebar.noDatabases}
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Modals */}
      <CreateDatabaseModal
        open={createDbModalOpen}
        onClose={() => setCreateDbModalOpen(false)}
        onSuccess={handleDatabaseCreated}
      />

      <CreateCollectionModal
        open={createCollectionModalOpen}
        dbName={selectedDbForCollection}
        onClose={() => setCreateCollectionModalOpen(false)}
        onSuccess={handleCollectionCreated}
      />

      <DeleteDatabaseModal
        open={deleteDbModalOpen}
        dbName={selectedDbForDelete}
        onClose={() => setDeleteDbModalOpen(false)}
        onSuccess={handleDatabaseDeleted}
      />

      <DeleteCollectionModal
        open={deleteCollectionModalOpen}
        dbName={selectedCollectionForDelete.db}
        collectionName={selectedCollectionForDelete.collection}
        onClose={() => setDeleteCollectionModalOpen(false)}
        onSuccess={handleCollectionDeleted}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Drawer>
  );
}
