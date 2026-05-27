import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '../data';

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return { title: `${post.title} — ibishop`, description: post.excerpt };
}

const icons = {
  'بطاقات-الأسئلة': '🗣️',
  'لعبة-المشاعر': '😊',
  'لوحة-التتبع': '✍️',
  'التانغرام-التعليمي': '🔷',
  'الكراس-السحري': '📖',
  'لعبة-تصنيف-الحيوانات': '🐾',
  'الألغاز-التعليمية': '🧩',
  'صندوق-الكلمات': '🔤',
  'جدول-الضرب-مونتيسوري': '✖️',
  'البواتير-الخشبية': '🎨',
};

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh' }}>
      {/* Header with organic shapes */}
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
          <Link href="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 14,
            marginBottom: 16,
          }}>
            ← العودة إلى المدونة
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.5, maxWidth: 600, margin: '0 auto' }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* Article content */}
      <div className="container" style={{
        marginTop: -40, paddingBottom: 60,
        position: 'relative', zIndex: 2,
      }}>
        <article style={{
          background: '#fff', borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          maxWidth: 720, margin: '0 auto',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginBottom: 32, paddingBottom: 24,
            borderBottom: '2px solid #f0f0f0',
          }}>
            <span style={{ fontSize: 48 }}>{icons[post.slug] || '📖'}</span>
            <div>
              <p style={{ fontSize: 13, color: '#8e8e93', fontWeight: 600 }}>
                {post.excerpt}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {post.sections.map((section, i) => (
              <div key={i}>
                <h2 style={{
                  fontSize: 18, fontWeight: 800, color: i % 2 === 0 ? '#E54E19' : '#4CAF50',
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: '50%',
                    background: i % 2 === 0 ? '#E54E19' : '#4CAF50',
                    color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  {section.title}
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.9, color: '#1d1d1f', paddingRight: 38 }}>
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA card */}
          <div style={{
            marginTop: 40, padding: '24px 20px',
            background: 'linear-gradient(135deg, #faf6f0, #f5f0e8)',
            borderRadius: 20, textAlign: 'center',
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: '#1d1d1f' }}>
              🛍️ تصفح المنتجات المناسبة
            </p>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#E54E19', color: '#fff', padding: '14px 32px',
              borderRadius: 14, fontWeight: 800, fontSize: 15,
              transition: 'background 0.2s',
            }}>
              تسوق الآن
            </Link>
          </div>
        </article>
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
