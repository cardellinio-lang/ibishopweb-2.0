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
    <div>
      {/* Thin decorative stripe */}
      <div style={{ height: 6, background: 'linear-gradient(90deg, #E54E19 0%, #E85D2C 25%, #4CAF50 50%, #66BB6A 75%, #E54E19 100%)', borderRadius: '0 0 4px 4px', marginBottom: 40 }} />

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1d1d1f', marginBottom: 8 }}>المدونة</h1>
        <p style={{ fontSize: 15, color: '#8e8e93', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          مقالات تعليمية وعلاجية لأخصائيي الأرطوفونيا والأهل
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, paddingBottom: 60 }}>
        {posts.map((post, i) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            style={{
              display: 'flex', flexDirection: 'column', background: '#fff',
              borderRadius: 12, overflow: 'hidden', textDecoration: 'none',
              border: '1px solid #eee',
              transition: 'box-shadow 0.2s',
            }}>
            <div style={{
              height: 180, background: '#f8f8f8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, position: 'relative',
            }}>
              <div style={{ height: 4, position: 'absolute', top: 0, left: 0, right: 0, background: i % 2 === 0 ? '#E54E19' : '#4CAF50' }} />
              {icons[i]}
            </div>
            <div style={{ padding: '18px 20px 20px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.5, color: '#1d1d1f', marginBottom: 8 }}>
                {post.title}
              </h2>
              <p style={{ fontSize: 14, color: '#8e8e93', lineHeight: 1.7 }}>
                {post.excerpt}
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 12, color: '#E54E19', fontWeight: 700, fontSize: 13,
              }}>
                اقرأ المزيد ←
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
