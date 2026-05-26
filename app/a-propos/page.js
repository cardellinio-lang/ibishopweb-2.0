'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = {
  orange: '#E54E19',
  pink: '#f5a0b0',
  purple: '#d4a5e8',
  blue: '#a8d8ea',
  green: '#b5e5cf',
  yellow: '#f7e7a0',
  peach: '#f7c8b4',
};

const animals = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦁', '🐸', '🐟', '🦋', '🐝', '🐌', '🦄', '🐥', '🦉', '🦜', '🐬', '🐳'];
const nature = ['🌈', '🌻', '🌸', '🌺', '⭐', '🎈', '🎉', '🌿', '🍀', '🌴', '☀️', '🍭', '🧸', '🎠', '🎪', '🎨'];
const allFloating = [...animals, ...nature];

const sections = [
  {
    id: 'story', emoji: '📖', title: 'قصتنا',
    color: COLORS.purple,
    text: 'بدأ ibishop كحلم صغير في غرفة مليئة بالألوان والضحك. اليوم، نحن عائلة من الآباء والمربين الذين يؤمنون أن كل طفل يستحق ألعاباً تغذي خياله وتصنع ابتسامته.',
  },
  {
    id: 'values', emoji: '✨', title: 'قيمنا',
    color: COLORS.pink,
    text: 'الجودة، السلامة، الفرح، والثقة. نختار كل لعبة كأننا نهديها لأطفالنا. لأن ابتسامة طفلك هي أغلى ما نملك.',
  },
  {
    id: 'quality', emoji: '🧸', title: 'الجودة',
    color: COLORS.blue,
    text: 'نستخدم أفضل المواد الطبيعية والخامات الآمنة. كل منتج يمر بفحص دقيق لنضمن أنه يجلب الفرح والأمان لصغارنا.',
  },
  {
    id: 'delivery', emoji: '🚚', title: 'التوصيل',
    color: COLORS.green,
    text: 'نوصلك لكل ولايات الجزائر مع الدفع عند الاستلام. نبذل قصارى جهدنا لتصل ألعابك بسرعة وأمان، لأن فرحة الطفل لا تنتظر.',
  },
  {
    id: 'creativity', emoji: '🎨', title: 'الإبداع',
    color: COLORS.yellow,
    text: 'الطفل يتعلم ويبدع عندما يلعب. كل لعبة في متجرنا هي دعوة مفتوحة لعالم من المغامرات والاختراعات الصغيرة.',
  },
  {
    id: 'mission', emoji: '🌟', title: 'رسالتنا',
    color: COLORS.peach,
    text: 'نحلم أن نرى كل طفل في الجزائر يبتسم ويتعلم ويبدع. شكراً لأنكم جزء من حلمنا. معاً نصنع أجيالاً مشرقة.',
  },
];

function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

function playBird(ctx) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const birdSongs = [
    [{ f: 1800, t: 0.04 }, { f: 2200, t: 0.06 }, { f: 1900, t: 0.05 }],
    [{ f: 2400, t: 0.05 }, { f: 2800, t: 0.04 }],
    [{ f: 1600, t: 0.06 }, { f: 2000, t: 0.05 }, { f: 2400, t: 0.04 }, { f: 2000, t: 0.05 }],
    [{ f: 3000, t: 0.03 }, { f: 3400, t: 0.04 }],
  ];
  const song = birdSongs[Math.floor(Math.random() * birdSongs.length)];
  const startDelay = Math.random() * 0.3;
  song.forEach((note, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.f, now + startDelay + i * 0.06);
    osc.frequency.exponentialRampToValueAtTime(note.f * 1.02, now + startDelay + i * 0.06 + note.t);
    gain.gain.setValueAtTime(0, now + startDelay + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.015, now + startDelay + i * 0.06 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + i * 0.06 + note.t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + startDelay + i * 0.06);
    osc.stop(now + startDelay + i * 0.06 + note.t + 0.15);
  });
}



