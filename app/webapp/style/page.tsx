'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STYLES = [
  { id: 'kawaii', name: 'Kawaii', emoji: '🌸' },
  { id: 'realistic', name: 'Realistic', emoji: '🎯' },
  { id: 'anime', name: 'Anime', emoji: '✨' },
  { id: 'chibi', name: 'Chibi', emoji: '😊' },
  { id: 'vintage', name: 'Vintage', emoji: '📻' },
];

export default function StylePage() {
  const router = useRouter();
  const [initData, setInitData] = useState<string>('');
  const [currentStyle, setCurrentStyle] = useState<string>('kawaii');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      setInitData(tg.initData);
      fetchStyle(tg.initData);
    }
  }, []);

  const fetchStyle = async (data: string) => {
    try {
      const response = await fetch(`/api/user/style?initData=${encodeURIComponent(data)}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentStyle(result.style);
      }
    } catch (error) {
      console.error('Error fetching style:', error);
    }
  };

  const handleStyleChange = async (styleId: string) => {
    if (!initData || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/user/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, style: styleId }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentStyle(result.style);
      }
    } catch (error) {
      console.error('Error updating style:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        🎨 Style Settings
      </h1>

      <p style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        color: '#666',
        maxWidth: '600px',
        margin: '0 auto 30px'
      }}>
        Choose your preferred plush style. This will affect how your future gifts are generated.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '15px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {STYLES.map((style) => {
          const isActive = currentStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              disabled={loading}
              style={{
                padding: '20px',
                fontSize: '18px',
                backgroundColor: isActive ? '#0088cc' : 'white',
                color: isActive ? 'white' : '#333',
                border: isActive ? '3px solid #0088cc' : '2px solid #ddd',
                borderRadius: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(0,136,204,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {style.emoji}
              </div>
              <div>{style.name}</div>
              {isActive && (
                <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.9 }}>
                  ✓ Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => router.push('/webapp/home')}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

