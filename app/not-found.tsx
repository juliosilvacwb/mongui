export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Página não encontrada</h2>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        A página que você está procurando não existe.
      </p>
      <a 
        href="/" 
        style={{ 
          marginTop: '2rem', 
          padding: '0.5rem 1rem', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px' 
        }}
      >
        Voltar para a página inicial
      </a>
    </div>
  );
}
