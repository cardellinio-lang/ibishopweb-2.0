import './globals.css';

export const metadata = {
  title: 'ibishop',
  description: 'Achetez vos produits préférés, livraison partout en Algérie',
  icons: { icon: '/favicon.png', shortcut: '/favicon.png' },
};

export default function RootLayout({ children }) {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="ar" dir="rtl">
      <head>
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
        <div style={{ background: '#f5f5f7', color: '#1d1d1f', padding: '14px 16px', textAlign: 'center', fontWeight: 800, fontSize: 17, marginBottom: 16, borderBottom: '1px solid #e8e8ed' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ fontWeight: 800, fontSize: 20 }}>المنتجات</a>
            <a href="/"><img src="/logo-ibikids.png" alt="ibishop" style={{ height: 28 }} /></a>
          </div>
        </div>
        <main className="container" style={{ paddingBottom: 60 }}>
          {children}
        </main>
        <footer style={{ textAlign: 'center', padding: 20, color: '#8e8e93', fontSize: 13, borderTop: '1px solid #e8e8ed' }}>
          ibishop-{new Date().getFullYear()}
        </footer>
        <script dangerouslySetInnerHTML={{ __html: `fetch('/api/pageview',{method:'POST'}).catch(()=>{})` }} />
      </body>
    </html>
  );
}
