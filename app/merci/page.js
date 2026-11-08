'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const PIXEL_ID = typeof window !== 'undefined' && window.ENV_PIXEL_ID ? window.ENV_PIXEL_ID : '539352082427553';

function MerciContent() {
  const params = useSearchParams();
  const [showMsg, setShowMsg] = useState(false);

  const orderNumber = params.get('order') || '';
  const productName = params.get('name') || '';
  const productId = params.get('pid') || '';
  const qty = Number(params.get('qty')) || 1;
  const total = Number(params.get('total')) || 0;
  const capiEventId = params.get('capiEventId') || '';

  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playChaChing = async () => {
      await audioCtx.resume();
      const now = audioCtx.currentTime;
      const notes = [
        [523.25, 659.25, 783.99],
        [587.33, 739.99, 880.00],
        [659.25, 830.61, 987.77],
      ];
      notes.forEach((chord, i) => {
        chord.forEach((freq) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.25, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.8);
        });
      });
      [1600, 1800, 2000].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, now + 0.6 + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + 0.6 + i * 0.1);
        osc.stop(now + 0.6 + i * 0.1 + 0.4);
      });
    };
    playChaChing().catch(() => {});

    const t = setTimeout(() => setShowMsg(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showMsg) return;
    const redirectTimer = setTimeout(() => {
      window.location.href = '/products/etar-sanaouati';
    }, 4000);
    return () => clearTimeout(redirectTimer);
  }, [showMsg]);

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0A2148 0%, #184391 55%, #1760AD 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(calc(100vh + 100px)) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .gold-confetti { position: absolute; animation: confettiFall 3.5s ease-in forwards; }
      `}</style>

      {[...Array(40)].map((_, i) => (
        <div key={i} className="gold-confetti" style={{
          background: ['#55ADFD','#B9E8FC','#A6CD4D','#B56B44','#fff','#184391'][i % 6],
          left: `${Math.random() * 100}%`,
          top: `${-10 - Math.random() * 30}px`,
          animationDelay: `${Math.random() * 2.5}s`,
          animationDuration: `${2.5 + Math.random() * 2}s`,
          width: `${4 + Math.random() * 10}px`,
          height: `${4 + Math.random() * 10}px`,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          opacity: 0.7 + Math.random() * 0.3,
        }} />
      ))}

      {showMsg && (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease-out' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: '#A6CD4D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 0 60px rgba(166,205,77,0.5)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 50 }}>🎉</span>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, color: '#B9E8FC', marginBottom: 8, textShadow: '0 2px 16px rgba(85,173,253,0.35)' }}>
            شكراً لطلبك!
          </h1>
          <p style={{ color: 'rgba(185,232,252,0.9)', fontSize: 17, fontWeight: 600, lineHeight: 1.8, maxWidth: 360, margin: '0 auto 8px' }}>
            سنقوم بالاتصال بك قريباً لتأكيد الطلبية
          </p>
          {productName && (
            <p style={{ color: '#A6CD4D', fontSize: 14, fontWeight: 500 }}>
              {productName} x{qty} — {total.toLocaleString()} د.ج
            </p>
          )}

          <div style={{
            display: 'inline-block', marginTop: 16, padding: '10px 28px',
            background: 'rgba(166,205,77,0.15)', border: '2px solid #A6CD4D',
            borderRadius: 16, backdropFilter: 'blur(4px)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#B9E8FC', marginBottom: 2 }}>رقم الطلب</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#A6CD4D', letterSpacing: 1 }}>{orderNumber}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
            <a href="/"
               style={{
                 display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                 background: 'rgba(85,173,253,0.22)', color: '#fff',
                 padding: '14px 36px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                 textDecoration: 'none', backdropFilter: 'blur(4px)',
               }}>
              العودة إلى المتجر
            </a>
            <p style={{ color: '#A6CD4D', fontSize: 13, fontWeight: 500, marginTop: 8 }}>
              سيتم تحويلك إلى صفحة إطار سنواتي المدرسية...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MerciPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #0A2148 0%, #184391 55%, #1760AD 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: '#B9E8FC', fontSize: 20, fontWeight: 700 }}>جاري التحميل...</p>
      </div>
    }>
      <MerciContent />
    </Suspense>
  );
}
