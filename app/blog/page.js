import Link from 'next/link';
import { getAllPosts } from './data';

export const metadata = {
  title: 'المدونة — ibishop',
  description: 'مقالات تعليمية وعلاجية للأرطوفونيا وصعوبات التعلم. نصائح واستراتيجيات للأهل والأخصائيين.',
};

const icons = ['🗣️', '😊', '✍️', '🔷', '📖', '🐾', '🧩', '🔤', '✖️', '🎨'];

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh' }}>
      {/* Multicolor gradient header with organic shapes */}
      <div style={{
        position: 'relative',
        padding: '60px 20px 100px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #E54E19 0%, #f09733 35%, #4CAF50 65%, #2E7D32 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: '-10%',
          width: '120%', height: 120,
          background: '#f5f5f7',
          borderRadius: '50% 50% 0 0',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: '-5%',
          width: '80%', height: 100,
          background: '#f5f5f7',
          borderRadius: '40% 60% 0 0',
          opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '20%', width: 60, height: 60,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            المدونة
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            مقالات تعليمية وعلاجية لأخصائيي الأرطوفونيا والأهل
          </p>
        </div>
      </div>

      {/* Blog cards grid */}
      <div className="container" style={{ marginTop: -40, paddingBottom: 60, position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {posts.map((post, i) => {
            const isOrange = i % 2 === 0;
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column',
                  background: '#fff', borderRadius: 20,
                  overflow: 'hidden', textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}>
                <div style={{
                  height: 200,
                  background: `linear-gradient(135deg, ${isOrange ? '#E54E19' : '#4CAF50'}, ${isOrange ? '#f09733' : '#2E7D32'})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 56, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -30, left: -30, width: 120, height: 120,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
                  }} />
                  {icons[i]}
                </div>
                <div style={{ padding: '20px 20px 24px' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.5, color: '#1d1d1f', marginBottom: 10 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.7 }}>
                    {post.excerpt}
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginTop: 14, color: '#E54E19', fontWeight: 700, fontSize: 14,
                  }}>
                    اقرأ المزيد ←
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Green footer */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          📚 موارد تعليمية وعلاجية مستمرة
        </p>
        <p style={{ fontSize: 14, opacity: 0.9 }}>
          نضيف مقالات جديدة أسبوعياً لمساعدتك في دعم أطفالك
        </p>
      </div>
    </div>
  );
}
