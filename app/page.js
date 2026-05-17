import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

function ProductCard({ p, now, weekMs }) {
  const imgs = JSON.parse(p.images || '[]');
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const isNew = now - new Date(p.createdAt).getTime() < weekMs;
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

export default async function Home() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>تسوق الآن</h1>
        <p style={{ color: '#8e8e93', fontSize: 14 }}>الدفع عند الاستلام • التوصيل إلى 58 ولاية</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8e8e93' }}>
          لا توجد منتجات حالياً
        </div>
      ) : (
        <div className="grid">
          {products.map(p => <ProductCard key={p.id} p={p} now={now} weekMs={weekMs} />)}
        </div>
      )}
    </div>
  );
}
