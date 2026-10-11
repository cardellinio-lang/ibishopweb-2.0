import './globals.css';
import prisma, { withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ibishop',
  description: 'وسائل تعليمية و علاجية للأرطوفونيا و صعوبات التعلم — ألعاب خشبية و أدوات للدعم البيداغوجي',
  icons: { icon: '/favicon-ibi.png' },
};

export default async function RootLayout({ children }) {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  let aboutVisible = true;
  let blogVisible = true;
  try {
    const aboutSetting = await withDbRetry(() => prisma.setting.findUnique({ where: { key: 'about_visible' } }));
    aboutVisible = aboutSetting ? aboutSetting.value !== 'false' : true;
    const blogSetting = await withDbRetry(() => prisma.setting.findUnique({ where: { key: 'blog_visible' } }));
    blogVisible = blogSetting ? blogSetting.value !== 'false' : true;
  } catch (e) {
    console.error('[layout] réglages illisibles, valeurs par défaut:', e?.message);
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon-ibi.png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-ibi.png" />
        <link rel="shortcut icon" href="/favicon-ibi.png" />
        {/* Thmanyah Sans auto-hebergee : on precharge les 2 graisses les plus utilisees
            (corps 400 + gras 700) pour eviter le flash de police. Cairo/Montserrat/Tajawal
            ont ete retires : plus aucune page ne les utilise, ils bloquaient l'affichage. */}
        <link rel="preload" href="/fonts/thmanyahsans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/thmanyahsans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {pixelId && (
          <script dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `
          }} />
        )}
      </head>
      <body>
        <div className="wb-grad" style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '7px 16px', letterSpacing: 0.2 }}>
          توصيل إلى جميع الولايات — الدفع عند الاستلام
        </div>
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid var(--wb-border)', boxShadow: '0 2px 14px rgba(72,17,115,0.06)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo-ibi.png" alt="ibishop" style={{ height: 72, width: 'auto', objectFit: 'contain', display: 'block' }} />
            </a>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <a href="/" style={{ fontWeight: 800, fontSize: 16, color: 'var(--wb-text)' }}>المنتجات</a>
              {aboutVisible && <a href="/a-propos" style={{ fontWeight: 700, fontSize: 16, color: 'var(--wb-text)' }}>من نحن</a>}
              {blogVisible && <a href="/blog" style={{ fontWeight: 700, fontSize: 16, color: 'var(--wb-text)' }}>المدونة</a>}
            </nav>
          </div>
        </header>
        <main className="container" style={{ paddingBottom: 60 }}>
          {children}
        </main>
        <footer style={{ textAlign: 'center', padding: 20, color: '#8e8e93', fontSize: 13, borderTop: '1px solid #e8e8ed' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
            <a href="https://www.facebook.com/ibishop.boutique" target="_blank" rel="noopener" style={{ color: '#CB11AB', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#CB11AB"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a href="https://instagram.com/ibishop.dz" target="_blank" rel="noopener" style={{ color: '#CB11AB', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#CB11AB"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
          </div>
          {blogVisible && <div style={{ marginTop: 10 }}><a href="/blog" style={{ color: '#4CAF50', fontWeight: 700, fontSize: 14 }}>المدونة</a></div>}
          ibishop-2026
        </footer>
        <style>{`img{-webkit-user-drag:none;pointer-events:none}`}</style>
        <script dangerouslySetInnerHTML={{ __html: `fetch('/api/pageview',{method:'POST'}).catch(()=>{})` }} />
      </body>
    </html>
  );
}
