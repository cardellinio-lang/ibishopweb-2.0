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
    <div>
      {/* Thin decorative stripe */}
      <div style={{ height: 6, background: 'linear-gradient(90deg, #E54E19 0%, #E85D2C 25%, #4CAF50 50%, #66BB6A 75%, #E54E19 100%)', borderRadius: '0 0 4px 4px', marginBottom: 32 }} />

      <Link href="/blog" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: '#8e8e93', fontWeight: 700, fontSize: 14, marginBottom: 20,
      }}>
        ← العودة إلى المدونة
      </Link>

      <article style={{ maxWidth: 720, margin: '0 auto 60px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 40 }}>{icons[post.slug] || '📖'}</span>
          <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.4, color: '#1d1d1f' }}>
            {post.title}
          </h1>
        </div>

        <p style={{ fontSize: 15, color: '#8e8e93', lineHeight: 1.7, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #eee' }}>
          {post.excerpt}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {post.sections.map((section, i) => (
            <div key={i}>
              <h2 style={{
                fontSize: 17, fontWeight: 800, color: '#1d1d1f',
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#eee', color: '#1d1d1f', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#1d1d1f', paddingRight: 30 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 40, padding: '24px 20px',
          background: '#f8f8f8', borderRadius: 12, textAlign: 'center',
          border: '1px solid #eee',
        }}>
          <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: '#1d1d1f' }}>
            🛍️ تصفح المنتجات المناسبة
          </p>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#E54E19', color: '#fff', padding: '12px 28px',
            borderRadius: 10, fontWeight: 800, fontSize: 14,
          }}>
            تسوق الآن
          </Link>
        </div>
      </article>
    </div>
  );
}
