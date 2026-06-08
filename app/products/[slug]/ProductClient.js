'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [liveCount, setLiveCount] = useState(14 + Math.floor(Math.random() * 6));
  const [leaveOfferActive, setLeaveOfferActive] = useState(false);
  const offerTriggeredRef = useRef(false);
  const lastScrollY = useRef(0);
  const pageEnterRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => {
        const delta = Math.random() < 0.5 ? 1 : -1;
        return Math.max(12, Math.min(22, prev + delta));
      });
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then(r => r.json())
      .then(data => setReviews(data))
      .catch(() => {});
  }, [product.id]);

  // Visibilitychange trigger — user leaves app (back button, Facebook, etc.)
  useEffect(() => {
    if (blocked) return;
    const handleVisibility = () => {
      if (document.hidden && !offerTriggeredRef.current && Date.now() - pageEnterRef.current > 4000) {
        offerTriggeredRef.current = true;
        setLeaveOfferActive(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [blocked]);

  // Scroll-to-top trigger — user scrolling up trying to close
  useEffect(() => {
    if (blocked) return;
    let scrollTimer;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80 && currentY < lastScrollY.current - 8 && !offerTriggeredRef.current && Date.now() - pageEnterRef.current > 4000) {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          if (!offerTriggeredRef.current && window.scrollY < 80) {
            offerTriggeredRef.current = true;
            setLeaveOfferActive(true);
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600);
          }
        }, 400);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [blocked]);

  const formRef = useRef(null);
  const prevTierRef = useRef(false);
  const audioCtxRef = useRef(null);
  const submittedRef = useRef(false);

  const variants = product.slug === 'cahier-magique' ? [
    { label: 'A5', price: 1700, desc: 'صغير' },
    { label: 'A4', price: 2400, desc: 'كبير' },
  ] : product.slug === 'sijada-salat' ? [
    { label: 'سجادة ابنتي', price: 2400, desc: 'وردي', color: '#e91e63' },
    { label: 'سجادة ابني', price: 2400, desc: 'أزرق', color: '#1565c0' },
  ] : null;
  const [variant, setVariant] = useState(variants ? variants[0].label : null);

  const wordBoxPacks = useMemo(() => product.slug === 'word-box' ? [
    { label: 'باقة اكتشاف', subtitle: '1 لوحة + لغة واحدة', price: 3500, originalPrice: 3500, icon: '📖', emoji: '🌟', saving: 0, desc: 'اختر لغتك' },
    { label: 'باقة ثنائية', subtitle: '1 لوحة + اللغتين (عربية + فرنسية)', price: 4500, originalPrice: 7000, icon: '📚', emoji: '🔥', saving: 2500, desc: 'وفّر 2500 د.ج' },
    { label: 'باقة ثلاثية', subtitle: '1 لوحة + 3 لغات (عربية + فرنسية + إنجليزية)', price: 4900, originalPrice: 10500, icon: '🏆', emoji: '💥', saving: 5600, desc: 'وفّر 5600 د.ج' },
  ] : null, [product.slug]);
  const [pack, setPack] = useState(wordBoxPacks ? wordBoxPacks[0].label : null);
  const prevPackRef = useRef(null);
  const wordBoxLangs = ['عربية', 'فرنسية', 'إنجليزية'];
  const [packLang, setPackLang] = useState(wordBoxLangs[0]);
  const [wowAnim, setWowAnim] = useState(false);

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

  const basePrice = wordBoxPacks ? (wordBoxPacks.find(p => p.label === pack)?.price || product.price) : (variants ? variants.find(v => v.label === variant).price : product.price);
  const tierActive = product.tierEnabled && product.tierQty && product.tierPrice && qty >= product.tierQty;
  const effectivePrice = tierActive ? product.tierPrice : basePrice;
  const isLeaveOfferActive = leaveOfferActive && !tierActive;
  const finalPrice = isLeaveOfferActive ? Math.round(effectivePrice * 0.9) : effectivePrice;
  const selectedPack = wordBoxPacks?.find(p => p.label === pack);
  const packWow = selectedPack?.saving > 0;
  const selectedWilaya = wilayas.find(w => w.id === Number(wilayaId));
  const delivery = selectedWilaya ? (deliveryType === 'office' ? selectedWilaya.priceOffice : selectedWilaya.price) : 0;
  const subtotal = finalPrice * qty;
  const total = subtotal + delivery;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const savings = product.tierEnabled && product.tierPrice ? product.price - product.tierPrice : 0;
  const imgs = Array.isArray(product.images) ? product.images : [];

  const filteredCommunes = wilayaId ? communes.filter(c => c.wilayaId === Number(wilayaId)) : [];

  // Vérifier si ce téléphone est bloqué pour ce produit
  useEffect(() => {
    if (phone.replace(/\s/g, '').length >= 10) {
      fetch('/api/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ''), productId: product.id }),
      })
        .then(r => r.json())
        .then(data => {
          setBlocked(data.blocked);
        })
        .catch(() => {});
    } else {
      setBlocked(false);
    }
  }, [phone, product.id, product.name]);

  // Celebration overlay — palier atteint ou pack Duo/Trio sélectionné
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

  // Wow effect when upgrading to Duo/Trio pack
  useEffect(() => {
    if (wordBoxPacks && pack !== prevPackRef.current && selectedPack?.saving > 0) {
      prevPackRef.current = pack;
      setWowAnim(true);
      setCelebration({
        savings: selectedPack.saving,
        tierQty: 1,
        tierPrice: selectedPack.price,
        price: selectedPack.originalPrice,
        title: selectedPack.emoji + ' ' + selectedPack.label,
        subtitle: selectedPack.subtitle,
      });
      const timer = setTimeout(() => { setCelebration(null); setWowAnim(false); }, 3000);
      return () => clearTimeout(timer);
    } else if (wordBoxPacks) {
      prevPackRef.current = pack;
      setWowAnim(false);
    }
  }, [pack, wordBoxPacks, selectedPack?.saving, selectedPack?.label, selectedPack?.subtitle, selectedPack?.originalPrice, selectedPack?.price, selectedPack?.emoji]);

  const handleWilayaChange = (id) => {
    setWilayaId(id);
    setCommuneId('');
  };

  const submitOrder = async () => {
    if (submittedRef.current) return;
    if (!customer || !phone || !wilayaId || !communeId) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    submittedRef.current = true;
    setLoading(true);
    setError('');
    try {
      const alwaysLabel = product.slug === 'word-box';
      const packLangLabel = wordBoxPacks ? (pack === 'باقة اكتشاف' ? ` - ${packLang}` : (pack === 'باقة ثنائية' ? ' - عربية + فرنسية' : ' - عربية + فرنسية + إنجليزية')) : '';
      const variantLabel = wordBoxPacks ? ` (${pack}${packLangLabel})` : (variant && (alwaysLabel || variant !== (variants?.[0]?.label || '')) ? ` (${variant})` : '');
      const leaveNote = isLeaveOfferActive ? ' (عرض -10%)' : '';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id, qty, customer, phone,
          wilayaId: Number(wilayaId), communeId: Number(communeId),
          address, deliveryType, pageUrl: window.location.href,
          variantName: variantLabel ? `${product.name} ${variantLabel}${leaveNote}`.trim() : undefined,
          variantPrice: (variants || wordBoxPacks) ? finalPrice : undefined,
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

      const merciParams = new URLSearchParams({
        order: orderData.number, name: product.name,
        qty: qty.toString(), total: total.toString(),
        pid: product.id.toString(), capiEventId: orderData.capiEventId,
      });
      window.location.href = `/merci?${merciParams.toString()}`;
      return;
    } catch (e) {
      setError(e.message || 'حدث خطأ أثناء الطلب');
      submittedRef.current = false;
    }
    setLoading(false);
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        * { user-select: none; -webkit-user-select: none; }
        input, textarea, select { user-select: auto; -webkit-user-select: auto; }
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
        @keyframes blinkPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}} />
      {/* COD Banner */}
        <div style={{ background: c, color: '#fff', borderRadius: 0, padding: '14px 20px', textAlign: 'center', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 26 }}>🚚</span>
          الدفع عند الاستلام
        </div>

      {/* Social proof : blinking green dot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 12, height: 12, borderRadius: '50%', background: '#22c55e', display: 'inline-block',
          animation: 'blinkPulse 1.5s ease-in-out infinite',
          boxShadow: '0 0 8px rgba(34,197,94,0.6)',
        }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#16a34a' }}>{liveCount} شخص يشترون الآن</span>
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
              <img src="/logo-final.png" alt="ibishop" style={{ height: 90, display: 'block', margin: '0 auto 12px' }} />
            {/* Product title & price */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, lineHeight: 1.3, color: '#1d1d1f' }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                {product.oldPrice && !isLeaveOfferActive && <span style={{ fontSize: 16, color: '#8e8e93', textDecoration: 'line-through' }}>{product.oldPrice.toLocaleString()} د.ج</span>}
                <span style={{
                  fontSize: 28, fontWeight: 800, color: isLeaveOfferActive ? '#dc2626' : (tierActive ? '#16a34a' : c),
                  transition: 'transform 0.3s, color 0.3s',
                }}>
                  {finalPrice.toLocaleString()} <span style={{ fontSize: 16 }}>د.ج</span>
                </span>
                {isLeaveOfferActive && (
                  <span style={{ fontSize: 14, color: '#8e8e93', textDecoration: 'line-through' }}>{effectivePrice.toLocaleString()} د.ج</span>
                )}
                {tierActive && product.price !== effectivePrice && (
                  <span style={{ fontSize: 14, color: '#8e8e93', textDecoration: 'line-through' }}>{product.price.toLocaleString()}</span>
                )}
              </div>
              {isLeaveOfferActive && <span style={{ display: 'inline-block', background: '#dc2626', color: '#fff', fontSize: 13, padding: '4px 14px', borderRadius: 20, fontWeight: 900, marginTop: 8, animation: 'pulse 1.5s ease-in-out infinite' }}>🔥 -10% عرض خاص لك!</span>}
              {!isLeaveOfferActive && discount > 0 && !tierActive && <span style={{ display: 'inline-block', background: c, color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 800, marginTop: 8 }}>خصم {discount}%</span>}
              {tierActive && savings > 0 && (
                <span style={{ display: 'inline-block', background: '#16a34a', color: '#fff', fontSize: 13, padding: '6px 16px', borderRadius: 20, fontWeight: 900, marginTop: 8 }}>
                  ✅ توفير {savings.toLocaleString()} د.ج لكل قطعة!
                </span>
              )}
              {product.description && <p style={{ color: '#6e6e73', marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>{product.description}</p>}
            </div>

            {/* Urgence */}
            <div style={{ background: '#fff3cd', borderRadius: 12, padding: '14px 18px', margin: '0 20px 16px', textAlign: 'center', border: '1.5px solid #ffc107' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e', lineHeight: 1.6 }}>
                هذا المنتج ينفذ بسرعة لذا اطلبوا نسختكم اليوم ليتم تأكيدها
              </div>
            </div>

            {blocked ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', marginBottom: 8, lineHeight: 1.6 }}>
                  عذراً، هذه الصفحة غير متاحة حالياً
                </div>
                <div style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.6 }}>
                  يرجى تحديث الصفحة أو المحاولة لاحقاً.
                </div>
              </div>
            ) : (
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

              {/* Variant selector (non word-box) */}
              {variants && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6, color: '#1d1d1f' }}>اختيار النوع</label>
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
                        {v.color && (
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: v.color, border: '2px solid rgba(0,0,0,0.15)' }} />
                          </div>
                        )}
                        <div style={{ fontSize: 16, fontWeight: 900 }}>{v.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, opacity: 0.85 }}>{v.desc}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{v.price.toLocaleString()} د.ج</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Word-box pack selector */}
              {wordBoxPacks && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 10, color: '#1d1d1f' }}>اختر باقتك</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {wordBoxPacks.map(p => {
                      const active = pack === p.label;
                      const showWow = wowAnim && p.saving > 0 && active;
                      const packColors = { 'باقة اكتشاف': '#fefce8', 'باقة ثنائية': '#faf5ff', 'باقة ثلاثية': '#fce7f3' };
                      const bg = packColors[p.label] || '#fff';
                      return (
                        <button key={p.label} type="button" onClick={() => setPack(p.label)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 14,
                                  padding: '14px 16px', borderRadius: 14,
                                  border: active ? '2px solid ' + c : '1.5px solid #d2d2d7',
                                  background: active ? bg : bg,
                                  cursor: 'pointer', textAlign: 'right', transition: 'all .25s',
                                  boxShadow: active ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
                                  transform: active ? 'scale(1.02)' : 'scale(1)',
                                  position: 'relative', overflow: 'hidden',
                                }}>
                          {showWow && (
                            <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                              background: `linear-gradient(90deg, ${c}, #ffd700, ${c})`,
                              backgroundSize: '200% 100%',
                              animation: 'shimmerText 1.5s linear',
                            }} />
                          )}
                          <div style={{
                            fontSize: 32, flexShrink: 0, width: 48, textAlign: 'center',
                            animation: showWow ? 'giftBounce 0.8s ease-out' : 'none',
                          }}>{p.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16, fontWeight: 900, color: '#1d1d1f' }}>{p.label}</span>
                              {showWow && (
                                <span style={{
                                  background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                                  color: '#fff', fontSize: 10, fontWeight: 900,
                                  padding: '2px 8px', borderRadius: 10,
                                  animation: 'pulse 1.5s linear',
                                }}>
                                  {p.desc}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: '#8e8e93', fontWeight: 600, marginTop: 2 }}>{p.subtitle}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                              <span style={{
                                fontSize: 18, fontWeight: 900,
                                color: active ? c : '#1d1d1f',
                                transition: 'color .2s',
                              }}>
                                {p.price.toLocaleString()} <span style={{ fontSize: 12 }}>د.ج</span>
                              </span>
                              {p.saving > 0 && (
                                <span style={{ fontSize: 12, color: '#8e8e93', textDecoration: 'line-through' }}>
                                  {p.originalPrice.toLocaleString()} د.ج
                                </span>
                              )}
                            </div>
                          </div>
                          {active && (
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%', background: c,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: 13, fontWeight: 900, flexShrink: 0,
                            }}>✓</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Language selector for Découverte pack */}
                  {pack === 'باقة اكتشاف' && (
                    <div style={{ marginTop: 12, background: '#f8f9fa', borderRadius: 12, padding: '12px 16px' }}>
                      <label style={{ fontSize: 13, fontWeight: 800, display: 'block', marginBottom: 8, color: '#555' }}>اختر اللغة</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {wordBoxLangs.map(lang => (
                          <button key={lang} type="button" onClick={() => setPackLang(lang)}
                                  style={{
                                    flex: 1, padding: '10px 8px', borderRadius: 10,
                                    border: packLang === lang ? '2px solid ' + c : '1.5px solid #d2d2d7',
                                    background: packLang === lang ? c : '#fff',
                                    color: packLang === lang ? '#fff' : '#1d1d1f',
                                    fontSize: 14, fontWeight: 800, cursor: 'pointer',
                                    textAlign: 'center', transition: 'all .2s',
                                  }}>
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <div style={{ fontSize: 16, fontWeight: 700, color: isLeaveOfferActive ? '#dc2626' : (tierActive ? '#16a34a' : c) }}>× {finalPrice.toLocaleString()} د.ج</div>
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
                    <span style={{ fontSize: 14, fontWeight: 700, color: isLeaveOfferActive ? '#dc2626' : (tierActive ? '#16a34a' : '#6e6e73') }}>
                      {finalPrice.toLocaleString()} د.ج
                      {isLeaveOfferActive && <span style={{ fontSize: 12, color: '#8e8e93', textDecoration: 'line-through', marginLeft: 6 }}>{effectivePrice.toLocaleString()}</span>}
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
            )}
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
          {reviews.map((review, i) => (
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

      {/* Leave offer popup */}
      {leaveOfferActive && (
        <div onClick={() => setLeaveOfferActive(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <style>{`
            @keyframes leavePop {
              0% { transform: scale(0) rotate(-8deg); opacity: 0; }
              60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
              80% { transform: scale(0.96) rotate(-1deg); }
              100% { transform: scale(1) rotate(0); opacity: 1; }
            }
            @keyframes leaveFloat {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes leavePulse {
              0%,100% { transform: scale(1); box-shadow: 0 8px 40px rgba(220,38,38,0.3); }
              50% { transform: scale(1.05); box-shadow: 0 8px 60px rgba(220,38,38,0.5); }
            }
          `}</style>
          <div onClick={e => e.stopPropagation()} style={{
            textAlign: 'center', animation: 'leavePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              color: '#fff', borderRadius: 24, padding: '40px 36px',
              boxShadow: '0 20px 60px rgba(220,38,38,0.4)',
              position: 'relative', maxWidth: 360,
            }}>
              <button onClick={() => setLeaveOfferActive(false)} style={{
                position: 'absolute', top: 12, left: 12, width: 32, height: 32,
                borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <div style={{
                fontSize: 22, fontWeight: 900, lineHeight: 1.4, marginBottom: 12,
              }}>
                عرض خاص جداً لك!
              </div>
              <div style={{
                fontSize: 56, fontWeight: 900, lineHeight: 1,
                background: 'linear-gradient(90deg, #ffd700, #fff, #ffd700)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 8,
                animation: 'wowShimmer 1.5s linear infinite',
              }}>
                -10%
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.9, marginBottom: 20, lineHeight: 1.5 }}>
                خصم 10% على طلبك إذا طلبت الآن<br />
                السعر مخفض تلقائياً ✅
              </div>
              <button onClick={() => {
                setLeaveOfferActive(false);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
              }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: '#dc2626', fontSize: 18, fontWeight: 900,
                padding: '16px 32px', borderRadius: 14, border: 'none',
                cursor: 'pointer', animation: 'leavePulse 2s ease-in-out infinite',
              }}>
                🔥 اشتري الآن
              </button>
            </div>
          </div>
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
  const isPack = !!data.title;
  const savingAmt = isPack ? data.savings : data.price - data.tierPrice;

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
            fontSize: 24, fontWeight: 900, lineHeight: 1.2,
            background: 'linear-gradient(90deg, #ffd700, #fff, #ffd700)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'wowShimmer 1.5s linear infinite',
          }}>
            {isPack ? data.title : '🎉 تم فتح العرض!'}
          </div>
          {!isPack && (
            <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>
              {data.tierQty}+ بكمية
            </div>
          )}
          {isPack && data.subtitle && (
            <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>
              {data.subtitle}
            </div>
          )}
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
            وفر {savingAmt.toLocaleString()} د.ج
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


