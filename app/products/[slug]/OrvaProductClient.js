'use client';

import { useState, useEffect, useRef } from 'react';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

const WILAYA_AR = {
  1:'أدرار',2:'الشلف',3:'الأغواط',4:'أم البواقي',5:'باتنة',6:'بجاية',7:'بسكرة',8:'بشار',
  9:'البليدة',10:'البويرة',11:'تمنراست',12:'تبسة',13:'تلمسان',14:'تيارت',15:'تيزي وزو',
  16:'الجزائر',17:'الجلفة',18:'جيجل',19:'سطيف',20:'سعيدة',21:'سكيكدة',22:'سيدي بلعباس',
  23:'عنابة',24:'قالمة',25:'قسنطينة',26:'المدية',27:'مستغانم',28:'المسيلة',29:'معسكر',
  30:'ورقلة',31:'وهران',32:'البيض',33:'إيليزي',34:'برج بوعريريج',35:'بومرداس',
  36:'الطارف',37:'تندوف',38:'تسمسيلت',39:'الوادي',40:'خنشلة',41:'سوق أهراس',
  42:'تيبازة',43:'ميلة',44:'عين الدفلى',45:'النعامة',46:'عين تموشنت',47:'غرداية',
  48:'غليزان',49:'تيميمون',50:'برج باجي مختار',51:'أولاد جلال',52:'بني عباس',
  53:'عين صالح',54:'عين قزام',55:'تقرت',56:'جانت',57:'المغير',58:'المنيعة',
};

const COLORS = {
  primary: '#0066CC',
  primaryHover: '#000000',
  text: '#000000',
  bodyText: '#000000',
  border: '#F5D6D7',
  goldBg: 'rgba(245,214,215,0.3)',
  secondary: '#800004',
  white: '#fff',
  shadow: 'rgba(0,0,0,0.1)',
  muted: 'rgba(0,0,0,0.6)',
};

