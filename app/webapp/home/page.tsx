'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Gift {
  id: string;
  animals: string[];
  accessories: string[];
  rarity: string;
  animation_url: string;
  thumbnail_url: string;
  source_type: string;
}

export default function HomePage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState<string>('');

  useEffect(() => {
    // Get initData from Telegram WebApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const data = tg.initData;
      setInitData(data);
      
      // Fetch gifts
      fetchGifts(data);
    }
  }, []);

  const fetchGifts = async (data: string) => {
    try {
      const response = await fetch(`/api/gifts?initData=${encodeURIComponent(data)}`);
      const result = await response.json();
      
      if (result.success) {
        setGifts(result.gifts);
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyBox = () => {
    router.push('/webapp/daily');
  };

  const handleFusion = () => {
    router.push('/webapp/fusion');
  };

  const handleStyle = () => {
    router.push('/webapp/style');
  };

  const handleViewGift = (giftId: string) => {
    router.push(`/webapp/gift/${giftId}`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f0f0'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#333'
      }}>
        🎁 My Plush Gifts
      </h1>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleDailyBox}
          style={{
            padding: '15px 25px',
            fontSize: '16px',
            backgroundColor: '#0088cc',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📦 Daily Box
        </button>
        <button
          onClick={handleFusion}
          style={{
            padding: '15px 25px',
            fontSize: '16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔥 Fusion
        </button>
        <button
          onClick={handleStyle}
          style={{
            padding: '15px 25px',
            fontSize: '16px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🎨 Style
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '15px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {gifts.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            No gifts yet. Open your Daily Box to get started! 🎁
          </div>
        ) : (
          gifts.map((gift) => (
            <div
              key={gift.id}
              onClick={() => handleViewGift(gift.id)}
              style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '15px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={gift.thumbnail_url}
                alt={gift.animals.join(', ')}
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Gift';
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                {gift.animals.join(', ')}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: gift.rarity === 'legendary' ? '#ffd700' : 
                       gift.rarity === 'rare' ? '#ff6b6b' : '#999',
                fontWeight: 'bold'
              }}>
                {gift.rarity.toUpperCase()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

