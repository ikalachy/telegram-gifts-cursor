export default function Home() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1>Plush Gifts Telegram Mini App</h1>
      <p>This app should be accessed through Telegram</p>
      <a 
        href="/webapp/home"
        style={{
          padding: '10px 20px',
          backgroundColor: '#0088cc',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}
      >
        Go to Mini App
      </a>
    </div>
  );
}

