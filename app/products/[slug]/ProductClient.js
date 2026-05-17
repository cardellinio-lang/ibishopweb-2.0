'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function ProductClient({ product, wilayas }) {
  const c = product.color || '#000000';
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [communes, setCommunes] = useState([]);
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState('home');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const formRef = useRef(null);

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
  const subtotal = product.price * qty;
  const total = subtotal + delivery;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const imgs = Array.isArray(product.images) ? product.images : [];

  const handleWilayaChange = async (id) => {
    setWilayaId(id);
    setCommuneId('');
    if (id) {
      const res = await fetch(`/api/wilayas/${id}/communes`);
      setCommunes(await res.json());
    } else setCommunes([]);
  };

  const submitOrder = async () => {
    if (!customer || !phone || !wilayaId || !communeId) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id, qty, customer, phone,
          wilayaId: Number(wilayaId), communeId: Number(communeId),
          address, deliveryType,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'خطأ'); }

      if (typeof window !== 'undefined' && window.fbq && PIXEL_ID) {
        window.fbq('track', 'Purchase', {
          value: total / 100, currency: 'DZD',
          content_name: product.name, content_ids: [product.id],
        });
      }

      setDone(true);
    } catch (e) {
      setError(e.message || 'حدث خطأ أثناء الطلب');
    }
    setLoading(false);
  };

  if (done) {
    return <Confirmation />;
  }

  return (
    <div>
      {/* COD Banner */}
      <div style={{ background: c, color: '#fff', borderRadius: 0, padding: '14px 20px', textAlign: 'center', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
        <img src="/moto-icon.jpg" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        الدفع عند الاستلام
      </div>

      <div className="lg-flex-row" style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        {/* Left column - Image */}
        <div style={{ flex: '1 1 50%', minWidth: 0, width: '100%' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#f5f5f7', aspectRatio: '1' }}>
              <img src={imgs[imgIdx] || 'https://placehold.co/600x600/f5f5f7/8e8e93?text=N'} alt={product.name}
                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          {imgs.length > 1 && (
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollBehavior: 'smooth' }}>
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                          style={{ minWidth: 80, width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: i === imgIdx ? '2px solid ' + c : '2px solid #e8e8ed', padding: 0, background: '#f5f5f7', cursor: 'pointer', flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Right column - Product info + Form */}
        <div style={{ flex: '1 1 50%', minWidth: 0, width: '100%' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e5ea', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ height: 4, background: '#e5e5ea' }} />
            <div style={{ textAlign: 'center', padding: '16px 20px 0' }}>
              <img src="/logo-ibikids.png" alt="ibikids" style={{ height: 28, display: 'block', margin: '0 auto 12px' }} />
            {/* Product title & price */}
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, lineHeight: 1.3, color: '#1d1d1f' }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                {product.oldPrice && <span style={{ fontSize: 16, color: '#8e8e93', textDecoration: 'line-through' }}>{product.oldPrice.toLocaleString()} د.ج</span>}
                <span style={{ fontSize: 28, fontWeight: 800, color: c }}>{product.price.toLocaleString()} <span style={{ fontSize: 16 }}>د.ج</span></span>
              </div>
              {discount > 0 && <span style={{ display: 'inline-block', background: c, color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 800, marginTop: 8 }}>خصم {discount}%</span>}
              {product.description && <p style={{ color: '#6e6e73', marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>{product.description}</p>}
            </div>

            <form ref={formRef} onSubmit={e => { e.preventDefault(); submitOrder(); }} style={{ padding: '0 20px 20px' }}>
              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>الاسم الكامل</label>
                <input value={customer} onChange={e => setCustomer(e.target.value)}
                       placeholder="يرجى إدخال الاسم واللقب"
                       style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: 12, fontSize: 16, background: '#fff' }}
                       onFocus={e => e.target.style.borderColor = '#000'}
                       onBlur={e => e.target.style.borderColor = '#d2d2d7'} />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                       placeholder="05XX XX XX XX" dir="ltr"
                       style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: 12, fontSize: 16, textAlign: 'right', background: '#fff' }}
                       onFocus={e => e.target.style.borderColor = '#000'}
                       onBlur={e => e.target.style.borderColor = '#d2d2d7'} />
                <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 4 }}>سنقوم بالاتصال بك عبر هذا الرقم لتأكيد الطلب.</div>
              </div>

              {/* Wilaya */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>الولاية</label>
                <select value={wilayaId} onChange={e => handleWilayaChange(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: 12, fontSize: 16, background: '#fff', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236e6e73\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 14px center', paddingLeft: 40 }}>
                  <option value="">اختر الولاية</option>
                  {wilayas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              {/* Commune */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>البلدية</label>
                <select value={communeId} onChange={e => setCommuneId(e.target.value)} disabled={!wilayaId}
                        style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: 12, fontSize: 16, background: '#fff', opacity: wilayaId ? 1 : 0.5, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236e6e73\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 14px center', paddingLeft: 40 }}>
                  <option value="">اختر البلدية</option>
                  {communes.map((c, i) => <option key={c.id || i} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Quantity cards */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>الكمية</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3].map(n => {
                    const itemTotal = product.price * n;
                    const selected = qty === n;
                    return (
                      <button key={n} type="button" onClick={() => setQty(n)}
                              style={{ flex: 1, padding: '10px 8px', borderRadius: 14, border: selected ? '2px solid ' + c : '2px solid #e8e8ed', background: selected ? '#f5f5f5' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{n}</div>
                        <div style={{ background: selected ? c : '#f5f5f7', color: selected ? '#fff' : '#1d1d1f', padding: '4px 8px', borderRadius: 20, fontWeight: 800, fontSize: 12, display: 'inline-block' }}>
                          {itemTotal.toLocaleString()} د.ج
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery type */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>نوع التوصيل</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setDeliveryType('home')}
                          style={{ flex: 1, padding: '14px 8px', borderRadius: 14, border: deliveryType === 'home' ? '2px solid ' + c : '2px solid #e8e8ed', background: deliveryType === 'home' ? c : '#fff', color: deliveryType === 'home' ? '#fff' : '#1d1d1f', cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }}>
                    <img src="/home-icon.jpg" alt="" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
                    <span style={{ fontSize: 13, fontWeight: 800 }}>التوصيل إلى المنزل</span>
                  </button>
                  <button type="button" onClick={() => setDeliveryType('office')}
                          style={{ flex: 1, padding: '14px 8px', borderRadius: 14, border: deliveryType === 'office' ? '2px solid ' + c : '2px solid #e8e8ed', background: deliveryType === 'office' ? c : '#fff', color: deliveryType === 'office' ? '#fff' : '#1d1d1f', cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }}>
                    <img src="/office-icon.jpg" alt="" style={{ width: 26, height: 26, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
                    <span style={{ fontSize: 13, fontWeight: 800 }}>التوصيل إلى المكتب</span>
                  </button>
                </div>
              </div>

              
              {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 12, fontSize: 14, marginBottom: 16 }}>{error}</div>}

              {/* Submit button */}
              <button type="submit" disabled={loading}
                      style={{ width: '100%', padding: '16px 24px', background: loading ? '#666' : c, color: '#fff', fontSize: 20, fontWeight: 900, borderRadius: 14, border: 'none', cursor: loading ? 'default' : 'pointer', transition: 'background .2s' }}>
                {loading ? 'جاري التحميل...' : 'اطلب الآن'}
              </button>

              {/* Order Summary */}
              <div style={{ marginTop: 20, background: '#f8f9fa', borderRadius: 14, padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 4, color: '#1d1d1f' }}>ملخص الطلبية</h3>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #d2d2d7' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>سعر المنتج</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#6e6e73' }}>{product.price.toLocaleString()} د.ج</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #d2d2d7' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>الكمية</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#6e6e73' }}>{qty}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #d2d2d7' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{deliveryType === 'home' ? 'سعر التوصيل للمنزل' : 'سعر التوصيل للمكتب'}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#6e6e73' }}>{delivery > 0 ? `${delivery.toLocaleString()} د.ج` : 'اختر الولاية'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#1d1d1f' }}>السعر الإجمالي</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#ffd700' }}>{delivery > 0 ? `${total.toLocaleString()} د.ج` : `${subtotal.toLocaleString()} د.ج`}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

      {/* Landing page gallery - product images */}
      {imgs.length > 0 && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {imgs.map((img, i) => (
              <div key={i} style={{ borderBottom: i < imgs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <img src={img} alt={`${product.name} ${i + 1}`}
                     style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom button */}
      {scrolled && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #e8e8ed', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <button onClick={() => formRef.current?.querySelector('button[type="submit"]')?.click()}
                  style={{ width: '100%', padding: '16px 24px', background: c, color: '#fff', fontSize: 20, fontWeight: 900, borderRadius: 14, border: 'none', cursor: 'pointer' }}>
            اطلب الآن
          </button>
        </div>
      )}
    </div>
  );
}

function Confirmation() {
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playChaChing = async () => {
      await audioCtx.resume();
      const now = audioCtx.currentTime;

      [523.25, 659.25].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.6);
      });

      [1200, 1400].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + 0.3 + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + 0.3 + i * 0.08);
        osc.stop(now + 0.3 + i * 0.08 + 0.3);
      });
    };
    playChaChing().catch(() => {});

    const t = setTimeout(() => setShowMsg(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #14532d 0%, #166534 50%, #15803d 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(calc(100vh)) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .gold-confetti { position: absolute; animation: confettiFall 3s linear forwards; }
      `}} />

      {[...Array(30)].map((_, i) => (
        <div key={i} className="gold-confetti" style={{
          background: ['#ffd700','#fbbf24','#f59e0b','#fff'][i % 4],
          left: `${Math.random() * 100}%`,
          top: `${-10 - Math.random() * 20}px`,
          animationDelay: `${Math.random() * 2}s`,
          width: `${4 + Math.random() * 8}px`,
          height: `${4 + Math.random() * 8}px`,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          opacity: 0.8 + Math.random() * 0.2,
        }} />
      ))}

      {showMsg && (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease-out' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#ffd700', marginBottom: 12, textShadow: '0 2px 12px rgba(255,215,0,0.3)' }}>
            شكراً لطلبك!
          </h1>
          <p style={{ color: '#fef3c7', fontSize: 18, fontWeight: 700, lineHeight: 1.8, maxWidth: 340 }}>
            سنقوم بالاتصال بك قريباً لتأكيد الطلبية
          </p>
          <div style={{ marginTop: 28 }}>
            <a href="/"
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                       background: '#ffd700', color: '#14532d', padding: '18px 48px',
                       borderRadius: 14, fontWeight: 900, fontSize: 18,
                       animation: 'pulse 2s ease-in-out infinite',
                       textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,215,0,0.4)' }}>
              العودة إلى المتجر
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
