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
}

export default function FusionPage() {
  const router = useRouter();
  const [initData, setInitData] = useState<string>('');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      setInitData(tg.initData);
      fetchGifts(tg.initData);
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
    }
  };

  const toggleGift = (giftId: string) => {
    setSelectedGifts((prev) => {
      if (prev.includes(giftId)) {
        return prev.filter((id) => id !== giftId);
      } else {
        if (prev.length >= 3) {
          setError('Maximum 3 gifts can be fused');
          return prev;
        }
        return [...prev, giftId];
      }
    });
    setError('');
  };

  const handleFusion = async () => {
    if (selectedGifts.length < 2 || selectedGifts.length > 3) {
      setError('Please select 2-3 gifts to fuse');
      return;
    }

    if (!initData) return;

    setLoading(true);
    setError('');

    try {
      // Start fusion
      const startResponse = await fetch('/api/fusion/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, gift_ids: selectedGifts }),
      });

      const startResult = await startResponse.json();

      if (!startResult.success) {
        setError(startResult.error || 'Failed to start fusion');
        setLoading(false);
        return;
      }

      // Complete fusion
      const completeResponse = await fetch('/api/fusion/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          initData, 
          fusion_job_id: startResult.fusion_job_id 
        }),
      });

      const completeResult = await completeResponse.json();

      if (completeResult.success) {
        router.push(`/webapp/gift/${completeResult.gift.id}`);
      } else {
        setError(completeResult.error || 'Failed to complete fusion');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
        🔥 Fusion
      </h1>

      <p style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        color: '#666',
        maxWidth: '600px',
        margin: '0 auto 30px'
      }}>
        Select 2-3 gifts to fuse into a {selectedGifts.length === 3 ? 'legendary' : 'rare'} plush!
        The original gifts will be consumed.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          maxWidth: '800px',
          margin: '0 auto 20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {selectedGifts.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '10px',
          maxWidth: '800px',
          margin: '0 auto 20px'
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
            Selected: {selectedGifts.length} / 3
          </div>
          <button
            onClick={handleFusion}
            disabled={loading || selectedGifts.length < 2}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: loading || selectedGifts.length < 2 ? '#ccc' : '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading || selectedGifts.length < 2 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Fusing...' : '🔥 Fuse Gifts!'}
          </button>
        </div>
      )}

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
            No gifts available for fusion. Get some gifts from your Daily Box first!
          </div>
        ) : (
          gifts.map((gift) => {
            const isSelected = selectedGifts.includes(gift.id);
            return (
              <div
                key={gift.id}
                onClick={() => toggleGift(gift.id)}
                style={{
                  backgroundColor: isSelected ? '#fff3cd' : 'white',
                  borderRadius: '15px',
                  padding: '15px',
                  cursor: 'pointer',
                  boxShadow: isSelected 
                    ? '0 4px 12px rgba(255, 193, 7, 0.5)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  border: isSelected ? '3px solid #ffc107' : '3px solid transparent',
                  transition: 'all 0.2s',
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
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {gift.rarity.toUpperCase()}
                </div>
                {isSelected && (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '20px',
                    marginTop: '5px'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
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

