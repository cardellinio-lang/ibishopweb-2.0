'use client';

import { useEffect, useState } from 'react';

const PALETTE = {
  orange: '#E54E19',
  pink: '#f5a0b0',
  purple: '#d4a5e8',
  blue: '#a8d8ea',
  mint: '#b5e5cf',
  yellow: '#f7e7a0',
  peach: '#f7c8b4',
};

function ChalkDots({ color, style }) {
  return (
    <svg width="200" height="12" viewBox="0 0 200 12" style={{ display: 'block', ...style }}>
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={6 + i * 13} cy="6" r="3" fill={color} opacity="0.5" />
      ))}
    </svg>
  );
}

function TreeIllustration() {
  return (
    <svg viewBox="0 0 320 380" style={{ width: '100%', maxWidth: 320, display: 'block' }}>
      {/* trunk */}
      <path d="M150 200 Q145 260 140 310 Q135 340 130 370 L170 370 Q165 340 160 310 Q155 260 150 200Z" fill="#b07d5b" />
      <path d="M140 310 Q155 300 170 310" stroke="#8b5e3c" strokeWidth="1.5" fill="none" />

      {/* foliage circles */}
      <circle cx="160" cy="120" r="50" fill={PALETTE.mint} opacity="0.8" />
      <circle cx="100" cy="150" r="35" fill={PALETTE.purple} opacity="0.7" />
      <circle cx="220" cy="140" r="40" fill={PALETTE.orange} opacity="0.6" />
      <circle cx="130" cy="80" r="30" fill={PALETTE.yellow} opacity="0.75" />
      <circle cx="200" cy="90" r="32" fill={PALETTE.pink} opacity="0.7" />
      <circle cx="80" cy="110" r="25" fill={PALETTE.blue} opacity="0.7" />
      <circle cx="240" cy="180" r="28" fill={PALETTE.yellow} opacity="0.6" />
      <circle cx="170" cy="170" r="30" fill={PALETTE.purple} opacity="0.5" />
      <circle cx="120" cy="180" r="25" fill={PALETTE.peach} opacity="0.7" />

      {/* small decorative dots */}
      {[[70,90], [250,120], [180,60], [60,170], [270,160], [140,60], [230,60], [90,200]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="6"
                fill={[PALETTE.orange,PALETTE.pink,PALETTE.blue,PALETTE.yellow,PALETTE.purple][i%5]} opacity="0.5" />
      ))}
    </svg>
  );
}

