export const en = {
  // App General
  app: {
    name: "Mongui",
    welcome: "Welcome to Mongui",
    selectCollection: "Select a database and collection from the sidebar to get started.",
  },

  // AppBar
  appBar: {
    connected: "connected",
    disconnected: "disconnected",
    connecting: "connecting",
    home: "Home",
    shell: "MongoDB Shell",
    alreadyInShell: "Already in Shell",
    toggleTheme: "Toggle Theme",
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",
    language: "Language",
  },

  // Sidebar
  sidebar: {
    newDatabase: "New Database",
    newCollection: "New Collection",
    deleteDatabase: "Delete database",
    deleteCollection: "Delete collection",
    openShell: "Open Shell for this database",
    noCollections: "No collections",
    noDatabases: "No databases found",
    loading: "Loading databases...",
  },

  // Document Grid
  documentGrid: {
    showing: "Showing",
    of: "of",
    documents: "document(s)",
    new: "New",
    refresh: "Refresh",
    clearFilter: "Clear Filter",
    table: "Table",
    json: "JSON",
    clickToCopy: "Click = Copy",
    clickToCopyTooltip: "Click on cells or headers to copy values to clipboard",
    jsonPrettyFormat: "JSON Pretty Format",
    copyJson: "Copy JSON",
    copied: "Copied!",
    page: "Page",
    pageSize: "Page Size",
    firstPage: "First Page",
    previousPage: "Previous",
    nextPage: "Next",
    lastPage: "Last Page",
    tip: "Tip",
    clickToCopyCells: "Click on cells or headers to copy values",
    useAdvancedQuery: "Use the Advanced Query panel to filter and sort the entire collection.",
    confirmDelete: "Do you really want to delete this document?",
    documentsCreated: "documents created",
  },

  // Document Modal
  documentModal: {
    newDocument: "New Document",
    editDocument: "Edit Document",
    insertSingleOrArray: "Insert a single object or an array of objects",
    cancel: "Cancel",
    save: "Save",
    invalidJson: "Invalid JSON",
    emptyArray: "Array cannot be empty",
    arrayMustContainObjects: "Array must contain only objects",
  },

  // Query Panel
  queryPanel: {
    advancedQuery: "Advanced Query",
    filterEntireCollection: "Filters the ENTIRE collection in MongoDB",
    filter: "Filter (JSON)",
    sort: "Sort (JSON)",
    executeQuery: "Execute Query",
    limit: "Limit",
    documentsPerPage: "document(s) per page (adjust pagination below)",
    typesWarning: "Data Types:",
    typesExample: '❌ { "id": 123 } → number | ✅ { "id": "123" } → string',
    viewGuide: "View operators guide and examples",
    invalidFilterJson: "Invalid Filter JSON",
    invalidSortJson: "Invalid Sort JSON",
  },

  // Query Help Modal
  queryHelp: {
    title: "MongoDB Query Guide",
    dataTypesWarning: "DATA TYPES WARNING",
    dataTypesInfo: "MongoDB differentiates types! Use quotes for strings:",
    comparisonOperators: "Comparison Operators",
    arrayOperators: "Array Operators",
    logicalOperators: "Logical Operators",
    textOperators: "Text Operators",
    otherOperators: "Other Operators",
    examples: "Practical Examples",
    sorting: "Sorting",
    close: "Close",
    
    // Examples
    exampleAge: "Age greater than 25",
    exampleStatus: "Active users",
    exampleEmail: "Gmail users",
    exampleCategories: "Multiple categories",
    exampleComplex: "Complex query (age AND active)",
    exampleSortDesc: "Sort by age (descending)",
    exampleSortMulti: "Sort by multiple fields",
  },

  // Shell Console
  shell: {
    title: "MongoDB Shell",
    subtitle: "Enter or Ctrl+Enter to execute | ↑↓ to navigate history",
    clearHistory: "Clear history",
    executing: "Executing...",
    copyCommand: "Copy command",
    copyOutput: "Copy output",
    placeholder: "Type MongoDB command (Enter to execute)",
    execute: "Execute (Enter)",
    
    // Help text
    helpTitle: "Interactive MongoDB Shell",
    helpAvailableCommands: "Available commands:",
    helpExample: "Example:",
  },

  // Create Database Modal
  createDatabase: {
    title: "Create New Database",
    databaseName: "Database Name",
    collectionName: "Initial Collection Name",
    firstCollection: "First collection of the database",
    placeholder: "e.g., ecommerce",
    collectionPlaceholder: "e.g., products",
    useOnlyLetters: "Use only letters, numbers, _ or -",
    restrictionsTitle: "MongoDB Restrictions:",
    databaseRestrictions: "Database:",
    maxCharacters: "Maximum",
    characters: "characters",
    cannotBe: "Cannot be:",
    collectionRestrictions: "Collection:",
    cannotStartWith: "Cannot start with:",
    cannotContain: "Cannot contain:",
    both: "Both:",
    useOnly: "Use only:",
    note: "Note:",
    noteText: "MongoDB creates the database automatically when creating the first collection.",
    cancel: "Cancel",
    create: "Create Database",
    creating: "Creating...",
  },

  // Create Collection Modal
  createCollection: {
    title: "Create New Collection",
    database: "Database:",
    collectionName: "Collection Name",
    placeholder: "e.g., users",
    restrictionsTitle: "MongoDB Restrictions:",
    cancel: "Cancel",
    create: "Create Collection",
    creating: "Creating...",
  },

  // Delete Database Modal
  deleteDatabase: {
    title: "Delete Database",
    warningTitle: "WARNING: This action is IRREVERSIBLE!",
    warningText: "You are about to delete the database",
    warningTextAnd: "and ALL its collections and documents.",
    cannotBeUndone: "This operation CANNOT be undone!",
    databaseToDelete: "Database to be deleted:",
    typeToConfirm: "Type the database name to confirm:",
    nameDoesNotMatch: "Name does not match",
    type: "Type:",
    cancel: "Cancel",
    delete: "Delete Database",
    deleting: "Deleting...",
  },

  // Delete Collection Modal
  deleteCollection: {
    title: "Delete Collection",
    warningTitle: "WARNING: This action is IRREVERSIBLE!",
    warningText: "You are about to delete the collection",
    warningTextAnd: "and ALL its documents from database",
    cannotBeUndone: "This operation CANNOT be undone!",
    collectionToDelete: "Collection to be deleted:",
    database: "Database:",
    typeToConfirm: "Type the collection name to confirm:",
    nameDoesNotMatch: "Name does not match",
    type: "Type:",
    cancel: "Cancel",
    delete: "Delete Collection",
    deleting: "Deleting...",
  },

  // Messages
  messages: {
    documentCreated: "Document created",
    documentUpdated: "Document updated",
    documentDeleted: "Document deleted",
    selectDocument: "Select a document",
    databaseCreated: "Database created successfully!",
    collectionCreated: "Collection created successfully!",
    databaseDeleted: "Database deleted successfully!",
    collectionDeleted: "Collection deleted successfully!",
    noDocumentsFound: "No documents found with applied filters",
    queryExecuted: "Query executed successfully:",
    errorExecutingQuery: "Error executing query:",
    error: "Error:",
    copySuccess: "Copied!",
    fieldName: "Field name",
  },

  // Alerts
  alerts: {
    filterAlertTitle: "Tip:",
    filterAlertText: "Click on cells or headers to copy values. Use Advanced Query to filter and sort the entire collection.",
    close: "Close",
  },

  // Errors
  errors: {
    somethingWentWrong: "Something went wrong",
    unknownError: "Unknown error",
    reloadPage: "Reload Page",
    goHome: "Go Home",
    resetError: "Reset Error (Dev)",
    tips: "Tips:",
    tip1: "Try reloading the page",
    tip2: "Clear browser cache",
    tip3: "Check your internet connection",
    tip4: "If the problem persists, contact support",
    errorId: "Error ID:",
    developmentDetails: "Error Details (Development):",
  },

  // Common
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    close: "Close",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    yes: "Yes",
    no: "No",
  },
};

export type Translation = typeof en;