export default function OrvaProductClient({ product, wilayas, communes }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [deliveryType, setDeliveryType] = useState('home');
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(COLORS);
  const ib = {
    width: '100%', padding: '14px 16px',
    border: `1px solid ${theme.secondary}`,
    borderRadius: 8, fontSize: 14, fontFamily: 'Cairo',
    color: theme.text, background: theme.white,
    lineHeight: '18px', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const t = { ...COLORS };
        if (data.orva_primary) t.primary = data.orva_primary;
        if (data.orva_primary_hover) t.primaryHover = data.orva_primary_hover;
        if (data.orva_gold_bg) t.goldBg = data.orva_gold_bg;
        if (data.orva_text) t.text = data.orva_text;
        if (data.orva_border) t.border = data.orva_border;
        if (data.orva_secondary) t.secondary = data.orva_secondary;
        setTheme(t);
      })
      .catch(() => {});
  }, []);

  const formRef = useRef(null);
  const submittedRef = useRef(false);

  const imgs = Array.isArray(product.images) ? product.images : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq && PIXEL_ID) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name, content_ids: [product.id],
        content_type: 'product', value: product.price / 100, currency: 'DZD',
      });
    }
  }, []);

  const selectedWilaya = wilayas.find(w => w.id === Number(wilayaId));
  const delivery = selectedWilaya ? (deliveryType === 'office' ? selectedWilaya.priceOffice : selectedWilaya.price) : 0;
  const total = product.price * qty + delivery;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  const filteredCommunes = wilayaId ? communes.filter(c => c.wilayaId === Number(wilayaId)) : [];

  useEffect(() => {
    if (phone.replace(/\s/g, '').length >= 10) {
      fetch('/api/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ''), productId: product.id }),
      })
        .then(r => r.json())
        .then(data => setBlocked(data.blocked))
        .catch(() => {});
    } else {
      setBlocked(false);
    }
  }, [phone, product.id]);

  const submitOrder = async () => {
    if (submittedRef.current) return;
    if (!customer || !phone || !wilayaId || !communeId || qty < 1) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    submittedRef.current = true;
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id, qty, customer, phone,
          wilayaId: Number(wilayaId), communeId: Number(communeId),
          address: '', deliveryType, pageUrl: window.location.href,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'خطأ'); }
      const orderData = await res.json();
      if (typeof window !== 'undefined' && window.fbq && PIXEL_ID) {
        window.fbq('track', 'Purchase', {
          value: total / 100, currency: 'DZD',
          content_name: product.name, content_ids: [product.id],
        }, { eventID: orderData.capiEventId });
      }
      window.location.href = `/merci?order=${orderData.number}&name=${encodeURIComponent(product.name)}&qty=${qty}&total=${total}&pid=${product.id}&capiEventId=${orderData.capiEventId}`;
    } catch (e) {
      setError(e.message || 'حدث خطأ أثناء الطلب');
      submittedRef.current = false;
    }
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orvaPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(128,0,4,0.2); }
          50% { transform: scale(1.03); box-shadow: 0 6px 24px rgba(128,0,4,0.35); }
        }
        @keyframes orvaFadeInUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .orva-input:focus {
          border-color: ${theme.primary} !important;
          box-shadow: 0px 0px 0px 2px rgba(0,102,204,0.15) !important;
          outline: none;
        }
        .orva-btn {
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .orva-btn:hover {
          background-color: ${theme.primaryHover} !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          transform: translateY(-1px);
        }
        .orva-pulse {
          animation: orvaPulse 2s ease-in-out infinite;
        }
      `}} />

      {/* Hero image section */}
      <div style={{
        maxWidth: 1140, margin: '0 auto', padding: '40px 24px',
        background: theme.white,
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div className="lg-flex-row" style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
            {/* Left - Product image */}
            <div style={{ flex: '1 1 50%', minWidth: 0, width: '100%' }}>
              <div style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 14, overflow: 'hidden',
                boxShadow: `0px 2px 14px 0px ${theme.shadow}`,
                background: theme.white,
              }}>
                <img src={imgs[imgIdx] || 'https://placehold.co/600x600/f5f5f7/8e8e93?text=N'}
                     alt={product.name} fetchpriority="high"
                     style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
              {imgs.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                  {imgs.slice(0, 10).map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                            style={{
                              minWidth: 72, width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
                              border: i === imgIdx ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`,
                              padding: 0, background: theme.white, cursor: 'pointer', flexShrink: 0,
                            }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product card */}
            <div style={{ flex: '1 1 50%', minWidth: 0, width: '100%' }}>
              <div style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                background: theme.white,
                boxShadow: `0px 2px 14px 0px ${theme.shadow}`,
                padding: '29px 24px',
              }}>
                {/* Product name */}
                <h1 style={{
                  fontFamily: 'Cairo', fontWeight: 600, fontSize: 32,
                  color: theme.text, textAlign: 'center', lineHeight: '130%',
                  marginBottom: 16,
                }}>{product.name}</h1>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                  {product.oldPrice && (
                    <span style={{
                      fontFamily: 'Cairo', fontWeight: 500, fontSize: 18,
                      textDecoration: 'line-through', color: theme.muted,
                    }}>{product.oldPrice.toLocaleString()} د.ج</span>
                  )}
                  <span style={{
                    fontFamily: 'Rubik', fontWeight: 700, fontSize: 22,
                    color: theme.bodyText,
                  }}>{product.price.toLocaleString()} <span style={{ fontSize: 16 }}>د.ج</span></span>
                </div>

                {discount > 0 && (
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{
                      display: 'inline-block', background: theme.goldBg,
                      color: theme.primary, fontSize: 13, padding: '6px 16px',
                      borderRadius: 100, fontWeight: 700, fontFamily: 'Cairo',
                    }}>🔥 خصم {discount}%</span>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div style={{
                    fontFamily: 'Cairo', fontSize: 15, color: theme.bodyText,
                    lineHeight: 1.7, textAlign: 'center', marginBottom: 20,
                  }} dangerouslySetInnerHTML={{ __html: product.description }} />
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(185,185,185,0.39)', marginBottom: 20 }} />

                {blocked ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <div style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 18, color: '#dc2626', marginBottom: 8 }}>
                      عذراً، هذه الصفحة غير متاحة حالياً
                    </div>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={e => { e.preventDefault(); submitOrder(); }}>
                    {/* Name */}
                    <div style={{ marginBottom: 16 }}>
                      <input value={customer} onChange={e => setCustomer(e.target.value)}
                             placeholder="الاسم الكامل" className="orva-input"
                             style={{ ...ib }} />
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: 16 }}>
                      <input value={phone} onChange={e => setPhone(e.target.value)}
                             placeholder="رقم الهاتف" dir="ltr" className="orva-input"
                             style={{ ...ib, textAlign: 'right' }} />
                    </div>

                    {/* Wilaya */}
                    <div style={{ marginBottom: 16 }}>
                      <select value={wilayaId} onChange={e => { setWilayaId(e.target.value); setCommuneId(''); }}
                              className="orva-input"
                              style={{ ...ib, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23800004\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 14px center' }}>
                        <option value="">اختر الولاية</option>
                        {wilayas.map(w => <option key={w.id} value={w.id}>{WILAYA_AR[w.id] || w.name}</option>)}
                      </select>
                    </div>

                    {/* Commune */}
                    <div style={{ marginBottom: 16 }}>
                      <select value={communeId} onChange={e => setCommuneId(e.target.value)} disabled={!wilayaId}
                              className="orva-input"
                              style={{ ...ib, opacity: wilayaId ? 1 : 0.5, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23800004\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 14px center' }}>
                        <option value="">اختر البلدية</option>
                        {filteredCommunes.map((c, i) => <option key={c.id || i} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '15px 20px', borderRadius: 8,
                      background: 'rgba(245,214,215,0.15)', marginBottom: 20,
                      border: '1px solid rgba(245,214,215,0.4)',
                    }}>
                      <span style={{ fontFamily: 'Cairo', fontWeight: 600, fontSize: 15, color: theme.text }}>الكمية</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}
                                style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: theme.white, fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.secondary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>−</button>
                        <span style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: 20, color: theme.text, minWidth: 30, textAlign: 'center' }}>{qty}</span>
                        <button type="button" onClick={() => setQty(qty + 1)}
                                style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: theme.white, fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.secondary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>+</button>
                      </div>
                    </div>

                    {error && (
                      <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontFamily: 'Cairo', marginBottom: 16 }}>
                        {error}
                      </div>
                    )}

                    {/* CTA Button */}
                    <div style={{ marginTop: 20 }} className="orva-pulse">
                      <button type="submit" className="orva-btn"
                              style={{
                                width: '100%', padding: '18px 24px',
                                background: theme.secondary, color: '#F5D6D7',
                                fontSize: 16, fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                                borderRadius: 37, border: 'none', cursor: 'pointer',
                                letterSpacing: '0.06em',
                              }}>
                        اشتري الآن - الدفع عند الإستلام
                      </button>
                    </div>

                    {/* COD badge */}
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <span style={{ fontFamily: 'Cairo', fontSize: 14, color: theme.muted }}>
                        🚚 الدفع عند الاستلام - التوصيل إلى المنزل أو المكتب
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery images */}
      {imgs.length > 1 && (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {imgs.slice(1).map((img, i) => (
              <div key={i} style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 14, overflow: 'hidden', marginBottom: 16,
                boxShadow: `0px 2px 14px 0px ${theme.shadow}`,
              }}>
                <img src={img} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky footer */}
      {scrolled && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 600,
          padding: '18px 20px', background: theme.white,
          borderTop: `1px solid ${theme.border}`,
          boxShadow: '0px 1px 16px 0px rgba(42,32,24,0.1)',
        }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              borderRadius: 10, padding: 14, background: theme.white,
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={imgs[0] || 'https://placehold.co/48x48/f5f5f7/8e8e93?text=N'}
                     alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: 15, color: theme.text }}>{product.price.toLocaleString()} د.ج</div>
                  <div style={{ fontFamily: 'Cairo', fontWeight: 500, fontSize: 12, color: theme.muted }}>{product.name}</div>
                </div>
              </div>
              <button onClick={() => {
                const allFilled = customer && phone && wilayaId && communeId;
                if (allFilled) submitOrder();
                else formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
                      className="orva-btn"
                      style={{
                        padding: '15px 20px', background: theme.secondary, color: '#F5D6D7',
                        fontSize: 14, fontWeight: 700, fontFamily: 'Cairo, sans-serif',
                        borderRadius: 37, border: 'none', cursor: 'pointer',
                        width: 200, whiteSpace: 'nowrap',
                      }}>
                اشتري الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
