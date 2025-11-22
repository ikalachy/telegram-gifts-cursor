'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DailyOption {
  id: number;
  animals: string[];
  accessories: string[];
  animation_url: string;
  thumbnail_url: string;
}

export default function DailyPage() {
  const router = useRouter();
  const [initData, setInitData] = useState<string>('');
  const [pendingId, setPendingId] = useState<string>('');
  const [options, setOptions] = useState<DailyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'start' | 'generating' | 'choosing'>('start');

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      setInitData(tg.initData);
    }
  }, []);

  const handleStart = async () => {
    if (!initData) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/daily/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      const result = await response.json();

      if (result.success) {
        setPendingId(result.pending_id);
        setStep('generating');
        await handleGenerate(result.pending_id);
      } else {
        setError(result.error || 'Failed to start daily box');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (pendingIdParam?: string) => {
    const id = pendingIdParam || pendingId;
    if (!id || !initData) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/daily/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, pending_id: id }),
      });

      const result = await response.json();

      if (result.success) {
        setOptions(result.options);
        setStep('choosing');
      } else {
        setError(result.error || 'Failed to generate gifts');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = async (optionIndex: number) => {
    if (!pendingId || !initData) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/daily/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, pending_id: pendingId, option_index: optionIndex }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/webapp/gift/${result.gift.id}`);
      } else {
        setError(result.error || 'Failed to choose gift');
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
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        📦 Daily Box
      </h1>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          maxWidth: '500px',
          width: '100%'
        }}>
          {error}
        </div>
      )}

      {step === 'start' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            Open your daily box to get 2 random plush gifts! Choose one to keep.
          </p>
          <button
            onClick={handleStart}
            disabled={loading}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: loading ? '#ccc' : '#0088cc',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Opening...' : 'Open Daily Box 🎁'}
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Generating your gifts...
          </p>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            This may take a minute
          </p>
        </div>
      )}

      {step === 'choosing' && options.length > 0 && (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            Choose Your Gift!
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {options.map((option, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '15px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <video
                  src={option.animation_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    backgroundColor: '#f5f5f5'
                  }}
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.style.display = 'none';
                    const img = document.createElement('img');
                    img.src = option.thumbnail_url;
                    img.style.width = '100%';
                    img.style.height = '200px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '10px';
                    video.parentElement?.appendChild(img);
                  }}
                />
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    {option.animals.join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {option.accessories.join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => handleChoose(option.id)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: loading ? '#ccc' : '#0088cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Choosing...' : 'Choose This Gift ✨'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => router.push('/webapp/home')}
        style={{
          marginTop: '20px',
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
  );
}

