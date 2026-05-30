'use client';

import { useState, useMemo } from 'react';

const TAGS = {
  'word-box': ['خشبية', 'عربية'],
  'plateau-lettres': ['خشبية', 'عربية'],
  'lettres-arabes': ['خشبية', 'عربية'],
  'echecs-bois-xo': ['خشبية'],
  'jeu-emotions-bois': ['خشبية'],
  'tracing-board': ['خشبية', '3-5'],
  'planche-developpement-cerebral-neuro': ['خشبية'],
  'tangram-mosaique-bois-120-pieces': ['خشبية'],
  '20-pochoirs-en-bois-montessori-pour-dessin-1779287853247': ['خشبية', '3-5'],
  'scenarios-anglais': ['إنجليزية'],
  'cartes-anglais-100': ['إنجليزية'],
  'jeu-apprendre-anglais-10-jeux-cartes': ['إنجليزية'],
  'puzzles-educatifs': ['ألغاز'],
  'jeu-differences-32': ['ألغاز', '3-5'],
  'jeu-tri-animaux': ['ألغاز', '3-5'],
  'quisuisje': ['ألغاز'],
  'spelling-cubes': ['ألغاز', 'إنجليزية'],
  'jeu-multiplication-montessori-tableau': ['ألغاز'],
  'cartes-questions-wh': ['ألغاز'],
  'flashcards-questions': ['ألغاز', '3-5'],
  'cadre-magnetique-a4': [],
  'cadre-dessin-enfant-a4': [],
  'cahier-magique': ['3-5'],
  'cadre': [],
  'wiklo': [],
  'tableau-pliable-reglable-hauteur-oxybul': [],
  'coffret-perles-fleuries-oxybul': [],
};

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'خشبية', label: 'خشبية' },
  { key: 'إنجليزية', label: 'إنجليزية' },
  { key: 'عربية', label: 'عربية' },
  { key: 'ألغاز', label: 'ألغاز' },
  { key: '3-5', label: '3-5 سنوات' },
];

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function ProductCard({ p, now }) {
  const imgs = JSON.parse(p.images || '[]');
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const isNew = now - new Date(p.createdAt).getTime() < MONTH_MS;
  const c = p.color || '#000000';
  const hasTier = p.tierEnabled && p.tierQty && p.tierPrice;
  return (
    <a key={p.id} href={`/products/${p.slug}`}
       style={{
         display: 'flex', flexDirection: 'column', background: '#fff',
         borderRadius: 16, overflow: 'hidden', textDecoration: 'none',
         boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
         transition: 'transform 0.2s, box-shadow 0.2s',
       }}>
      <div style={{ position: 'relative', aspectRatio: '1', background: '#f5f5f7', overflow: 'hidden' }}>
        <img src={imgs[0] || 'https://placehold.co/400x400/f5f5f7/8e8e93?text=P'}
             alt={p.name}
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {discount > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: c, color: '#fff', fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 20 }}>
            -{discount}%
          </span>
        )}
        {isNew && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#ffd700', color: '#1d1d1f', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 20 }}>
            جديد
          </span>
        )}
        {hasTier && (
          <span style={{ position: 'absolute', bottom: 8, left: 8, background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 20 }}>
            كمّية
          </span>
        )}
      </div>
      <div style={{ padding: '12px 12px 16px', display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.4, color: '#1d1d1f' }}>{p.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: c }}>
            {p.price.toLocaleString()} <span style={{ fontSize: 13 }}>د.ج</span>
          </span>
          {p.oldPrice && (
            <span style={{ fontSize: 14, color: '#8e8e93', textDecoration: 'line-through' }}>{p.oldPrice.toLocaleString()}</span>
          )}
        </div>
        {hasTier && (
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>أقل سعر {p.tierPrice.toLocaleString()} د.ج عند شراء {p.tierQty}+</span>
        )}
      </div>
    </a>
  );
}

export default function HomeClient({ products }) {
  const [active, setActive] = useState('all');
  const now = useMemo(() => Date.now(), []);
  const [showAll, setShowAll] = useState(false);

  const filtered = active === 'all'
    ? products
    : products.filter(p => (TAGS[p.slug] || []).includes(active));

  return (
    <div>
      {/* Products Section */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20, marginTop: 32 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setActive(f.key); setShowAll(false); }}
                    style={{
                      padding: '8px 18px', borderRadius: 20, fontSize: 14, fontWeight: 800,
                      border: 'none', cursor: 'pointer', transition: 'all .15s',
                      background: active === f.key ? '#E54E19' : '#e8e8ed',
                      color: active === f.key ? '#fff' : '#1d1d1f',
                    }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#8e8e93' }}>
            لا توجد منتجات في هذا القسم
          </div>
        ) : (
          <div className="grid">
            {(showAll ? filtered : filtered.slice(0, 8)).map(p => <ProductCard key={p.id} p={p} now={now} />)}
          </div>
        )}

        {filtered.length > 8 && !showAll && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => setShowAll(true)}
              style={{
                background: 'transparent', border: '2px solid #E54E19', color: '#E54E19',
                padding: '10px 28px', borderRadius: 12, fontWeight: 800, fontSize: 15,
                cursor: 'pointer',
              }}>
              عرض الكل ({filtered.length})
            </button>
          </div>
        )}
      </div>

      {/* Stats Strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        marginBottom: 36, textAlign: 'center',
      }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#E54E19' }}>{products.length}+</div>
          <div style={{ fontSize: 13, color: '#6e6e73', fontWeight: 600, marginTop: 4 }}>منتج و لعبة</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#4CAF50' }}>69</div>
          <div style={{ fontSize: 13, color: '#6e6e73', fontWeight: 600, marginTop: 4 }}>ولاية توصيل</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#E54E19' }}>10</div>
          <div style={{ fontSize: 13, color: '#6e6e73', fontWeight: 600, marginTop: 4 }}>مقال تعليمي</div>
        </div>
      </div>
    </div>
  );
}
