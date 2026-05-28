'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

const BLOG_VISIBLE_KEY = 'blog_visible';

function getCategoryGradient(category) {
  const map = {
    'تعلم الحروف': 'linear-gradient(135deg, #FFE4CC, #FFB380)',
    'الأرقام والحساب': 'linear-gradient(135deg, #CCE8FF, #80C4FF)',
    'الإبداع واليدوي': 'linear-gradient(135deg, #E4FFCC, #A8E680)',
    'النطق واللغة': 'linear-gradient(135deg, #FFE4F0, #FF80B3)',
  };
  return map[category] || 'linear-gradient(135deg, #f0e4cc, #e0d0b8)';
}

function getCategoryIcon(category) {
  const map = {
    'تعلم الحروف': '🔤',
    'الأرقام والحساب': '🔢',
    'الإبداع واليدوي': '🎨',
    'الألعاب المنطقية': '🧩',
    'النطق واللغة': '🗣️',
    'التربية والقيم': '🌿',
  };
  return map[category] || '📖';
}

const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'تعلم الحروف', label: 'تعلم الحروف' },
  { id: 'الإبداع واليدوي', label: 'الإبداع' },
  { id: 'النطق واللغة', label: 'النطق' },
  { id: 'التربية والقيم', label: 'التربية' },
  { id: 'الأرقام والحساب', label: 'الأرقام' },
  { id: 'الألعاب المنطقية', label: 'منطقية' },
];

const categoryStripItems = [
  { icon: '🔤', label: 'تعلم الحروف' },
  { icon: '🔢', label: 'الأرقام والحساب' },
  { icon: '🎨', label: 'الإبداع واليدوي' },
  { icon: '🧩', label: 'الألعاب المنطقية' },
  { icon: '🗣️', label: 'النطق واللغة' },
  { icon: '🌿', label: 'التربية والقيم' },
];

function GrainBg({ opacity = 0.035 }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope={opacity} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

function WaveDivider({ color, flip = false }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 60, overflow: 'hidden', lineHeight: 0, marginTop: -2, zIndex: 1 }}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%', transform: flip ? 'scaleY(-1)' : 'none' }}>
        <path d="M0,30 C300,60 600,0 900,30 C1050,45 1200,15 1200,15 L1200,60 L0,60 Z" fill={color} />
      </svg>
    </div>
  );
}

