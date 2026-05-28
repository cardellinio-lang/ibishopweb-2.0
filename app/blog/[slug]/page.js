'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogPost({ params }) {
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = decodeURIComponent(params.slug);
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
        document.title = `${data.title} — ibishop`;
      })
      .catch(async () => {
        try {
          const { getPostBySlug } = await import('../data');
          const p = getPostBySlug(decodeURIComponent(params.slug));
          if (p) {
            setPost(p);
            document.title = `${p.title} — ibishop`;
          } else {
            setNotFound(true);
          }
        } catch {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: '4px solid #f0f0f0', borderTopColor: '#E54E19',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ fontSize: 64, marginBottom: 12 }}>📭</p>
        <p style={{ fontSize: 18, color: '#8e8e93', marginBottom: 20 }}>هذه المقالة غير موجودة</p>
        <Link href="/blog" style={{
          background: '#E54E19', color: '#fff', padding: '12px 28px',
          borderRadius: 50, fontWeight: 700, fontSize: 14,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          ← العودة إلى المدونة
        </Link>
      </div>
    );
  }

  let sections = [];
  try {
    if (typeof post.content === 'string') {
      sections = JSON.parse(post.content);
    } else if (Array.isArray(post.content)) {
      sections = post.content;
    }
  } catch { sections = []; }
  if (!Array.isArray(sections)) sections = [];

  const icon = post.icon || '📖';

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #FDF6EC, #FFE4CC)',
        padding: '40px 24px', position: 'relative',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <filter id="grain-single">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="linear" slope="0.035" /></feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-single)" />
        </svg>
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link href="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#E54E19', fontWeight: 700, fontSize: 14, marginBottom: 20,
            textDecoration: 'none', transition: 'gap 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.gap = '10px'}
          onMouseLeave={e => e.currentTarget.style.gap = '6px'}>
            ← العودة إلى المدونة
          </Link>

          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 40, marginBottom: 16,
            boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
          }}>
            {icon}
          </div>

          {post.category && (
            <div style={{
              display: 'inline-flex', background: '#8BA888', color: '#fff',
              padding: '4px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700,
              marginBottom: 12,
            }}>
              {post.category}
            </div>
          )}

          <h1 style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 900, fontSize: 32,
            color: '#1C1008', lineHeight: 1.2,
            marginBottom: 12,
          }}>
            {post.title}
          </h1>

          <p style={{
            fontSize: 15, color: 'rgba(28,16,8,0.6)',
            lineHeight: 1.7, marginBottom: 16,
          }}>
            {post.excerpt}
          </p>

          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'rgba(28,16,8,0.4)' }}>
            <span>⏱ {post.readingTime || '5 دقائق'}</span>
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ width: '100%', height: 60, display: 'block', marginTop: -2 }}>
        <path d="M0,30 C300,60 600,0 900,30 C1050,45 1200,15 1200,15 L1200,60 L0,60 Z" fill="#fff" />
      </svg>

      <article style={{ maxWidth: 720, margin: '0 auto 60px', padding: '0 24px' }}>
        <div style={{
          background: '#fff', borderRadius: 24, padding: 32,
          boxShadow: '0 8px 32px rgba(28,16,8,0.10)',
          marginTop: -20, position: 'relative', zIndex: 2,
        }}>
          {sections.length === 0 ? (
            <p style={{ fontSize: 15, lineHeight: 1.9, color: '#1C1008' }}>
              {post.excerpt}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: 18, fontWeight: 800, color: '#1C1008',
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#E54E19', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    {section.title}
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.9, color: '#1C1008', paddingRight: 38 }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          marginTop: 24, padding: '28px 24px',
          background: 'linear-gradient(135deg, #E54E19, #FF6B35)',
          borderRadius: 24, textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.04 }}>
            <filter id="grain-cta">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer><feFuncA type="linear" slope="1" /></feComponentTransfer>
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-cta)" />
          </svg>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🛍️</p>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#fff' }}>
              تصفح المنتجات المناسبة
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
              ألعاب تعليمية خشبية — صنع في الجزائر
            </p>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#1C1008', color: '#fff', padding: '12px 28px',
              borderRadius: 50, fontWeight: 800, fontSize: 14,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#E54E19'}
            onMouseLeave={e => e.target.style.background = '#1C1008'}>
              تسوق الآن ←
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
