import './globals.css';
import prisma from '@/lib/db';

export const metadata = {
  title: 'ibishop',
  description: 'وسائل تعليمية و علاجية للأرطوفونيا و صعوبات التعلم — ألعاب خشبية و أدوات للدعم البيداغوجي',
  icons: { icon: '/logo-final.png' },
};

export default async function RootLayout({ children }) {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const setting = await prisma.setting.findUnique({ where: { key: 'about_visible' } });
  const aboutVisible = setting ? setting.value !== 'false' : true;

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/logo-final.png" sizes="48x48" />
        <link rel="shortcut icon" href="/logo-final.png" sizes="48x48" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
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
        <div style={{ background: '#E54E19', color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '6px 16px' }}>
          🚚 توصيل إلى 58 ولاية • 💳 الدفع عند الاستلام
        </div>
        <div style={{ background: '#f5f5f7', padding: '10px 16px 0', position: 'relative' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a href="/" style={{ fontWeight: 800, fontSize: 20, color: '#1d1d1f' }}>المنتجات</a>
              <a href="/blog" style={{ fontWeight: 700, fontSize: 16, color: '#4CAF50' }}>المدونة</a>
              {aboutVisible && <a href="/a-propos" style={{ fontWeight: 700, fontSize: 16, color: '#E54E19' }}>من نحن</a>}
            </div>
            <a href="/"><img src="/logo-final.png" alt="ibishop" style={{ height: 90 }} /></a>
          </div>
          <svg viewBox="0 0 1200 20" style={{ width: '100%', height: 20, display: 'block', marginTop: 8, marginBottom: 12 }} preserveAspectRatio="none">
            <path d="M0,10 Q15,2 30,10 T60,10 T90,10 T120,10 T150,10 T180,10 T210,10 T240,10 T270,10 T300,10 T330,10 T360,10 T390,10 T420,10 T450,10 T480,10 T510,10 T540,10 T570,10 T600,10 T630,10 T660,10 T690,10 T720,10 T750,10 T780,10 T810,10 T840,10 T870,10 T900,10 T930,10 T960,10 T990,10 T1020,10 T1050,10 T1080,10 T1110,10 T1140,10 T1170,10 T1200,10" fill="none" stroke="#E54E19" strokeWidth="3" strokeLinecap="round" opacity="0.4" strokeDasharray="8 8" />
            <path d="M0,14 Q15,6 30,14 T60,14 T90,14 T120,14 T150,14 T180,14 T210,14 T240,14 T270,14 T300,14 T330,14 T360,14 T390,14 T420,14 T450,14 T480,14 T510,14 T540,14 T570,14 T600,14 T630,14 T660,14 T690,14 T720,14 T750,14 T780,14 T810,14 T840,14 T870,14 T900,14 T930,14 T960,14 T990,14 T1020,14 T1050,14 T1080,14 T1110,14 T1140,14 T1170,14 T1200,14" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" opacity="0.4" strokeDasharray="6 10" />
          </svg>
        </div>
        <main className="container" style={{ paddingBottom: 60 }}>
          {children}
        </main>
        <footer style={{ textAlign: 'center', padding: 20, color: '#8e8e93', fontSize: 13, borderTop: '1px solid #e8e8ed' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
            <a href="https://www.facebook.com/ibishop.boutique" target="_blank" rel="noopener" style={{ color: '#E54E19', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#E54E19"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a href="https://instagram.com/ibishop.dz" target="_blank" rel="noopener" style={{ color: '#E54E19', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#E54E19"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
          </div>
          ibishop-2026
        </footer>
        <style>{`*{-webkit-user-select:none;user-select:none}img{-webkit-user-drag:none;pointer-events:none}`}</style>
        <script dangerouslySetInnerHTML={{ __html: `fetch('/api/pageview',{method:'POST'}).catch(()=>{})` }} />
      </body>
    </html>
  );
}
