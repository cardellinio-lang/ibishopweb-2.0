'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const action = searchParams.get('action');
    const error = searchParams.get('error');

    if (error === 'missing') setStatus('missing');
    else if (error === 'invalid') setStatus('invalid');
    else if (error === 'notfound') setStatus('notfound');
    else if (token && action) setStatus(action === 'yes' ? 'confirmed' : 'cancelled');
    else setStatus('missing');
  }, [searchParams]);

  const s = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f7', fontFamily: "'Tajawal', sans-serif", padding: 20,
    },
    card: {
      background: '#fff', borderRadius: 24, padding: '40px 32px',
      maxWidth: 400, width: '100%', textAlign: 'center',
      boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
    },
    emoji: { fontSize: 64, marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#1d1d1f' },
    text: { fontSize: 15, color: '#6e6e73', lineHeight: 1.6, margin: 0 },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {status === 'loading' && (
          <><div style={s.emoji}>⏳</div><h1 style={s.title}>جاري التحميل...</h1></>
        )}
        {status === 'confirmed' && (
          <><div style={s.emoji}>✅</div><h1 style={s.title}>تم تأكيد طلبك!</h1><p style={s.text}>شكراً لك! تم تأكيد طلبك بنجاح. سنقوم بتجهيزه وتوصيله في أقرب وقت.</p></>
        )}
        {status === 'cancelled' && (
          <><div style={s.emoji}>❌</div><h1 style={s.title}>تم إلغاء الطلب</h1><p style={s.text}>تم إلغاء طلبك. إذا كنت ترغب في طلب آخر، يمكنك زيارتنا في أي وقت.</p></>
        )}
        {status === 'notfound' && (
          <><div style={s.emoji}>🔍</div><h1 style={s.title}>الطلب غير موجود</h1><p style={s.text}>عذراً، لم نتمكن من العثور على هذا الطلب. قد يكون الرابط غير صالح.</p></>
        )}
        {(status === 'missing' || status === 'invalid') && (
          <><div style={s.emoji}>⚠️</div><h1 style={s.title}>رابط غير صالح</h1><p style={s.text}>عذراً، الرابط الذي استخدمته غير صالح. يرجى التحقق من الرابط والمحاولة مرة أخرى.</p></>
        )}
        <a href="/" style={{ display: 'inline-block', marginTop: 24, padding: '12px 28px', background: '#E54E19', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          العودة للمتجر
        </a>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', fontFamily: "'Tajawal', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1d1d1f' }}>جاري التحميل...</h1>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
