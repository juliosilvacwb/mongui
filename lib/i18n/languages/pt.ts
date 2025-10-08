import { Translation } from "./en";

export const pt: Translation = {
  // App General
  app: {
    name: "Mongui",
    welcome: "Bem-vindo ao Mongui",
    selectCollection: "Selecione um database e collection no menu lateral para começar.",
  },

  // AppBar
  appBar: {
    connected: "conectado",
    disconnected: "desconectado",
    connecting: "conectando",
    home: "Início",
    shell: "MongoDB Shell",
    alreadyInShell: "Já está no Shell",
    toggleTheme: "Alternar Tema",
    lightTheme: "Tema Claro",
    darkTheme: "Tema Escuro",
    language: "Idioma",
  },

  // Sidebar
  sidebar: {
    newDatabase: "Novo Database",
    newCollection: "Nova Collection",
    deleteDatabase: "Deletar database",
    deleteCollection: "Deletar collection",
    noCollections: "Sem collections",
    noDatabases: "Nenhum database encontrado",
    loading: "Carregando databases...",
  },

  // Document Grid
  documentGrid: {
    showing: "Exibindo",
    of: "de",
    documents: "documento(s)",
    new: "Novo",
    refresh: "Atualizar",
    clearFilter: "Limpar Filtro",
    table: "Tabela",
    json: "JSON",
    clickToCopy: "Click = Copiar",
    clickToCopyTooltip: "Click nas células ou headers para copiar valores para área de transferência",
    jsonPrettyFormat: "JSON Pretty Format",
    copyJson: "Copiar JSON",
    copied: "Copiado!",
    page: "Página",
    pageSize: "Tamanho da Página",
    firstPage: "Primeira Página",
    previousPage: "Anterior",
    nextPage: "Próxima",
    lastPage: "Última Página",
    tip: "Dica",
    clickToCopyCells: "Click nas células ou headers para copiar valores",
    useAdvancedQuery: "Use o painel de Consulta Avançada para filtrar e ordenar toda a collection.",
    confirmDelete: "Deseja realmente excluir este documento?",
    documentsCreated: "documentos criados",
  },

  // Document Modal
  documentModal: {
    newDocument: "Novo Documento",
    editDocument: "Editar Documento",
    insertSingleOrArray: "Insira um objeto único ou um array de objetos",
    cancel: "Cancelar",
    save: "Salvar",
    invalidJson: "JSON inválido",
    emptyArray: "Array não pode estar vazio",
    arrayMustContainObjects: "Array deve conter apenas objetos",
  },

  // Query Panel
  queryPanel: {
    advancedQuery: "Consulta Avançada",
    filterEntireCollection: "Filtra TODA a collection no MongoDB",
    filter: "Filtro (JSON)",
    sort: "Ordenação (JSON)",
    executeQuery: "Executar Query",
    limit: "Limite",
    documentsPerPage: "documento(s) por página (ajuste na paginação abaixo)",
    typesWarning: "Tipos de Dados:",
    typesExample: '❌ { "id": 123 } → número | ✅ { "id": "123" } → string',
    viewGuide: "Ver guia de operadores e exemplos",
  },

  // Query Help Modal
  queryHelp: {
    title: "Guia de Consultas MongoDB",
    dataTypesWarning: "ATENÇÃO: Tipos de Dados",
    dataTypesInfo: "MongoDB diferencia tipos! Use aspas para strings:",
    comparisonOperators: "Operadores de Comparação",
    arrayOperators: "Operadores de Array",
    logicalOperators: "Operadores Lógicos",
    textOperators: "Operadores de Texto",
    otherOperators: "Outros Operadores",
    examples: "Exemplos Práticos",
    sorting: "Ordenação",
    close: "Fechar",
    
    // Examples
    exampleAge: "Idade maior que 25",
    exampleStatus: "Usuários ativos",
    exampleEmail: "Usuários Gmail",
    exampleCategories: "Múltiplas categorias",
    exampleComplex: "Query complexa (idade E ativo)",
    exampleSortDesc: "Ordenar por idade (decrescente)",
    exampleSortMulti: "Ordenar por múltiplos campos",
  },

  // Shell Console
  shell: {
    title: "MongoDB Shell",
    subtitle: "Enter ou Ctrl+Enter para executar | ↑↓ para navegar no histórico",
    clearHistory: "Limpar histórico",
    executing: "Executando...",
    copyCommand: "Copiar comando",
    copyOutput: "Copiar resultado",
    placeholder: "Digite comando MongoDB (Enter para executar)",
    execute: "Executar (Enter)",
    
    // Help text
    helpTitle: "MongoDB Shell Interativo",
    helpAvailableCommands: "Comandos disponíveis:",
    helpExample: "Exemplo:",
  },

  // Create Database Modal
  createDatabase: {
    title: "Criar Novo Database",
    databaseName: "Nome do Database",
    collectionName: "Nome da Collection Inicial",
    firstCollection: "Primeira collection do database",
    placeholder: "exemplo: ecommerce",
    collectionPlaceholder: "exemplo: produtos",
    useOnlyLetters: "Use apenas letras, números, _ ou -",
    restrictionsTitle: "Restrições do MongoDB:",
    databaseRestrictions: "Database:",
    maxCharacters: "Máximo",
    characters: "caracteres",
    cannotBe: "Não pode ser:",
    collectionRestrictions: "Collection:",
    cannotStartWith: "Não pode começar com:",
    cannotContain: "Não pode conter:",
    both: "Ambos:",
    useOnly: "Use apenas:",
    note: "Nota:",
    noteText: "O MongoDB cria o database automaticamente ao criar a primeira collection.",
    cancel: "Cancelar",
    create: "Criar Database",
    creating: "Criando...",
  },

  // Create Collection Modal
  createCollection: {
    title: "Criar Nova Collection",
    database: "Database:",
    collectionName: "Nome da Collection",
    placeholder: "exemplo: usuarios",
    restrictionsTitle: "Restrições do MongoDB:",
    cancel: "Cancelar",
    create: "Criar Collection",
    creating: "Criando...",
  },

  // Delete Database Modal
  deleteDatabase: {
    title: "Deletar Database",
    warningTitle: "ATENÇÃO: Esta ação é IRREVERSÍVEL!",
    warningText: "Você está prestes a deletar o database",
    warningTextAnd: "e TODAS as suas collections e documentos.",
    cannotBeUndone: "Esta operação NÃO pode ser desfeita!",
    databaseToDelete: "Database que será deletado:",
    typeToConfirm: "Digite o nome do database para confirmar:",
    nameDoesNotMatch: "Nome não coincide",
    type: "Digite:",
    cancel: "Cancelar",
    delete: "Deletar Database",
    deleting: "Deletando...",
  },

  // Delete Collection Modal
  deleteCollection: {
    title: "Deletar Collection",
    warningTitle: "ATENÇÃO: Esta ação é IRREVERSÍVEL!",
    warningText: "Você está prestes a deletar a collection",
    warningTextAnd: "e TODOS os seus documentos do database",
    cannotBeUndone: "Esta operação NÃO pode ser desfeita!",
    collectionToDelete: "Collection que será deletada:",
    database: "Database:",
    typeToConfirm: "Digite o nome da collection para confirmar:",
    nameDoesNotMatch: "Nome não coincide",
    type: "Digite:",
    cancel: "Cancelar",
    delete: "Deletar Collection",
    deleting: "Deletando...",
  },

  // Messages
  messages: {
    documentCreated: "Documento criado",
    documentUpdated: "Documento atualizado",
    documentDeleted: "Documento excluído",
    selectDocument: "Selecione um documento",
    databaseCreated: "Database criado com sucesso!",
    collectionCreated: "Collection criada com sucesso!",
    databaseDeleted: "Database deletado com sucesso!",
    collectionDeleted: "Collection deletada com sucesso!",
    noDocumentsFound: "Nenhum documento encontrado com os filtros aplicados",
    queryExecuted: "Query executada com sucesso:",
    errorExecutingQuery: "Erro ao executar query:",
    error: "Erro:",
    copySuccess: "Copiado!",
    fieldName: "Nome do campo",
  },

  // Alerts
  alerts: {
    filterAlertTitle: "Dica:",
    filterAlertText: "Click nas células ou headers para copiar valores. Use a Consulta Avançada para filtrar e ordenar toda a collection.",
    close: "Fechar",
  },

  // Errors
  errors: {
    somethingWentWrong: "Algo deu errado",
    unknownError: "Erro desconhecido",
    reloadPage: "Recarregar Página",
    goHome: "Voltar ao Início",
    resetError: "Resetar Erro (Dev)",
    tips: "Dicas:",
    tip1: "Tente recarregar a página",
    tip2: "Limpe o cache do navegador",
    tip3: "Verifique sua conexão com a internet",
    tip4: "Se o problema persistir, entre em contato com o suporte",
    errorId: "ID do Erro:",
    developmentDetails: "Detalhes do Erro (Desenvolvimento):",
  },

  // Common
  common: {
    loading: "Carregando...",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Deletar",
    edit: "Editar",
    create: "Criar",
    close: "Fechar",
    confirm: "Confirmar",
    back: "Voltar",
    next: "Próximo",
    yes: "Sim",
    no: "Não",
  },
};