function CatSVG() {
  return (
    <svg viewBox="0 0 60 50" width="60" height="50">
      <ellipse cx="30" cy="35" rx="20" ry="15" fill={PALETTE.peach} />
      <circle cx="30" cy="22" r="14" fill={PALETTE.peach} />
      <polygon points="18,12 14,0 24,10" fill={PALETTE.peach} />
      <polygon points="42,12 46,0 36,10" fill={PALETTE.peach} />
      <polygon points="18,12 14,0 24,10" fill={PALETTE.pink} opacity="0.4" />
      <polygon points="42,12 46,0 36,10" fill={PALETTE.pink} opacity="0.4" />
      {/* eyes */}
      <ellipse cx="25" cy="22" rx="3" ry="4" fill="#333" />
      <ellipse cx="35" cy="22" rx="3" ry="4" fill="#333" />
      <circle cx="26" cy="21" r="1.5" fill="#fff" />
      <circle cx="36" cy="21" r="1.5" fill="#fff" />
      {/* nose */}
      <polygon points="30,26 28,28 32,28" fill={PALETTE.pink} />
      {/* tail */}
      <path d="M50 30 Q58 25 55 15" stroke={PALETTE.peach} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BunnySVG() {
  return (
    <svg viewBox="0 0 50 55" width="50" height="55">
      <ellipse cx="25" cy="38" rx="16" ry="14" fill="#f0e6d3" />
      <circle cx="25" cy="25" r="12" fill="#f0e6d3" />
      {/* ears */}
      <ellipse cx="18" cy="8" rx="5" ry="14" fill="#f0e6d3" />
      <ellipse cx="32" cy="6" rx="5" ry="14" fill="#f0e6d3" />
      <ellipse cx="18" cy="8" rx="3" ry="10" fill={PALETTE.pink} opacity="0.5" />
      <ellipse cx="32" cy="6" rx="3" ry="10" fill={PALETTE.pink} opacity="0.5" />
      {/* eyes */}
      <circle cx="21" cy="24" r="3" fill="#333" />
      <circle cx="29" cy="24" r="3" fill="#333" />
      <circle cx="22" cy="23" r="1" fill="#fff" />
      <circle cx="30" cy="23" r="1" fill="#fff" />
      {/* nose */}
      <ellipse cx="25" cy="28" rx="2" ry="1.5" fill={PALETTE.pink} />
    </svg>
  );
}

function BirdSVG() {
  return (
    <svg viewBox="0 0 40 35" width="40" height="35">
      <ellipse cx="18" cy="22" rx="14" ry="11" fill={PALETTE.blue} />
      <circle cx="28" cy="14" r="10" fill={PALETTE.blue} />
      {/* beak */}
      <polygon points="36,14 44,12 36,17" fill={PALETTE.orange} />
      {/* eye */}
      <circle cx="30" cy="13" r="3" fill="#333" />
      <circle cx="31" cy="12" r="1" fill="#fff" />
      {/* wing */}
      <ellipse cx="14" cy="24" rx="10" ry="7" fill={PALETTE.blue} opacity="0.6" />
      {/* tail */}
      <path d="M4 25 Q-2 30 0 35" stroke={PALETTE.blue} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M4 25 Q-4 28 -2 33" stroke={PALETTE.blue} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FoxSVG() {
  return (
    <svg viewBox="0 0 55 50" width="55" height="50">
      <ellipse cx="28" cy="35" rx="18" ry="14" fill={PALETTE.orange} opacity="0.8" />
      <circle cx="28" cy="22" r="13" fill={PALETTE.orange} opacity="0.8" />
      {/* ears */}
      <polygon points="16,14 10,0 22,10" fill={PALETTE.orange} opacity="0.8" />
      <polygon points="40,14 46,0 34,10" fill={PALETTE.orange} opacity="0.8" />
      <polygon points="17,12 13,4 21,10" fill="#fff" opacity="0.5" />
      <polygon points="39,12 43,4 35,10" fill="#fff" opacity="0.5" />
      {/* eyes */}
      <ellipse cx="23" cy="21" rx="3" ry="3.5" fill="#333" />
      <ellipse cx="33" cy="21" rx="3" ry="3.5" fill="#333" />
      <circle cx="24" cy="20" r="1.2" fill="#fff" />
      <circle cx="34" cy="20" r="1.2" fill="#fff" />
      {/* nose */}
      <ellipse cx="28" cy="26" rx="2" ry="1.5" fill="#333" />
      {/* chest */}
      <ellipse cx="28" cy="40" rx="10" ry="8" fill="#fff" opacity="0.4" />
      {/* tail */}
      <path d="M46 35 Q54 30 52 20" stroke={PALETTE.orange} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
      <circle cx="52" cy="20" r="5" fill="#fff" opacity="0.6" />
    </svg>
  );
}

function EntranceScene() {
  return (
    <svg viewBox="0 0 280 180" style={{ width: '100%', maxWidth: 280, marginBottom: 20 }}>

      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={20 + Math.random() * 240} cy={10 + Math.random() * 30}
                r={2 + Math.random() * 3}
                fill={[PALETTE.orange, PALETTE.purple, PALETTE.blue, PALETTE.yellow, PALETTE.pink][i % 5]}
                opacity="0.5" >
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ground */}
      <ellipse cx="140" cy="165" rx="130" ry="15" fill={PALETTE.mint} opacity="0.3" />

      {/* tree */}
      <path d="M130 160 Q128 130 125 100 Q122 80 120 60" stroke="#b07d5b" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M150 160 Q152 130 155 100 Q158 80 160 60" stroke="#b07d5b" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="130" cy="50" r="28" fill={PALETTE.mint} opacity="0.7" />
      <circle cx="160" cy="55" r="25" fill={PALETTE.yellow} opacity="0.6" />
      <circle cx="145" cy="35" r="22" fill={PALETTE.purple} opacity="0.6" />
      <circle cx="115" cy="70" r="20" fill={PALETTE.pink} opacity="0.5" />
      <circle cx="175" cy="75" r="18" fill={PALETTE.blue} opacity="0.6" />
      <circle cx="145" cy="75" r="22" fill={PALETTE.orange} opacity="0.4" />

      {/* cat under tree */}
      <ellipse cx="100" cy="155" rx="12" ry="8" fill={PALETTE.peach} />
      <circle cx="100" cy="145" r="8" fill={PALETTE.peach} />
      <polygon points="94,140 91,130 98,138" fill={PALETTE.peach} />
      <polygon points="106,140 109,130 102,138" fill={PALETTE.peach} />

      {/* bunny */}
      <ellipse cx="190" cy="155" rx="10" ry="8" fill="#f0e6d3" />
      <circle cx="190" cy="145" r="7" fill="#f0e6d3" />
      <ellipse cx="186" cy="133" rx="3" ry="8" fill="#f0e6d3" />
      <ellipse cx="194" cy="132" rx="3" ry="8" fill="#f0e6d3" />

      {/* bird on branch */}
      <circle cx="170" cy="92" r="7" fill={PALETTE.blue} />
      <ellipse cx="170" cy="98" rx="8" ry="5" fill={PALETTE.blue} />

      {/* balloons */}
      {[
        { x: 30, y: 100, color: PALETTE.pink },
        { x: 250, y: 90, color: PALETTE.purple },
        { x: 35, y: 130, color: PALETTE.yellow },
      ].map((b, i) => (
        <g key={i}>
          <ellipse cx={b.x} cy={b.y} rx="8" ry="10" fill={b.color} opacity="0.7">
            <animate attributeName="cy" values={`${b.y};${b.y - 8};${b.y}`} dur={`${4 + i}s`} repeatCount="indefinite" />
          </ellipse>
          <line x1={b.x} y1={b.y + 10} x2={b.x} y2={b.y + 18} stroke="#999" strokeWidth="0.5" />
        </g>
      ))}

      {/* flowers */}
      {[[60,160],[220,158],[240,162],[80,163]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={[PALETTE.pink, PALETTE.yellow, PALETTE.purple, PALETTE.blue][i]} opacity="0.7" />
      ))}
    </svg>
  );
}

function AnimalParade() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'flex-end', margin: '16px 0' }}>
      <CatSVG />
      <BunnySVG />
      <BirdSVG />
      <FoxSVG />
    </div>
  );
}

