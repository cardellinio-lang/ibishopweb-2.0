'use client';

import { useState, useMemo, useEffect } from 'react';

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function ProductCard({ p, now }) {
  const imgs = JSON.parse(p.images || '[]');
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const isNew = now - new Date(p.createdAt).getTime() < MONTH_MS;
  const hasTier = p.tierEnabled && p.tierQty && p.tierPrice;
  return (
    <a key={p.id} href={`/products/${p.slug}`} className="wb-card"
       style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
      <div style={{ position: 'relative', aspectRatio: '1', background: '#fff', overflow: 'hidden', borderBottom: '1px solid var(--wb-border)' }}>
        <img src={imgs[0] || 'https://placehold.co/400x400/f6f6f9/868695?text=P'}
             alt={p.name}
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--wb-red)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '4px 10px', borderRadius: 20, boxShadow: '0 4px 12px rgba(245,34,45,.35)' }}>
            -{discount}%
          </span>
        )}
        {isNew && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#ffd700', color: '#1a1a1a', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 20 }}>
            جديد
          </span>
        )}
        {hasTier && (
          <span style={{ position: 'absolute', bottom: 8, left: 8, background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 20 }}>
            كمّية
          </span>
        )}
      </div>
      <div style={{ padding: '12px 12px 16px', display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'right', flex: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, color: 'var(--wb-text)' }}>{p.name}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
          <span className="wb-price" style={{ fontSize: 22 }}>{p.price.toLocaleString()} <span style={{ fontSize: 13 }}>د.ج</span></span>
          {p.oldPrice && <span className="wb-oldprice" style={{ fontSize: 14 }}>{p.oldPrice.toLocaleString()}</span>}
        </div>
        {p.tierEnabled && p.tierQty && p.tierPrice && (
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>أقل سعر {p.tierPrice.toLocaleString()} د.ج عند شراء {p.tierQty}+</span>
        )}
      </div>
    </a>
  );
}

function BannerCarousel({ images }) {
  const slides = useMemo(
    () => [{ type: 'hero' }, ...images.map(src => ({ type: 'image', src }))],
    [images]
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="wb-carousel" style={{ marginTop: 16 }}>
      <div style={{
        display: 'flex', height: '100%', direction: 'ltr',
        transition: 'transform .65s cubic-bezier(.4,0,.2,1)',
        transform: `translateX(${-idx * 100}%)`,
      }}>
        {slides.map((s, i) => (
          <div key={i} style={{ minWidth: '100%', height: '100%', position: 'relative' }}>
            {s.type === 'hero' ? (
              <div dir="rtl" className="wb-grad-diag" style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: 24,
              }}>
                <div style={{ fontSize: 'clamp(22px, 3.6vw, 42px)', fontWeight: 900, lineHeight: 1.25 }}>إيبي شوب 🛍️ تسوّق أونلاين</div>
                <div style={{ fontSize: 'clamp(13px, 1.7vw, 20px)', fontWeight: 600, opacity: 0.92 }}>توصيل إلى جميع الولايات — الدفع عند الاستلام</div>
              </div>
            ) : (
              <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 2 }}>
          {slides.map((_, i) => (
            <button key={i} type="button" className="wb-carousel-dot" data-on={idx === i ? '1' : '0'}
                    onClick={() => setIdx(i)} aria-label={`banner ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeClient({ products, banners = [] }) {
  const now = useMemo(() => Date.now(), []);
  const [showAll, setShowAll] = useState(false);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const filtered = query
    ? products.filter(p => (p.name || '').toLowerCase().includes(query))
    : products;

  return (
    <div>
      {/* Bannières animées (style Wildberries) */}
      <BannerCarousel images={banners} />

      {/* Recherche (style Wildberries) */}
      <div className="wb-search" style={{ marginTop: 16 }}>
        <button className="wb-search-btn" type="button" aria-label="بحث">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
          </svg>
        </button>
        <input value={q} onChange={e => { setQ(e.target.value); setShowAll(false); }}
               placeholder="ابحث عن منتج..."
               style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 16px', height: 50, fontSize: 16, fontFamily: 'inherit' }} />
      </div>

      {/* Products Section */}
      <div style={{ marginBottom: 36, marginTop: 24 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--wb-muted)' }}>لا توجد منتجات مطابقة</div>
        ) : (
          <div className="grid">
            {(showAll ? filtered : filtered.slice(0, 8)).map(p => <ProductCard key={p.id} p={p} now={now} />)}
          </div>
        )}

        {filtered.length > 8 && !showAll && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => setShowAll(true)} className="btn btn-primary">عرض الكل ({filtered.length})</button>
          </div>
        )}
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36, textAlign: 'center' }}>
        <div style={{ background: 'var(--wb-card)', borderRadius: 20, padding: '20px 12px', boxShadow: '0 8px 26px rgba(72,17,115,.08)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--wb-magenta)' }}>{products.length}+</div>
          <div style={{ fontSize: 13, color: 'var(--wb-muted)', fontWeight: 600, marginTop: 4 }}>منتج</div>
        </div>
        <div style={{ background: 'var(--wb-card)', borderRadius: 20, padding: '20px 12px', boxShadow: '0 8px 26px rgba(72,17,115,.08)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--wb-purple)' }}>58</div>
          <div style={{ fontSize: 13, color: 'var(--wb-muted)', fontWeight: 600, marginTop: 4 }}>ولاية توصيل</div>
        </div>
        <div style={{ background: 'var(--wb-card)', borderRadius: 20, padding: '20px 12px', boxShadow: '0 8px 26px rgba(72,17,115,.08)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--wb-magenta)' }}>10</div>
          <div style={{ fontSize: 13, color: 'var(--wb-muted)', fontWeight: 600, marginTop: 4 }}>مقال تعليمي</div>
        </div>
      </div>
    </div>
  );
}