function FloatingElement({ children, index }) {
  const elRef = useRef(null);
  const startX = useRef(Math.random() * 100);
  const startY = useRef(Math.random() * 100);
  const speed = useRef(0.3 + Math.random() * 0.5);

  useEffect(() => {
    let raf;
    let startTime = Date.now();
    const animate = () => {
      if (!elRef.current) return;
      const t = (Date.now() - startTime) * 0.001;
      const x = startX.current + Math.sin(t * speed.current + index) * 8;
      const y = startY.current + Math.cos(t * speed.current * 0.7 + index * 1.5) * 6;
      elRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${Math.sin(t * 0.5 + index) * 10}deg)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [index]);

  return (
    <span ref={elRef} style={{ display: 'inline-block', fontSize: 24, transition: 'none' }}>
      {children}
    </span>
  );
}

function ParallaxImage({ src, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const speed = 0.08 + (index % 3) * 0.04;
      const y = window.scrollY * speed;
      const x = Math.sin(window.scrollY * 0.001 + index) * 10;
      ref.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [index]);

  return (
    <img ref={ref} src={src} alt="" style={{
      position: 'fixed',
      bottom: '5%',
      right: '3%',
      width: 90,
      height: 90,
      objectFit: 'contain',
      zIndex: 2,
      opacity: 0.35,
      pointerEvents: 'none',
      borderRadius: 20,
      transition: 'transform 0.1s ease-out',
    }} />
  );
}

function ParallaxAnimal({ emoji, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const speed = 0.15 + (index % 5) * 0.05;
      const y = window.scrollY * speed;
      const x = Math.sin(window.scrollY * 0.002 + index) * 20;
      ref.current.style.transform = `translate(${x}px, ${y}px) rotate(${Math.sin(window.scrollY * 0.001 + index) * 15}deg)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [index]);

  const positions = [
    { top: '10%', left: '5%' },
    { top: '25%', right: '3%' },
    { top: '45%', left: '2%' },
    { top: '60%', right: '5%' },
    { top: '80%', left: '4%' },
    { top: '95%', right: '2%' },
    { top: '15%', left: '88%' },
    { top: '50%', left: '92%' },
  ];

  return (
    <span ref={ref} style={{
      position: 'fixed',
      top: positions[index % positions.length].top,
      left: positions[index % positions.length].left,
      right: positions[index % positions.length].right,
      fontSize: 32 + (index % 3) * 8,
      zIndex: 0,
      opacity: 0.25,
      pointerEvents: 'none',
      transition: 'transform 0.1s ease-out',
      display: index % 2 === 0 ? undefined : 'none',
    }}>
      {emoji}
    </span>
  );
}

function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
      transition: `all 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function SectionCard({ section, index }) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: 28,
        padding: '32px 28px',
        marginBottom: 24,
        border: `2.5px solid ${section.color}40`,
        boxShadow: `0 8px 40px ${section.color}20, 0 2px 8px rgba(0,0,0,0.04)`,
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
          e.currentTarget.style.boxShadow = `0 16px 60px ${section.color}30, 0 4px 12px rgba(0,0,0,0.06)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = `0 8px 40px ${section.color}20, 0 2px 8px rgba(0,0,0,0.04)`;
        }}>
        <div style={{
          fontSize: 48, marginBottom: 12, display: 'inline-block',
          animation: `bounceSlow 3s ease-in-out ${index * 0.3}s infinite`,
        }}>
          {section.emoji}
        </div>
        <h2 style={{
          fontSize: 22, fontWeight: 900, color: section.color, marginBottom: 10,
          fontFamily: "'Tajawal', sans-serif",
        }}>
          {section.title}
        </h2>
        <p style={{
          fontSize: 15, color: '#4a4a50', lineHeight: 1.8, margin: 0,
          fontFamily: "'Tajawal', sans-serif",
        }}>
          {section.text}
        </p>
        <div style={{
          position: 'absolute', bottom: 0, right: 0, left: 0, height: 4,
          background: `linear-gradient(90deg, transparent, ${section.color}60, transparent)`,
          borderRadius: 2,
        }} />
      </div>
    </ScrollReveal>
  );
}

function FloatingMarquee() {
  const items = [...animals, ...nature];
  return (
    <div style={{ overflow: 'hidden', padding: '12px 0', position: 'relative' }}>
      <div style={{
        display: 'flex', gap: 20, whiteSpace: 'nowrap',
        animation: 'marquee 25s linear infinite',
        fontSize: 28,
      }}>
        {[...items, ...items, ...items].map((item, i) => (
          <FloatingElement key={i} index={i}>{item}</FloatingElement>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function APropos() {
  const [entered, setEntered] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const splashRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioCtx) {
      const ctx = createAudioContext();
      setAudioCtx(ctx);
      return ctx;
    }
    return audioCtx;
  }, [audioCtx]);

  const handleEnter = useCallback(() => {
    const ctx = initAudio();
    if (ctx && soundOn) {
      setTimeout(() => playBird(ctx), 200);
      setTimeout(() => playBird(ctx), 800);
    }
    setEntered(true);
  }, [initAudio, soundOn]);

  useEffect(() => {
    if (entered && audioCtx && soundOn) {
      const interval = setInterval(() => {
        if (Math.random() < 0.35) playBird(audioCtx);
      }, 6000 + Math.random() * 4000);
      return () => clearInterval(interval);
    }
  }, [entered, audioCtx, soundOn]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  const toggleSound = () => {
    setSoundOn(prev => !prev);
  };

  if (!entered) {
    return (
      <div ref={splashRef} style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff7e6 0%, #fce4ec 30%, #e8f5e9 60%, #e3f2fd 100%)',
        overflow: 'hidden',
      }}>
        {animals.slice(0, 8).map((a, i) => (
          <span key={i} style={{
            position: 'absolute',
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            fontSize: 24 + Math.random() * 20,
            opacity: 0.3,
            animation: `floatUp ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
          }}>
            {a}
          </span>
        ))}
        <style>{`
          @keyframes floatUp {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
        `}</style>

        <div style={{
          textAlign: 'center', zIndex: 1,
          animation: 'fadeSlideUp 0.8s ease-out',
        }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>
            <span style={{ animation: 'bounceSlow 2s ease-in-out infinite', display: 'inline-block' }}>🧸</span>
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, marginBottom: 8,
            fontFamily: "'Tajawal', sans-serif",
            background: 'linear-gradient(135deg, #E54E19, #d4a5e8, #a8d8ea, #b5e5cf)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            مرحباً بك في عالم ibishop
          </h1>
          <p style={{
            fontSize: 16, color: '#6e6e73', marginBottom: 32,
            fontFamily: "'Tajawal', sans-serif",
          }}>
            عالم مليء بالضحك والألوان والأحلام الجميلة ✨
          </p>
          <button onClick={handleEnter}
                  style={{
                    padding: '18px 52px', fontSize: 20, fontWeight: 900,
                    background: 'linear-gradient(135deg, #E54E19, #d4a5e8)',
                    color: '#fff', border: 'none', borderRadius: 60,
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(229,78,25,0.3)',
                    fontFamily: "'Tajawal', sans-serif",
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'scale(1.06)';
                    e.target.style.boxShadow = '0 12px 40px rgba(229,78,25,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 8px 32px rgba(229,78,25,0.3)';
                  }}>
            <span style={{ position: 'relative', zIndex: 1 }}>🎉 اضغط لتدخل عالم المرح 🎉</span>
          </button>
        </div>
        <style>{`
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Parallax floating animals in background */}
      {animals.slice(0, 8).map((a, i) => (
        <ParallaxAnimal key={i} emoji={a} index={i} />
      ))}
      <ParallaxImage src="https://i.ibb.co/bjg5Lr0Q/ee8540708d94e854f5d52bf6082bf359.jpg" index={0} />

      <div style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>

        {/* Sound toggle */}
        <button onClick={toggleSound} style={{
          position: 'fixed', top: 80, left: 12, zIndex: 100,
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e8e8ed',
          cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          {soundOn ? '🔊' : '🔇'}
        </button>

        {/* Hero section */}
        <div style={{
          textAlign: 'center', padding: '40px 16px 20px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(229,78,25,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <ScrollReveal>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              <span style={{ animation: 'bounceSlow 2s ease-in-out infinite', display: 'inline-block' }}>🌈</span>
            </div>
            <p style={{
              fontSize: 13, color: '#8e8e93', letterSpacing: 3, fontWeight: 700,
              marginBottom: 4, fontFamily: "'Montserrat', sans-serif",
            }}>
              BIENVENUE DANS NOTRE MONDE MAGIQUE
            </p>
            <h1 style={{
              fontSize: 32, fontWeight: 900, marginBottom: 6,
              fontFamily: "'Tajawal', sans-serif",
              background: 'linear-gradient(135deg, #E54E19, #d4a5e8, #a8d8ea)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              عالم ibishop السحري
            </h1>
            <p style={{
              fontSize: 15, color: '#6e6e73', marginBottom: 4,
              fontFamily: "'Tajawal', sans-serif",
            }}>
              رحلة مليئة بالضحك والتعلم والإبداع 🚀
            </p>
          </ScrollReveal>
        </div>

        {/* Floating emoji marquee */}
        <FloatingMarquee />

        {/* Divider */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #E54E19, #d4a5e8, #a8d8ea, #b5e5cf, #f7e7a0, #E54E19)',
          width: '60%', margin: '20px auto', borderRadius: 2,
        }} />

        {/* Content cards */}
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '12px 16px 40px' }}>
          {sections.map((section, i) => (
            <SectionCard key={section.id} section={section} index={i} />
          ))}
        </div>

        {/* Footer */}
        <ScrollReveal>
          <div style={{
            textAlign: 'center', padding: '24px 16px',
            background: 'linear-gradient(135deg, rgba(229,78,25,0.04), rgba(212,165,232,0.04))',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              <span style={{ animation: 'bounceSlow 2.5s ease-in-out infinite', display: 'inline-block' }}>💛</span>
            </div>
            <p style={{
              fontSize: 18, fontWeight: 800, color: '#E54E19', marginBottom: 4,
              fontFamily: "'Tajawal', sans-serif",
            }}>
              شكراً لأنك جزء من قصتنا
            </p>
            <p style={{
              fontSize: 14, color: '#8e8e93',
              fontFamily: "'Tajawal', sans-serif",
            }}>
              معاً نصنع ابتسامة كل طفل في الجزائر 🌟
            </p>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16,
              fontSize: 24,
            }}>
              {['🎈', '🎉', '🎊', '🎀', '🎁', '🧸'].map((e, i) => (
                <span key={i} style={{
                  animation: `floatUp ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
                  display: 'inline-block',
                }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes floatUp {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-16px) rotate(8deg); }
          }
          @keyframes pulseGlow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.1); }
          }
        `}</style>
      </div>
    </>
  );
}
