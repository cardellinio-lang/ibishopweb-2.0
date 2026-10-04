export const metadata = { title: 'تأكيد الطلب - ibishop' };

export default function StandaloneLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/logo-final.png" sizes="48x48" />
        <link rel="preload" href="/fonts/thmanyahsans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/thmanyahsans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