function FloatingLetters() {
  const letters = ['أ', 'ب', 'ت', 'ث'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {letters.map((l, i) => (
        <span key={i} style={{
          position: 'absolute',
          fontSize: [28, 36, 24, 32][i],
          fontWeight: 900,
          color: ['#E54E19', '#8BA888', '#FDD835', '#FF6B35'][i],
          opacity: 0.25,
          top: `${[10, 25, 60, 45][i]}%`,
          [i % 2 === 0 ? 'right' : 'left']: `${[8, 12, 5, 10][i]}%`,
          animation: `float${i} ${[3.5, 4.2, 2.8, 3.9][i]}s ease-in-out infinite`,
          animationDelay: `${i * 0.6}s`,
        }}>
          {l}
        </span>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const featuredRef = useRef(null);

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => {
        const visible = data.filter(p => p.visible !== false);
        if (visible.length > 0) {
          setPosts(visible);
          setLoading(false);
        } else {
          import('./data').then(mod => {
            setPosts(mod.getAllPosts().map(p => ({ ...p, category: '', readingTime: '5 دقائق', icon: '📖', visible: true })));
            setLoading(false);
          });
        }
      })
      .catch(() => {
        import('./data').then(mod => {
          setPosts(mod.getAllPosts().map(p => ({ ...p, category: '', readingTime: '5 دقائق', icon: '📖', visible: true })));
          setLoading(false);
        });
      });

    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float0 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      @keyframes float1 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      @keyframes float2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes float3 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let f = posts;
    if (activeFilter !== 'all') f = f.filter(p => p.category === activeFilter);
    if (searchQuery) f = f.filter(p => p.title.includes(searchQuery) || p.excerpt.includes(searchQuery));
    return f;
  }, [posts, activeFilter, searchQuery]);

  const featured = posts.length > 0 ? posts[0] : null;
  const otherPosts = posts.slice(1);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            height: 120, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
            borderRadius: 16, marginBottom: 16,
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <style>{`
        .blog-card { transition: all 0.3s ease; }
        .blog-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(28,16,8,0.18); }
        .filter-tab { transition: all 0.2s ease; cursor: pointer; }
        .filter-tab:hover { background: #E54E19; color: #fff; }
        .cta-pulse:hover { transform: scale(1.04); }
        .category-card { transition: all 0.3s ease; cursor: pointer; }
        .category-card:hover { transform: scale(1.06); box-shadow: 0 20px 60px rgba(28,16,8,0.18); border-color: #E54E19; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        padding: scrolled ? '10px 24px' : '16px 24px',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: scrolled ? 36 : 40, height: scrolled ? 36 : 40,
              background: '#E54E19', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: scrolled ? 16 : 18,
              transition: 'all 0.3s ease',
            }}>i</div>
            <span style={{ fontWeight: 900, fontSize: scrolled ? 18 : 20, color: '#1C1008', transition: 'all 0.3s ease' }}>
              ibishop
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {['المقالات', 'الأعمار', 'الفئات', 'عن ibishop'].map((item, i) => (
                <a key={i} href={['/blog', '/#categories', '/#', '/a-propos'][i]} style={{
                  fontWeight: 700, fontSize: 14, color: '#1C1008', opacity: 0.7,
                  transition: 'opacity 0.2s', textDecoration: 'none',
                }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0.7'}>
                  {item}
                </a>
              ))}
            </div>
            <Link href="/" style={{
              background: '#E54E19', color: '#fff', padding: '10px 22px',
              borderRadius: 50, fontWeight: 800, fontSize: 13,
              textDecoration: 'none', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
            className="cta-pulse">
              اشتري منتجاتنا
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: '#FDF6EC', position: 'relative', overflow: 'hidden',
        padding: '40px 24px 0',
      }}>
        <GrainBg />
        <FloatingLetters />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 60,
            flexDirection: 'row',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#E54E19', color: '#FDF6EC',
                padding: '6px 16px', borderRadius: 50,
                fontSize: 13, fontWeight: 700, marginBottom: 20,
              }}>
                🇩🇿 صنع في الجزائر
              </div>
              <h1 style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900, fontSize: 48,
                color: '#1C1008', lineHeight: 1.1,
                marginBottom: 16,
              }}>
                اكتشف عالم التعلم<br />مع طفلك
              </h1>
              <p style={{
                fontSize: 16, color: 'rgba(28,16,8,0.6)',
                lineHeight: 1.7, marginBottom: 28, maxWidth: 480,
              }}>
                مقالات، نصائح، وأفكار تربوية للأهل الجزائريين — لأن كل طفل يتعلم بطريقته
              </p>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#fff', borderRadius: 50,
                boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
                maxWidth: 480, overflow: 'hidden',
              }}>
                <input
                  type="text"
                  placeholder="ابحث عن مقال..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, border: 'none', padding: '16px 24px',
                    fontSize: 15, background: 'transparent',
                    outline: 'none', fontFamily: "'Tajawal', sans-serif",
                  }}
                />
                <button style={{
                  background: '#E54E19', color: '#fff', border: 'none',
                  padding: '14px 28px', margin: 4, borderRadius: 50,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  🔍 بحث
                </button>
              </div>
            </div>
            <div style={{ flex: '0 0 380px', position: 'relative' }}>
              <div style={{
                position: 'relative', width: 380, height: 380,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute', width: 340, height: 340,
                  borderRadius: '50%', background: 'rgba(232,69,10,0.06)',
                }} />
                <div style={{
                  position: 'absolute', width: 280, height: 280,
                  borderRadius: '50%', background: 'rgba(232,69,10,0.04)',
                }} />
                <div style={{
                  width: 220, height: 220, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FDF6EC, #FFE4CC)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 100, boxShadow: '0 20px 60px rgba(232,69,10,0.15)',
                  position: 'relative',
                }}>
                  👶
                  <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 36, animation: 'float0 3s ease-in-out infinite' }}>📖</span>
                  <span style={{ position: 'absolute', bottom: 10, left: -20, fontSize: 28, animation: 'float1 3.5s ease-in-out infinite', animationDelay: '1s' }}>🔤</span>
                  <span style={{ position: 'absolute', bottom: -10, right: -15, fontSize: 24, animation: 'float2 2.8s ease-in-out infinite', animationDelay: '0.5s' }}>⭐</span>
                  <span style={{ position: 'absolute', top: 20, left: -10, fontSize: 20, animation: 'float3 4s ease-in-out infinite', animationDelay: '1.5s' }}>🌿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WaveDivider color="#FDD835" />
      </section>

      {/* CATEGORIES STRIP */}
      <section style={{ background: '#FDD835', padding: '40px 24px', position: 'relative' }}>
        <GrainBg opacity={0.025} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Cairo', sans-serif", fontWeight: 700,
            fontSize: 26, color: '#1C1008', textAlign: 'center', marginBottom: 28,
          }}>
            تصفح حسب الفئة
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16,
          }}>
            {categoryStripItems.map((item, i) => (
              <div key={i} className="category-card" style={{
                background: '#fff', borderRadius: 18,
                padding: '20px 12px', textAlign: 'center',
                boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
                border: '2px solid transparent',
                textDecoration: 'none', display: 'block',
              }}
              onClick={() => {
                setActiveFilter(item.label);
                document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FDF6EC', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, margin: '0 auto 10px',
                }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1008' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider color="#FDF6EC" />
      </section>

      {/* FEATURED ARTICLE */}
      {featured && (
        <section style={{ background: '#FDF6EC', padding: '60px 24px', position: 'relative' }}>
          <GrainBg />
          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#E54E19', color: '#fff',
              padding: '6px 16px', borderRadius: 50,
              fontSize: 13, fontWeight: 700, marginBottom: 20,
            }}>
              ✨ مقال الأسبوع
            </div>
            <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="blog-card" style={{
                display: 'flex', background: '#fff', borderRadius: 24,
                boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
                overflow: 'hidden', flexDirection: 'row-reverse',
              }}>
                <div style={{
                  flex: '0 0 45%', minHeight: 320,
                  background: getCategoryGradient(featured.category),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 80, position: 'relative',
                }}>
                  {featured.icon || getCategoryIcon(featured.category)}
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: '#8BA888', color: '#fff',
                    padding: '4px 12px', borderRadius: 50,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {featured.category || 'عام'}
                  </div>
                </div>
                <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800, fontSize: 28,
                    color: '#1C1008', lineHeight: 1.2,
                    marginBottom: 12,
                  }}>
                    {featured.title}
                  </h3>
                  <p style={{
                    fontSize: 15, color: 'rgba(28,16,8,0.6)',
                    lineHeight: 1.7, marginBottom: 20,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {featured.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: 'rgba(28,16,8,0.4)' }}>⏱ {featured.readingTime || '5 دقائق'}</span>
                    <span style={{ fontSize: 13, color: 'rgba(28,16,8,0.4)' }}>
                      {featured.createdAt ? new Date(featured.createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <span style={{
                    color: '#E54E19', fontWeight: 700, fontSize: 14,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'gap 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.gap = '10px'}
                  onMouseLeave={e => e.currentTarget.style.gap = '6px'}>
                    اقرأ المقال ←
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ARTICLES GRID */}
      <section id="articles-section" style={{ background: '#FDF6EC', padding: '0 24px 60px', position: 'relative' }}>
        <GrainBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{
              fontFamily: "'Cairo', sans-serif", fontWeight: 900,
              fontSize: 36, color: '#1C1008', marginBottom: 8,
            }}>
              أحدث المقالات
            </h2>
            <div style={{ width: 60, height: 4, background: '#E54E19', borderRadius: 2, margin: '0 auto' }} />
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8,
            marginBottom: 32, flexWrap: 'wrap',
          }}>
            {categories.map(cat => (
              <button key={cat.id}
                className="filter-tab"
                onClick={() => setActiveFilter(cat.id)}
                style={{
                  padding: '8px 20px', borderRadius: 50,
                  border: '1.5px solid',
                  borderColor: activeFilter === cat.id ? '#E54E19' : '#d2d2d7',
                  background: activeFilter === cat.id ? '#E54E19' : 'transparent',
                  color: activeFilter === cat.id ? '#fff' : '#1C1008',
                  fontWeight: 700, fontSize: 14,
                  fontFamily: "'Tajawal', sans-serif",
                }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(28,16,8,0.4)' }}>
              <p style={{ fontSize: 48, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 16 }}>لا توجد مقالات في هذه الفئة</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}>
              {filteredPosts.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', transitionDelay: `${i * 0.1}s` }} className="scroll-reveal">
                  <div className="blog-card" style={{
                    background: '#fff', borderRadius: 24,
                    boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
                    overflow: 'hidden', height: '100%',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{
                      height: 200,
                      background: getCategoryGradient(post.category),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 56, position: 'relative',
                    }}>
                      {i === 0 && (
                        <div style={{
                          position: 'absolute', top: 12, left: 12,
                          background: '#E54E19', color: '#fff',
                          padding: '4px 12px', borderRadius: 50,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          أحدث
                        </div>
                      )}
                      {post.icon || getCategoryIcon(post.category)}
                    </div>
                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {post.category && (
                        <div style={{
                          display: 'inline-flex', alignSelf: 'flex-start',
                          background: '#8BA888', color: '#fff',
                          padding: '3px 10px', borderRadius: 50,
                          fontSize: 11, fontWeight: 700, marginBottom: 8,
                        }}>
                          {post.category}
                        </div>
                      )}
                      <h3 style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 700, fontSize: 17,
                        color: '#1C1008', lineHeight: 1.5,
                        marginBottom: 8,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {post.title}
                      </h3>
                      <p style={{
                        fontSize: 14, color: 'rgba(28,16,8,0.5)',
                        lineHeight: 1.7, flex: 1,
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {post.excerpt}
                      </p>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 16, paddingTop: 16,
                        borderTop: '1px solid #f0f0f0',
                      }}>
                        <span style={{ fontSize: 13, color: 'rgba(28,16,8,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          ⏱ {post.readingTime || '5 دقائق'}
                        </span>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#FDF6EC', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#E54E19', fontWeight: 700, fontSize: 16,
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(-10deg)'; e.currentTarget.style.background = '#E54E19'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0)'; e.currentTarget.style.background = '#FDF6EC'; e.currentTarget.style.color = '#E54E19'; }}>
                          ←
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTER BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #E54E19, #FF6B35)',
        padding: '60px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <GrainBg opacity={0.04} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: '15%', right: '8%', fontSize: 40, opacity: 0.15, animation: 'float0 3s ease-in-out infinite' }}>✉️</span>
          <span style={{ position: 'absolute', bottom: '20%', left: '10%', fontSize: 32, opacity: 0.12, animation: 'float1 3.5s ease-in-out infinite', animationDelay: '1s' }}>⭐</span>
          <span style={{ position: 'absolute', top: '60%', right: '20%', fontSize: 24, opacity: 0.1, animation: 'float2 2.8s ease-in-out infinite', animationDelay: '0.5s' }}>✨</span>
        </div>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Cairo', sans-serif", fontWeight: 900,
            fontSize: 32, color: '#fff', marginBottom: 8,
          }}>
            اشترك في نشرتنا التربوية
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28 }}>
            نصائح أسبوعية للأهل مباشرة في بريدك
          </p>
          {emailSubmitted ? (
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 16,
              padding: 20, color: '#fff', fontSize: 16, fontWeight: 700,
            }}>
              ✅ تم الاشتراك بنجاح! شكراً لك.
            </div>
          ) : (
            <form onSubmit={e => {
              e.preventDefault();
              if (email && email.includes('@')) {
                setEmailSubmitted(true);
                setEmail('');
              }
            }} style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto' }}>
              <input
                type="email"
                required
                placeholder="بريدك الإلكتروني..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1, border: 'none', borderRadius: 50,
                  padding: '14px 22px', fontSize: 14,
                  outline: 'none', fontFamily: "'Tajawal', sans-serif",
                }}
              />
              <button type="submit" style={{
                background: '#1C1008', color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: 50,
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = '#E54E19'}
              onMouseLeave={e => e.target.style.background = '#1C1008'}>
                اشترك الآن
              </button>
            </form>
          )}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
            لا إزعاج. إلغاء الاشتراك في أي وقت.
          </p>
        </div>
        <WaveDivider color="#FDF6EC" flip />
      </section>

      {/* POPULAR + SIDEBAR */}
      <section style={{ background: '#FDF6EC', padding: '60px 24px', position: 'relative' }}>
        <GrainBg />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
            {/* Popular List */}
            <div>
              <h3 style={{
                fontFamily: "'Cairo', sans-serif", fontWeight: 800,
                fontSize: 22, color: '#1C1008', marginBottom: 20,
              }}>
                📊 الأكثر قراءة
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {posts.slice(0, 5).map((post, i) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: 12, borderRadius: 16,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 900, fontSize: 28,
                        color: '#E54E19', opacity: 0.3,
                        minWidth: 40, textAlign: 'center',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: getCategoryGradient(post.category),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, flexShrink: 0,
                      }}>
                        {post.icon || getCategoryIcon(post.category)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1008', marginBottom: 2 }}>
                          {post.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(28,16,8,0.4)' }}>
                          ⏱ {post.readingTime || '5 دقائق'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: 'linear-gradient(135deg, #E54E19, #FF6B35)',
                borderRadius: 24, padding: 28, color: '#fff',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>🛍️</p>
                <h4 style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800, fontSize: 20, marginBottom: 8,
                }}>
                  تسوق منتجاتنا
                </h4>
                <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>
                  ألعاب تعليمية خشبية — صنع في الجزائر
                </p>
                <Link href="/" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#1C1008', color: '#fff',
                  padding: '10px 24px', borderRadius: 50,
                  fontWeight: 800, fontSize: 13,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#E54E19'}
                onMouseLeave={e => e.target.style.background = '#1C1008'}>
                  تصفح الآن ←
                </Link>
              </div>

              <div style={{
                background: '#fff', borderRadius: 24, padding: 24,
                boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
              }}>
                <h4 style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800, fontSize: 18, color: '#1C1008',
                  marginBottom: 16,
                }}>
                  الفئات العمرية
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { age: '3-4 سنوات', count: 4 },
                    { age: '5-6 سنوات', count: 8 },
                    { age: '7-9 سنوات', count: 6 },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 12,
                      background: '#FDF6EC', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5ede0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FDF6EC'}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1C1008' }}>
                        {item.age}
                      </span>
                      <span style={{
                        background: '#E54E19', color: '#fff',
                        width: 26, height: 26, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#1C1008', padding: '60px 24px 24px',
        position: 'relative',
      }}>
        <WaveDivider color="#1C1008" />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, background: '#E54E19',
                  borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: '#fff', fontSize: 18,
                }}>i</div>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#fff' }}>ibishop</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                ألعاب تعليمية وتربوية — صنع في الجزائر 🇩🇿
              </p>
            </div>
            <div>
              <h5 style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 14 }}>روابط سريعة</h5>
              {['المنتجات', 'المدونة', 'من نحن', 'اتصل بنا'].map((item, i) => (
                <a key={i} href={['/', '/blog', '/a-propos', '/'][i]} style={{
                  display: 'block', color: 'rgba(255,255,255,0.5)',
                  fontSize: 14, marginBottom: 8, textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  {item}
                </a>
              ))}
            </div>
            <div>
              <h5 style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 14 }}>الفئات</h5>
              {['تعلم الحروف', 'الأرقام', 'الإبداع', 'الألعاب المنطقية'].map((item, i) => (
                <a key={i} href="/" style={{
                  display: 'block', color: 'rgba(255,255,255,0.5)',
                  fontSize: 14, marginBottom: 8, textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                  {item}
                </a>
              ))}
            </div>
            <div>
              <h5 style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 14 }}>تواصل معنا</h5>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'Facebook', href: 'https://www.facebook.com/ibishop.boutique' },
                  { label: 'Instagram', href: 'https://instagram.com/ibishop.dz' },
                  { label: 'TikTok', href: '#' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener" style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    textDecoration: 'none', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#E54E19'}
                  onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}>
                    {s.label === 'Facebook' ? 'f' : s.label === 'Instagram' ? '📷' : '🎵'}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 20, textAlign: 'center',
            color: 'rgba(255,255,255,0.3)', fontSize: 13,
          }}>
            © 2026 ibishop-dz.com — tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
