import prisma from '@/lib/db';

export default async function ConfirmOrder({ params }) {
  const { token } = params;

  let order = null;
  let error = false;

  try {
    order = await prisma.order.findUnique({ where: { token } });
    if (order) {
      if (order.confirmed !== 'yes') {
        await prisma.order.update({
          where: { id: order.id },
          data: { confirmed: 'yes', status: 'confirmed' },
        });
      }
    } else {
      error = true;
    }
  } catch {
    error = true;
  }

  const s = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
      fontFamily: "'Tajawal', sans-serif", padding: 20,
    },
    card: {
      background: '#fff', borderRadius: 28, padding: '48px 36px',
      maxWidth: 420, width: '100%', textAlign: 'center',
      boxShadow: '0 20px 80px rgba(22,163,74,0.15)',
    },
    check: {
      width: 100, height: 100, borderRadius: '50%',
      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 8px 32px rgba(22,163,74,0.3)',
    },
    title: { fontSize: 28, fontWeight: 900, marginBottom: 8, color: '#166534' },
    text: { fontSize: 16, color: '#4a4a50', lineHeight: 1.8, margin: '0 0 8px' },
    detail: { fontSize: 14, color: '#6e6e73', margin: '4px 0' },
    btn: {
      display: 'inline-block', marginTop: 28, padding: '16px 48px',
      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
      color: '#fff', borderRadius: 16, textDecoration: 'none',
      fontWeight: 800, fontSize: 18,
      boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
      transition: 'all 0.2s',
    },
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet" />
        <title>تأكيد الطلب - ibishop</title>
        <meta property="og:title" content="✅ تأكيد طلبك - ibishop" />
        <meta property="og:description" content="اضغط لتأكيد طلبك بكل أمان. تأكيد فوري بدون انتظار." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://ibishopweb-2-0.vercel.app/logo-final.png" />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body style={{ margin: 0 }}>
        <div style={s.page}>
          <div style={s.card}>
            {error ? (
              <>
                <div style={{ ...s.check, background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                  <span style={{ fontSize: 50 }}>⚠️</span>
                </div>
                <h1 style={{ ...s.title, color: '#991b1b' }}>الطلب غير موجود</h1>
                <p style={s.text}>عذراً، لم نتمكن من العثور على هذا الطلب. الرابط غير صالح.</p>
              </>
            ) : (
              <>
                <div style={s.check}>
                  <span style={{ fontSize: 50 }}>✅</span>
                </div>
                <h1 style={s.title}>تم تأكيد طلبك بنجاح!</h1>
                <p style={s.text}>شكراً لك {order.customer}!</p>
                <p style={s.detail}>رقم الطلب: {order.number}</p>
                <p style={s.detail}>المبلغ: {order.total?.toLocaleString()} د.ج</p>
                <p style={{ ...s.text, marginTop: 12, fontSize: 15 }}>
                  سنقوم بتجهيز طلبك وتوصيله في أقرب وقت.
                </p>
                <a href="/" style={s.btn}>
                  🛒 العودة للمتجر
                </a>
              </>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
