'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#d4a5e8', '#a8d8ea', '#f7c8b4', '#b5e5cf', '#f7e7a0', '#f5a0b0'];

const Star = ({ x, y, size, delay }) => (
  <div style={{
    position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: size,
    animation: `floatStar ${4 + Math.random() * 3}s ease-in-out ${delay}s infinite`,
    opacity: 0.6, pointerEvents: 'none', zIndex: 0,
  }}>
    {['✦', '✧', '⋆', '✶', '✷'][Math.floor(Math.random() * 5)]}
  </div>
);

const Cloud = ({ x, y, delay }) => (
  <div style={{
    position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: 40,
    animation: `driftCloud ${6 + Math.random() * 4}s ease-in-out ${delay}s infinite`,
    opacity: 0.3, pointerEvents: 'none', zIndex: 0,
  }}>
    ☁️
  </div>
);

const FloatingBalloon = ({ x, y, delay, color }) => (
  <div style={{
    position: 'absolute', left: `${x}%`, top: `${y}%`,
    animation: `floatBalloon ${5 + Math.random() * 3}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none', zIndex: 0,
  }}>
    <svg width="32" height="40" viewBox="0 0 32 40">
      <ellipse cx="16" cy="18" rx="14" ry="16" fill={color} opacity="0.7" />
      <polygon points="14,33 18,33 16,38" fill={color} opacity="0.7" />
      <line x1="16" y1="38" x2="16" y2="44" stroke="#999" strokeWidth="0.5" />
    </svg>
  </div>
);

const DecorativeCircle = ({ color, top, left, size }) => (
  <div style={{
    position: 'absolute', top: `${top}%`, left: `${left}%`,
    width: size, height: size, borderRadius: '50%',
    background: color, opacity: 0.15, pointerEvents: 'none', zIndex: 0,
  }} />
);

function AnimatedDecoration() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: `${12 + Math.random() * 20}px`,
    delay: Math.random() * 3,
  }));
  const clouds = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    delay: Math.random() * 4,
  }));
  const balloons = Array.from({ length: 4 }, (_, i) => ({
    x: 10 + i * 25, y: 20 + Math.random() * 30,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 3,
  }));
  const circles = [
    { color: '#d4a5e8', top: 10, left: 5, size: '120px' },
    { color: '#f7c8b4', top: 60, left: 85, size: '150px' },
    { color: '#a8d8ea', top: 80, left: 10, size: '100px' },
    { color: '#b5e5cf', top: 30, left: 80, size: '80px' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s, i) => <Star key={i} {...s} />)}
      {clouds.map((c, i) => <Cloud key={i} {...c} />)}
      {balloons.map((b, i) => <FloatingBalloon key={i} {...b} />)}
      {circles.map((c, i) => <DecorativeCircle key={i} {...c} />)}
    </div>
  );
}

const ValueCard = ({ emoji, title, desc, color, index }) => (
  <div className="value-card" style={{
    background: '#fff', borderRadius: 24, padding: '28px 24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: `2px solid ${color}`,
    animation: `fadeSlideUp 0.6s ease-out ${index * 0.15}s both`,
    position: 'relative', zIndex: 1,
  }}>
    <div style={{ fontSize: 42, marginBottom: 12 }}>{emoji}</div>
    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1d1d1f', marginBottom: 8 }}>{title}</h3>
    <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.7, margin: 0 }}>{desc}</p>
  </div>
);

const TeamMember = ({ name, role, color, index }) => (
  <div className="team-card" style={{
    textAlign: 'center',
    animation: `fadeSlideUp 0.6s ease-out ${index * 0.12}s both`,
    position: 'relative', zIndex: 1,
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, boxShadow: `0 4px 16px ${color}44`,
    }}>
      {name === 'التعليم' ? '📚' : name === 'الجودة' ? '✨' : name === 'الثقة' ? '🤝' : '🎯'}
    </div>
    <div style={{ fontWeight: 900, fontSize: 16, color: '#1d1d1f' }}>{name}</div>
    <div style={{ fontSize: 13, color: '#8e8e93' }}>{role}</div>
  </div>
);

export default function APropos() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  if (!entered) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <AnimatedDecoration />
        <div style={{
          animation: 'fadeSlideUp 0.8s ease-out',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ fontSize: 80, marginBottom: 20, animation: 'gentleBounce 2s ease-in-out infinite' }}>
            🌟
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, color: '#1d1d1f', marginBottom: 12,
            background: 'linear-gradient(135deg, #8bc43f, #d4a5e8, #a8d8ea)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            مرحباً بك في عالم ibishop
          </h1>
          <p style={{ fontSize: 18, color: '#6e6e73', marginBottom: 32, lineHeight: 1.6 }}>
            عالم مليء بالمرح والتعلم والإبداع للأطفال
          </p>
          <button onClick={() => setEntered(true)}
                  style={{
                    padding: '16px 48px', fontSize: 20, fontWeight: 900,
                    background: 'linear-gradient(135deg, #8bc43f, #6a9f2e)',
                    color: '#fff', border: 'none', borderRadius: 50,
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(139,196,63,0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 12px 40px rgba(139,196,63,0.4)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 32px rgba(139,196,63,0.3)'; }}>
            اضغط لتدخل ✨
          </button>
          <p style={{ marginTop: 24, fontSize: 14, color: '#8e8e93', animation: 'pulse 2s ease-in-out infinite' }}>
            🎈 عالم من الخيال والمرح في انتظارك
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: 40 }}>
      <AnimatedDecoration />

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '40px 20px 20px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'inline-block', background: '#fff', borderRadius: 32,
          padding: '32px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          animation: 'fadeSlideUp 0.6s ease-out',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12, animation: 'gentleBounce 3s ease-in-out infinite' }}>🧸</div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, marginBottom: 8,
            background: 'linear-gradient(135deg, #8bc43f, #d4a5e8, #a8d8ea)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            من نحن
          </h1>
          <p style={{ fontSize: 16, color: '#6e6e73', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            ibishop هو عالم سحري يجمع بين التسلية والتعليم، نقدم أجمل الألعاب الخشبية والوسائل التعليمية
            لأطفال الجزائر
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {['🦋', '🌸', '🌟', '🎠', '🌈', '🪁'].map((e, i) => (
              <span key={i} style={{
                fontSize: 24, animation: `floatStar ${3 + i * 0.5}s ease-in-out ${i * 0.2}s infinite`,
              }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Story section */}
      <div style={{
        maxWidth: 600, margin: '24px auto 0', padding: '0 20px',
        position: 'relative', zIndex: 1,
      }}>
        <div className="section-card" style={{
          background: '#fff', borderRadius: 24, padding: 28,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '2px solid #b5e5cf',
          animation: 'fadeSlideUp 0.6s ease-out 0.2s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 40 }}>📖</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1d1d1f', margin: 0 }}>قصتنا</h2>
          </div>
          <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.8, margin: 0 }}>
            انطلق ibishop من حلم بسيط: توفير ألعاب تعليمية عالية الجودة للأطفال الجزائريين بأسعار معقولة.
            كل منتج نختاره بعناية ليجمع بين المرح والفائدة، لأننا نؤمن أن الطفل يتعلم بشكل أفضل عندما يلعب.
            <br /><br />
            نتعاون مع أفضل الماركات العالمية ونختار أجمل التصاميم التي تنمي الإبداع والذكاء.
            هدفنا أن نجعل كل طفل في الجزائر يبتسم ويتعلم ويبدع.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20 }}>
            <span style={{ fontSize: 36, animation: 'gentleBounce 2.5s ease-in-out infinite' }}>🎨</span>
            <span style={{ fontSize: 36, animation: 'gentleBounce 2.5s ease-in-out 0.3s infinite' }}>🧩</span>
            <span style={{ fontSize: 36, animation: 'gentleBounce 2.5s ease-in-out 0.6s infinite' }}>🎪</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ maxWidth: 800, margin: '24px auto 0', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 20, color: '#1d1d1f',
          animation: 'fadeSlideUp 0.6s ease-out 0.3s both',
        }}>
          🌈 قيمنا
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <ValueCard
            emoji="🧠" color="#d4a5e8" index={0}
            title="التعليم باللعب"
            desc="نختار ألعاباً تنمي الذكاء والإبداع وتجعل التعلم مغامرة ممتعة"
          />
          <ValueCard
            emoji="❤️" color="#f5a0b0" index={1}
            title="الجودة والسلامة"
            desc="نضمن أن كل منتج آمن لطفلك، مصنوع من خامات طبيعية عالية الجودة"
          />
          <ValueCard
            emoji="🤝" color="#a8d8ea" index={2}
            title="الثقة والشفافية"
            desc="الدفع عند الاستلام والتوصيل لكل ولايات الجزائر بكل ثقة وأمان"
          />
          <ValueCard
            emoji="🎯" color="#8bc43f" index={3}
            title="التميز والاختيار"
            desc="نختار بعناية كل منتج ليكون فريداً ومميزاً وملهماً للأطفال"
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        maxWidth: 700, margin: '24px auto 0', padding: '0 20px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          animation: 'fadeSlideUp 0.6s ease-out 0.5s both',
        }}>
          {[
            { num: 'ₓ', label: 'ولايات', emoji: '📍' },
            { num: '✧', label: 'منتجات مميزة', emoji: '🎁' },
            { num: '♡', label: 'عائلات سعيدة', emoji: '👨‍👩‍👧‍👦' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 20, padding: '20px 12px', textAlign: 'center',
              border: `2px solid ${COLORS[i]}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: COLORS[i] }}>{s.num}</div>
              <div style={{ fontSize: 12, color: '#8e8e93', fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team spirit */}
      <div style={{ maxWidth: 600, margin: '24px auto 0', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div className="section-card" style={{
          background: 'linear-gradient(135deg, #f8f5ff, #f0f7ff)',
          borderRadius: 24, padding: 28, textAlign: 'center',
          border: '2px solid #d4a5e8',
          animation: 'fadeSlideUp 0.6s ease-out 0.6s both',
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌈</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1d1d1f', marginBottom: 12 }}>عالم ibishop السحري</h2>
          <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.8, margin: 0 }}>
            في ibishop، كل منتج هو بداية مغامرة جديدة. نؤمن بأن كل طفل يستحق الأفضل،
            ولهذا نختار بعناية ألعاباً تنمي الخيال، وتطلق العنان للإبداع، وتصنع ذكريات جميلة تدوم مدى الحياة.
            <br /><br />
            شكراً لأنكم جزء من قصتنا 💚
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            {['🎠', '🎡', '🎢', '🎪', '🦄'].map((e, i) => (
              <span key={i} style={{
                fontSize: 28, animation: `floatStar ${3 + i * 0.4}s ease-in-out ${i * 0.15}s infinite`,
              }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatStar {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }
        @keyframes driftCloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
        @keyframes floatBalloon {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .value-card, .team-card, .section-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .value-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .section-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}
