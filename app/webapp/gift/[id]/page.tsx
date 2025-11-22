'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Gift {
  id: string;
  animals: string[];
  accessories: string[];
  rarity: string;
  animation_url: string;
  thumbnail_url: string;
  source_type: string;
}

export default function GiftViewerPage() {
  const router = useRouter();
  const params = useParams();
  const giftId = params.id as string;
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      setInitData(tg.initData);
      fetchGift(tg.initData);
    }
  }, [giftId]);

  const fetchGift = async (data: string) => {
    try {
      const response = await fetch(`/api/gifts?initData=${encodeURIComponent(data)}`);
      const result = await response.json();
      
      if (result.success) {
        const foundGift = result.gifts.find((g: Gift) => g.id === giftId);
        if (foundGift) {
          setGift(foundGift);
        }
      }
    } catch (error) {
      console.error('Error fetching gift:', error);
    } finally {
      setLoading(false);
    }
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

  if (!gift) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f0f0',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Gift not found</h2>
        <button
          onClick={() => router.push('/webapp/home')}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#0088cc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <video
          src={gift.animation_url}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'contain',
            borderRadius: '15px',
            marginBottom: '20px',
            backgroundColor: '#f5f5f5'
          }}
          onError={(e) => {
            const video = e.target as HTMLVideoElement;
            video.style.display = 'none';
            const img = document.createElement('img');
            img.src = gift.thumbnail_url;
            img.style.width = '100%';
            img.style.height = '400px';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '15px';
            video.parentElement?.appendChild(img);
          }}
        />

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            marginBottom: '10px', 
            color: '#333',
            fontSize: '24px'
          }}>
            {gift.animals.join(' + ')}
          </h2>
          <div style={{ 
            fontSize: '16px', 
            color: gift.rarity === 'legendary' ? '#ffd700' : 
                   gift.rarity === 'rare' ? '#ff6b6b' : '#999',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            {gift.rarity.toUpperCase()}
          </div>
          {gift.accessories.length > 0 && (
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              Accessories: {gift.accessories.join(', ')}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#999' }}>
            Source: {gift.source_type}
          </div>
        </div>

        <button
          onClick={() => router.push('/webapp/home')}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            backgroundColor: '#0088cc',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back to Collection
        </button>
      </div>
    </div>
  );
}

