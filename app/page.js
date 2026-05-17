import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>تسوق الآن</h1>
        <p style={{ color: '#8e8e93', marginTop: 4, fontSize: 15 }}>الدفع عند الاستلام • التوصيل إلى 58 ولاية</p>
      </div>

      <div className="grid">
        {products.map(p => {
          const imgs = JSON.parse(p.images || '[]');
          const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
          return (
            <a key={p.id} href={`/products/${p.slug}`}
               style={{ display: 'block', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ aspectRatio: '1', background: '#f5f5f7', overflow: 'hidden' }}>
                <img src={imgs[0] || 'https://placehold.co/400x400/f5f5f7/8e8e93?text=N'} alt={p.name}
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 12 }}>
                {discount > 0 && <span style={{ display: 'inline-block', background: '#000', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, marginBottom: 4 }}>-{discount}%</span>}
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, lineHeight: 1.3 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#000' }}>{p.price.toLocaleString()} د.ج</span>
                  {p.oldPrice && <span style={{ fontSize: 12, color: '#8e8e93', textDecoration: 'line-through' }}>{p.oldPrice.toLocaleString()} د.ج</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