const Section = ({ children, color, delay = 0, style }) => (
  <div style={{
    maxWidth: 640, margin: '20px auto 0', padding: '0 16px',
    position: 'relative', zIndex: 1, animation: `fadeSlideUp 0.5s ease-out ${delay}s both`,
    ...style,
  }}>
    <div style={{
      background: '#fff', borderRadius: 28, padding: '28px 24px',
      boxShadow: '0 6px 30px rgba(0,0,0,0.05)',
      border: `3px solid ${color}`,
      position: 'relative',
    }}>
      {children}
    </div>
  </div>
);

const ValueLeaf = ({ emoji, label, color, index }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', borderRadius: 20,
    background: `${color}15`,
    border: `2px solid ${color}`,
    animation: `fadeSlideUp 0.5s ease-out ${0.4 + index * 0.1}s both`,
  }}>
    <span style={{ fontSize: 24 }}>{emoji}</span>
    <div>
      <div style={{ fontWeight: 800, fontSize: 16, color: '#1d1d1f' }}>{label}</div>
    </div>
  </div>
);

const StatBadge = ({ label, emoji, color, index }) => (
  <div style={{
    textAlign: 'center', padding: '16px 12px', borderRadius: 20,
    background: `${color}10`,
    border: `2px solid ${color}`,
    animation: `fadeSlideUp 0.5s ease-out ${0.5 + index * 0.1}s both`,
  }}>
    <div style={{ fontSize: 32, marginBottom: 4 }}>{emoji}</div>
    <div style={{ fontSize: 13, color: '#6e6e73', fontWeight: 700 }}>{label}</div>
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
        padding: 20, position: 'relative', zIndex: 1,
      }}>
        <div style={{ animation: 'fadeSlideUp 0.8s ease-out' }}>
          <EntranceScene />
          <h1 style={{
            fontSize: 32, fontWeight: 900, marginBottom: 8,
            background: `linear-gradient(135deg, ${PALETTE.orange}, ${PALETTE.purple}, ${PALETTE.blue})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            مرحباً بك في عالم ibishop
          </h1>
          <p style={{ fontSize: 16, color: '#6e6e73', marginBottom: 28, lineHeight: 1.6 }}>
            عالم مليء بالمرح والخيال والألعاب الجميلة
          </p>
          <button onClick={() => setEntered(true)}
                  style={{
                    padding: '16px 48px', fontSize: 20, fontWeight: 900,
                    background: `linear-gradient(135deg, ${PALETTE.orange}, #c4410d)`,
                    color: '#fff', border: 'none', borderRadius: 50,
                    cursor: 'pointer', boxShadow: `0 8px 32px ${PALETTE.orange}44`,
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
            اضغط لتدخل
          </button>
          <AnimalParade />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: 40, overflow: 'hidden' }}>

      {/* animated floating orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            width: `${20 + Math.random() * 50}px`,
            height: `${20 + Math.random() * 50}px`,
            borderRadius: '50%',
            background: [PALETTE.orange, PALETTE.purple, PALETTE.blue, PALETTE.pink, PALETTE.mint, PALETTE.yellow][i % 6],
            opacity: 0.08,
            animation: `floatOrb ${8 + Math.random() * 6}s ease-in-out ${Math.random() * 3}s infinite`,
          }} />
        ))}
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '24px 16px 0', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-block', animation: 'fadeSlideUp 0.5s ease-out',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>
            <svg viewBox="0 0 80 40" width="80" height="40" style={{ display: 'block', margin: '0 auto' }}>
              <circle cx="20" cy="20" r="8" fill={PALETTE.pink} opacity="0.7" />
              <circle cx="40" cy="15" r="10" fill={PALETTE.blue} opacity="0.6" />
              <circle cx="60" cy="20" r="8" fill={PALETTE.orange} opacity="0.6" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 900, marginBottom: 6,
            background: `linear-gradient(135deg, ${PALETTE.orange}, ${PALETTE.purple}, ${PALETTE.blue})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            من نحن
          </h1>
          <p style={{ fontSize: 15, color: '#6e6e73', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
            ibishop يجلب الفرح والتعلم لكل طفل في الجزائر من خلال ألعاب خشبية وتعليمية مختارة بعناية
          </p>
        </div>
      </div>

      <ChalkDots color={PALETTE.purple} style={{ margin: '16px auto 0' }} />

      {/* Story + big tree side by side */}
      <Section color={PALETTE.orange} delay={0.15}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 36 }}>📖</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1d1d1f', margin: 0 }}>قصتنا</h2>
          <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.8, margin: 0, textAlign: 'center' }}>
            بدأ ibishop كحلم بسيط: نريد أن نقدم لأطفال الجزائر ألعاباً تعليمية جميلة وآمنة بأسعار معقولة.
            اخترنا بعناية كل منتج ليكون نافذة على عالم من الإبداع والمرح.
          </p>
        </div>
      </Section>

      {/* Tree section */}
      <div style={{ textAlign: 'center', padding: '16px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ animation: 'fadeSlideUp 0.5s ease-out 0.2s both' }}>
          <TreeIllustration />
          <p style={{ fontSize: 14, color: '#6e6e73', marginTop: 8 }}>
            🌿 كل فرع من ibishop يحمل الإبداع والمرح
          </p>
        </div>
      </div>

      <ChalkDots color={PALETTE.pink} style={{ margin: '0 auto' }} />

      {/* Values as leaves */}
      <Section color={PALETTE.mint} delay={0.3}>
        <h2 style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', color: '#1d1d1f', margin: '0 0 16px' }}>
          قيمنا
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ValueLeaf emoji="🧠" label="التعليم باللعب: نختار ألعاباً تنمي الذكاء والإبداع" color={PALETTE.purple} index={0} />
          <ValueLeaf emoji="❤️" label="الجودة والسلامة: كل منتج آمن وطبيعي لطفلك" color={PALETTE.pink} index={1} />
          <ValueLeaf emoji="🤝" label="الثقة: دفع عند الاستلام وتوصيل لكل الولايات" color={PALETTE.blue} index={2} />
          <ValueLeaf emoji="✨" label="التميز: نختار كل منتج ليكون فريداً وملهماً" color={PALETTE.orange} index={3} />
        </div>
      </Section>

      <ChalkDots color={PALETTE.blue} style={{ margin: '0 auto' }} />

      {/* Animals + final message side by side */}
      <Section color={PALETTE.purple} delay={0.45}>
        <div style={{ textAlign: 'center' }}>
          <AnimalParade />
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1d1d1f', margin: '12px 0 8px' }}>
            عالم ibishop السحري
          </h2>
          <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.8, margin: 0 }}>
            في ibishop، كل منتج هو بداية قصة جديدة. نؤمن أن الطفل يتعلم ويبدع عندما يلعب،
            ولهذا نختار ألعاباً تصنع الابتسامات والذكريات الجميلة.
            <br /><br />
            شكراً لأنكم معنا في هذه المغامرة 💚
          </p>
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '16px 16px', position: 'relative', zIndex: 1 }}>
        <StatBadge label="منتجات مميزة" emoji="🎁" color={PALETTE.purple} index={0} />
        <StatBadge label="عائلات سعيدة" emoji="👨‍👩‍👧‍👦" color={PALETTE.pink} index={1} />
      </div>

      <ChalkDots color={PALETTE.orange} style={{ margin: '8px auto' }} />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes floatStar {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
        }
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
