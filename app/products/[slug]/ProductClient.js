'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';

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

export default function ProductClient({ product, wilayas, communes}) {
  const c = product.color || '#000000';
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState('home');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const formRef = useRef(null);
  const prevTierRef = useRef(false);
  const audioCtxRef = useRef(null);

  const variants = product.slug === 'cahier-magique' ? [
    { label: 'A5', price: 1700, desc: 'صغير' },
    { label: 'A4', price: 2400, desc: 'كبير' },
  ] : null;
  const [variant, setVariant] = useState(variants ? variants[0].label : null);

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

  const basePrice = variants ? variants.find(v => v.label === variant).price : product.price;
  const tierActive = product.tierEnabled && product.tierQty && product.tierPrice && qty >= product.tierQty;
  const effectivePrice = tierActive ? product.tierPrice : basePrice;
  const selectedWilaya = wilayas.find(w => w.id === Number(wilayaId));
  const delivery = selectedWilaya ? (deliveryType === 'office' ? selectedWilaya.priceOffice : selectedWilaya.price) : 0;
  const subtotal = effectivePrice * qty;
  const total = subtotal + delivery;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const savings = product.tierEnabled && product.tierPrice ? product.price - product.tierPrice : 0;
  const imgs = Array.isArray(product.images) ? product.images : [];

  const filteredCommunes = wilayaId ? communes.filter(c => c.wilayaId === Number(wilayaId)) : [];

  // Celebration overlay — déclenché une fois quand le palier est atteint
  useEffect(() => {
    if (product.tierEnabled && tierActive && !prevTierRef.current) {
      prevTierRef.current = true;
      setCelebration({ savings, tierQty: product.tierQty, tierPrice: product.tierPrice, price: product.price });
      const timer = setTimeout(() => setCelebration(null), 3500);
      return () => clearTimeout(timer);
    } else if (!tierActive) {
      prevTierRef.current = false;
    }
  }, [tierActive, product.tierEnabled, savings, product.tierQty, product.tierPrice, product.price]);

  const handleWilayaChange = (id) => {
    setWilayaId(id);
    setCommuneId('');
  };

  const submitOrder = async () => {
    if (!customer || !phone || !wilayaId || !communeId) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const variantLabel = variant && variant !== (variants?.[0]?.label || '') ? ` (${variant})` : '';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id, qty, customer, phone,
          wilayaId: Number(wilayaId), communeId: Number(communeId),
          address, deliveryType,
          variantName: variantLabel ? `${product.name} ${variantLabel}`.trim() : undefined,
          variantPrice: variants ? basePrice : undefined,
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
    return <Confirmation product={product} qty={qty} total={total} />;
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes giftBounce {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          40% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          60% { transform: scale(0.95) rotate(-3deg); }
          80% { transform: scale(1.05) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes lidOpen {
          0% { transform: translateY(0) rotate(0); }
          100% { transform: translateY(-60px) rotate(-10deg); opacity: 0; }
        }
        @keyframes particleFly {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--px),var(--py)) scale(0); opacity: 0; }
        }
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}} />
      {/* COD Banner */}
        <div style={{ background: c, color: '#fff', borderRadius: 0, padding: '14px 20px', textAlign: 'center', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          🚚 الدفع عند الاستلام
          <img src="/favicon4.png" alt="" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />
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
                {imgs.slice(0, 10).map((img, i) => (
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
          <div style={{ position: 'sticky', top: 80, background: '#fff', border: '1px solid #e5e5ea', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ height: 4, background: '#e5e5ea' }} />
            <div style={{ textAlign: 'center', padding: '16px 20px 0' }}>
              <img src="/logo-ibi2.png" alt="ibishop" style={{ height: 90, display: 'block', margin: '0 auto 12px' }} />
            {/* Product title & price */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, lineHeight: 1.3, color: '#1d1d1f' }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                {product.oldPrice && <span style={{ fontSize: 16, color: '#8e8e93', textDecoration: 'line-through' }}>{product.oldPrice.toLocaleString()} د.ج</span>}
                <span style={{
                  fontSize: 28, fontWeight: 800, color: tierActive ? '#16a34a' : c,
                  transition: 'transform 0.3s, color 0.3s',
                }}>
                  {effectivePrice.toLocaleString()} <span style={{ fontSize: 16 }}>د.ج</span>
                </span>
                {tierActive && product.price !== effectivePrice && (
                  <span style={{ fontSize: 14, color: '#8e8e93', textDecoration: 'line-through' }}>{product.price.toLocaleString()}</span>
                )}
              </div>
              {discount > 0 && !tierActive && <span style={{ display: 'inline-block', background: c, color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 800, marginTop: 8 }}>خصم {discount}%</span>}
              {tierActive && savings > 0 && (
                <span style={{ display: 'inline-block', background: '#16a34a', color: '#fff', fontSize: 13, padding: '6px 16px', borderRadius: 20, fontWeight: 900, marginTop: 8 }}>
                  ✅ توفير {savings.toLocaleString()} د.ج لكل قطعة!
                </span>
              )}
              {product.description && <p style={{ color: '#6e6e73', marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>{product.description}</p>}
            </div>

            <form ref={formRef} data-order-form onSubmit={e => { e.preventDefault(); submitOrder(); }} style={{ padding: '0 20px 20px' }}>
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
                  {wilayas.map(w => <option key={w.id} value={w.id}>{WILAYA_AR[w.id] || w.name} / {w.name}</option>)}
                </select>
              </div>

              {/* Commune */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>البلدية</label>
                <select value={communeId} onChange={e => setCommuneId(e.target.value)} disabled={!wilayaId}
                        style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: 12, fontSize: 16, background: '#fff', opacity: wilayaId ? 1 : 0.5, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236e6e73\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 14px center', paddingLeft: 40 }}>
                  <option value="">اختر البلدية</option>
                  {filteredCommunes.map((c, i) => <option key={c.id || i} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Variant selector */}
              {variants && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>اختيار القياس</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {variants.map(v => (
                      <button key={v.label} type="button" onClick={() => setVariant(v.label)}
                              style={{
                                flex: 1, padding: '12px 16px', borderRadius: 12,
                                border: variant === v.label ? '2px solid ' + c : '1.5px solid #d2d2d7',
                                background: variant === v.label ? c : '#fff',
                                color: variant === v.label ? '#fff' : '#1d1d1f',
                                cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                              }}>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>{v.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, opacity: 0.85 }}>{v.desc}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{v.price.toLocaleString()} د.ج</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity - + */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>الكمية</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}
                          style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid #d2d2d7', background: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}>
                    −
                  </button>
                  <div style={{ fontSize: 22, fontWeight: 900, minWidth: 40, textAlign: 'center', color: '#1d1d1f' }}>{qty}</div>
                  <button type="button" onClick={() => setQty(qty + 1)}
                          style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid #d2d2d7', background: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}>
                    +
                  </button>
                  <div style={{ fontSize: 16, fontWeight: 700, color: tierActive ? '#16a34a' : c }}>× {effectivePrice.toLocaleString()} د.ج</div>
                </div>
              </div>

              {/* Tier message + Gift */}
              {product.tierEnabled && product.tierQty && qty < product.tierQty && (
                <div style={{ background: '#fefce8', borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                    {(product.tierMessage || `➕ أضف {remaining} فقط ووفر ${savings.toLocaleString()} د.ج لكل قطعة!`).replace(/\{remaining\}/g, product.tierQty - qty)}
                  </span>
                </div>
              )}
              {tierActive && product.tierGift && (
                <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#16a34a' }}>🎁 هدية: {product.tierGift}</span>
                </div>
              )}

              {/* Delivery type */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>نوع التوصيل</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setDeliveryType('home')}
                          style={{ flex: 1, padding: '14px 8px', borderRadius: 14, border: deliveryType === 'home' ? '2px solid ' + c : '2px solid #e8e8ed', background: deliveryType === 'home' ? c : '#fff', color: deliveryType === 'home' ? '#fff' : '#1d1d1f', cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <img src="/home-icon.svg" alt="" style={{ width: 22, height: 22 }} />
                    <span style={{ fontSize: 13, fontWeight: 800 }}>التوصيل إلى المنزل</span>
                  </button>
                  <button type="button" onClick={() => setDeliveryType('office')}
                          style={{ flex: 1, padding: '14px 8px', borderRadius: 14, border: deliveryType === 'office' ? '2px solid ' + c : '2px solid #e8e8ed', background: deliveryType === 'office' ? c : '#fff', color: deliveryType === 'office' ? '#fff' : '#1d1d1f', cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <img src="/office-icon.svg" alt="" style={{ width: 22, height: 22 }} />
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: tierActive ? '#16a34a' : '#6e6e73' }}>
                      {effectivePrice.toLocaleString()} د.ج
                      {tierActive && <span style={{ fontSize: 12, color: '#8e8e93', textDecoration: 'line-through', marginLeft: 6 }}>{product.price.toLocaleString()}</span>}
                    </span>
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
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#c2185b' }}>{delivery > 0 ? `${total.toLocaleString()} د.ج` : `${subtotal.toLocaleString()} د.ج`}</span>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: imgs.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 0,
          }}>
            {imgs.slice(0, 10).map((img, i) => (
              <div key={i}>
                <img src={img} alt={`${product.name} ${i + 1}`}
                     style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews / Avis */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 20, color: '#1d1d1f' }}>⭐ آراء العملاء</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'أمينة ب.', city: 'الجزائر', rating: 5, text: 'منتج رائع ابني صار يحب يتعلم الحروف بفضله. جودة ممتازة والتوصيل كان سريع 👌', date: 'منذ 3 أيام' },
            { name: 'كريم ب.', city: 'وهران', rating: 5, text: 'الأسعار معقولة والجودة أكثر من ممتازة. الطلب وصل في الوقت المحدد. أنصح الجميع', date: 'منذ أسبوع' },
            { name: 'سارة ب.', city: 'قسنطينة', rating: 4, text: 'بنتي فرحت بيه بزاف. مفيد للتعليم واللعب في نفس الوقت. شكراً ibishop', date: 'منذ أسبوعين' },
            { name: 'محمد ب.', city: 'سيدي بلعباس', rating: 5, text: 'طلبت لولادي والمنتج فاق توقعاتي. توصيل لجميع الولايات والدفع عند الاستلام مريح', date: 'منذ شهر' },
          ].map((review, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, padding: 16, borderRadius: 14,
              background: '#f8f9fa', border: '1px solid #f0f0f0',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: c,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 18, flexShrink: 0,
              }}>
                {review.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#1d1d1f' }}>{review.name}</span>
                    <span style={{ fontSize: 12, color: '#8e8e93', marginLeft: 8 }}>📍 {review.city}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#8e8e93' }}>{review.date}</span>
                </div>
                <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 4 }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0 }}>{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom button — scrolls to form */}
      {scrolled && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #e8e8ed', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ width: '100%', padding: '16px 24px', background: c, color: '#fff', fontSize: 20, fontWeight: 900, borderRadius: 14, border: 'none', cursor: 'pointer' }}>
            اطلب الآن
          </button>
        </div>
      )}

      {/* Celebration overlay */}
      {celebration && <CelebrationOverlay data={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
}

function CelebrationOverlay({ data, onClose }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const savingAmt = data.price - data.tierPrice;

  useEffect(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    ctx.resume().then(() => {
      const now = ctx.currentTime;
      const fanfare = [
        { notes: [261.63, 329.63, 392.00], time: 0, dur: 0.5 },
        { notes: [329.63, 415.30, 493.88], time: 0.3, dur: 0.5 },
        { notes: [392.00, 493.88, 587.33], time: 0.6, dur: 0.5 },
        { notes: [523.25, 659.25, 783.99], time: 0.9, dur: 0.8 },
        { notes: [659.25, 830.61, 987.77], time: 1.2, dur: 0.8 },
        { notes: [783.99, 987.77, 1174.66], time: 1.5, dur: 1.0 },
      ];
      fanfare.forEach(({ notes, time, dur }) => {
        notes.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, now + time);
          gain.gain.linearRampToValueAtTime(0.25, now + time + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
      });
      [1318.5, 1568.0, 1760.0, 1975.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + 1.0 + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0 + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 1.0 + i * 0.12);
        osc.stop(now + 1.0 + i * 0.12 + 0.4);
      });
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(65.41, now);
      bass.frequency.exponentialRampToValueAtTime(32.70, now + 0.5);
      bassGain.gain.setValueAtTime(0.4, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.start(now);
      bass.stop(now + 0.6);
    }).catch(() => {});
  }, []);

  // Canvas confetti
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;

    const colors = ['#ff6b35','#ffaa00','#ffd700','#ff3b6f','#a855f7','#22c55e','#f50','#48dbfb'];
    let pieces = [];

    for (let i = 0; i < 100; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 60,
        w: 4 + Math.random() * 8,
        h: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 5,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 10,
        gravity: 0.06 + Math.random() * 0.04,
        opacity: 1,
      });
    }

    const ctx2d = canvas.getContext('2d');
    let animId;

    function draw() {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      pieces = pieces.filter(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rot += p.rotV;
        p.opacity -= 0.004;
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate((p.rot * Math.PI) / 180);
        ctx2d.globalAlpha = Math.max(0, p.opacity);
        ctx2d.fillStyle = p.color;
        ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx2d.restore();
        return p.opacity > 0 && p.y < canvas.height + 20;
      });
      if (pieces.length > 0) animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animId) cancelAnimationFrame(animId); };
  }, []);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <style>{`
        @keyframes wowBadgePop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.18) rotate(3deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes wowFloatUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes wowShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes wowSpark {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx),var(--dy)) scale(0); opacity: 0; }
        }
      `}</style>

      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Sparks */}
      {[...Array(30)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 120;
        const size = 3 + Math.random() * 6;
        const colors = ['#ff6b35','#ffaa00','#ffd700','#ff3b6f','#a855f7','#22c55e','#fff'];
        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: size, height: size,
            borderRadius: '50%',
            background: colors[i % colors.length],
            animation: `wowSpark ${0.6 + Math.random() * 0.6}s ease-out forwards`,
            animationDelay: `${0.1 + Math.random() * 0.3}s`,
            opacity: 0,
            zIndex: 2,
            '--dx': `${Math.cos(angle) * dist}px`,
            '--dy': `${Math.sin(angle) * dist}px`,
            pointerEvents: 'none',
          }} />
        );
      })}

      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', zIndex: 3, textAlign: 'center',
        animation: 'wowBadgePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #ff6b35, #f50)',
          color: '#fff',
          borderRadius: 100,
          padding: '20px 40px',
          boxShadow: '0 8px 40px rgba(255,85,0,0.5)',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 28, fontWeight: 900, lineHeight: 1.2,
            background: 'linear-gradient(90deg, #ffd700, #fff, #ffd700)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'wowShimmer 1.5s linear infinite',
          }}>
            🎉 تم فتح العرض!
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>
            {data.tierQty}+ بكمية
          </div>
        </div>

        {/* Price info */}
        <div style={{ animation: 'wowFloatUp 0.5s ease-out 0.3s both' }}>
          <div style={{ color: '#ffd700', fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
            {data.tierPrice.toLocaleString()} <span style={{ fontSize: 18 }}>د.ج</span>
            <span style={{ fontSize: 18, color: '#aaa', textDecoration: 'line-through', marginLeft: 10, fontWeight: 600 }}>
              {data.price.toLocaleString()} د.ج
            </span>
          </div>
          <div style={{ color: '#86efac', fontSize: 18, fontWeight: 700 }}>
            وفر {savingAmt.toLocaleString()} د.ج لكل قطعة
          </div>
          <div style={{ marginTop: 16 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '8px 24px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              ✅ تم تطبيق العرض الترويجي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Confirmation({ product, qty, total }) {
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playChaChing = async () => {
      await audioCtx.resume();
      const now = audioCtx.currentTime;

      // Rich chord: C major → G major
      const notes = [
        [523.25, 659.25, 783.99],
        [587.33, 739.99, 880.00],
        [659.25, 830.61, 987.77],
      ];
      notes.forEach((chord, i) => {
        chord.forEach((freq) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.25, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.8);
        });
      });

      // Sparkle on top
      [1600, 1800, 2000].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, now + 0.6 + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + 0.6 + i * 0.1);
        osc.stop(now + 0.6 + i * 0.1 + 0.4);
      });
    };
    playChaChing().catch(() => {});

    const t = setTimeout(() => setShowMsg(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f4c2d 0%, #166534 40%, #15803d 70%, #16a34a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(calc(100vh + 100px)) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-confetti { position: absolute; animation: confettiFall 3.5s ease-in forwards; }
      `}} />

      {/* Confetti */}
      {[...Array(40)].map((_, i) => (
        <div key={i} className="gold-confetti" style={{
          background: ['#ffd700','#fbbf24','#22c55e','#fff','#f59e0b','#10b981'][i % 6],
          left: `${Math.random() * 100}%`,
          top: `${-10 - Math.random() * 30}px`,
          animationDelay: `${Math.random() * 2.5}s`,
          animationDuration: `${2.5 + Math.random() * 2}s`,
          width: `${4 + Math.random() * 10}px`,
          height: `${4 + Math.random() * 10}px`,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          opacity: 0.7 + Math.random() * 0.3,
        }} />
      ))}

      {showMsg && (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease-out' }}>
          {/* Big checkmark */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: '#ffd700',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 0 60px rgba(255,215,0,0.5)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 50 }}>🎉</span>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 900, color: '#ffd700', marginBottom: 8, textShadow: '0 2px 16px rgba(255,215,0,0.3)' }}>
            شكراً لطلبك!
          </h1>
          <p style={{ color: '#fef3c7', fontSize: 17, fontWeight: 600, lineHeight: 1.8, maxWidth: 360, margin: '0 auto 8px' }}>
            سنقوم بالاتصال بك قريباً لتأكيد الطلبية
          </p>
          <p style={{ color: '#86efac', fontSize: 14, fontWeight: 500 }}>
            {product.name} x{qty} — {total.toLocaleString()} د.ج
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
            <a href="/"
               style={{
                 display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                 background: 'rgba(255,255,255,0.15)', color: '#fff',
                 padding: '14px 36px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                 textDecoration: 'none', backdropFilter: 'blur(4px)',
               }}>
              العودة إلى المتجر
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
