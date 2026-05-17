'use client';

import { useState, useEffect } from 'react';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({ name: '', price: '', oldPrice: '', images: [''], description: '', color: '#000000', category: '', sku: '', stock: '1', tierEnabled: false, tierQty: '', tierPrice: '', tierMessage: '', tierGift: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncResult, setSyncResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({});
  const [deliverySaving, setDeliverySaving] = useState({});
  const [stats, setStats] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') {
      setPassword(sessionStorage.getItem('admin_pwd') || '');
      setLoggedIn(true);
    }
  }, []);

  const authHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-password': password });

  const autoLogout = () => { sessionStorage.clear(); setLoggedIn(false); setPassword(''); setTab('products'); };

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(false);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_auth', '1');
        sessionStorage.setItem('admin_pwd', password);
        setLoggedIn(true);
      } else {
        setLoginError(true);
      }
    } catch { setLoginError(true); }
    setLoginLoading(false);
  };

  const load = async () => {
    const r = await fetch('/api/products');
    setProducts(await r.json());
    const o = await fetch('/api/orders');
    setOrders(await o.json());
    const w = await fetch('/api/wilayas');
    setWilayas(await w.json());
    const s = await fetch('/api/stats', { headers: authHeaders() });
    if (s.ok) setStats(await s.json());
    else if (s.status === 401) autoLogout();
  };

  useEffect(() => { if (loggedIn) load(); }, [loggedIn]);

  const save = async () => {
    setLoading(true);
    const body = { ...form, images: form.images.filter(i => i && (i.startsWith('http') || i.startsWith('data:'))), price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : null, color: form.color || '#000000', category: form.category || '', sku: form.sku || null, stock: Number(form.stock), tierEnabled: form.tierEnabled, tierQty: form.tierEnabled && form.tierQty ? Number(form.tierQty) : null, tierPrice: form.tierEnabled && form.tierPrice ? Number(form.tierPrice) : null, tierMessage: form.tierEnabled ? form.tierMessage || null : null, tierGift: form.tierEnabled ? form.tierGift || null : null };
    const res = await fetch('/api/products' + (editId ? `/${editId}` : ''), {
      method: editId ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      if (res.status === 401) { alert('Session expirée. Reconnectez-vous.'); autoLogout(); setLoading(false); return; }
      const err = await res.json().catch(() => ({}));
      alert('Erreur: ' + (err.error || err.message || res.status));
      setLoading(false);
      return;
    }
    setForm({ name: '', price: '', oldPrice: '', images: [''], description: '', color: '#000000', stock: '1', tierEnabled: false, tierQty: '', tierPrice: '', tierMessage: '', tierGift: '' });
    setEditId(null);
    setLoading(false);
    load();
  };

  const edit = (p) => {
    const imgs = (Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]')).filter(i => i && (i.startsWith('http') || i.startsWith('data:')));
    setForm({ name: p.name, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '', images: imgs.length ? imgs : [''], description: p.description, color: p.color || '#000000', category: p.category || '', sku: p.sku || '', stock: String(p.stock), tierEnabled: p.tierEnabled || false, tierQty: p.tierQty ? String(p.tierQty) : '', tierPrice: p.tierPrice ? String(p.tierPrice) : '', tierMessage: p.tierMessage || '', tierGift: p.tierGift || '' });
    setEditId(p.id);
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (r.status === 401) { alert('Session expirée. Reconnectez-vous.'); autoLogout(); return; }
    if (!r.ok) return alert('Erreur : ' + (await r.json()).error);
    const data = await r.json();
    if (data.inactive) alert(data.message);
    load();
  };

  const toggleStatus = async (id, active) => {
    const r = await fetch(`/api/products/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ active: !active }) });
    if (r.status === 401) { alert('Session expirée. Reconnectez-vous.'); autoLogout(); return; }
    if (!r.ok) return alert('Erreur');
    load();
  };

  const selectAll = (checked) => {
    if (checked) setSelected(products.map(p => p.id));
    else setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!confirm(`Supprimer ${selected.length} produit(s) ?`)) return;
    const results = await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() })));
    const errors = results.filter(r => !r.ok);
    if (errors.length) return alert(`${errors.length} erreur(s) lors de la suppression`);
    setSelected([]);
    load();
  };

  const bulkToggleStatus = async (active) => {
    if (!selected.length) return;
    const results = await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ active }) })));
    const errors = results.filter(r => !r.ok);
    if (errors.length) return alert(`${errors.length} erreur(s)`);
    setSelected([]);
    load();
  };

  const setStatus = async (id, status) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    load();
  };

  const deleteOrder = async (id) => {
    if (!confirm('Supprimer cette commande ?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE', headers: authHeaders() });
    load();
  };

  const saveWilaya = async (id, price, priceOffice) => {
    await fetch('/api/wilayas', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, price, priceOffice }) });
    load();
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 360, margin: '60px auto', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 20 }}>Admin</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleLogin()}
                 placeholder="Mot de passe"
                 style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #d2d2d7', borderRadius: 12, fontSize: 16, marginBottom: 12 }} />
          {loginError && <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>Mot de passe incorrect</p>}
          <button onClick={handleLogin} disabled={loginLoading || !password}
                  style={{ width: '100%', padding: '14px', background: loginLoading ? '#666' : '#000', color: '#fff', fontSize: 16, fontWeight: 800, borderRadius: 12, border: 'none', cursor: 'pointer' }}>
            {loginLoading ? '...' : 'Connexion'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${tab === 'products' ? 'btn-primary' : ''}`} onClick={() => setTab('products')}>📦 Produits ({products.length})</button>
          <button className={`btn ${tab === 'orders' ? 'btn-primary' : ''}`} onClick={() => setTab('orders')}>📋 Commandes ({orders.length})</button>
          <button className={`btn ${tab === 'add' ? 'btn-primary' : ''}`} onClick={() => { setTab('add'); setForm({ name: '', price: '', oldPrice: '', images: [''], description: '', color: '#000000', category: '', sku: '', stock: '1', tierEnabled: false, tierQty: '', tierPrice: '', tierMessage: '', tierGift: '' }); setEditId(null); }}>
            {editId ? '✏️ Modifier' : '➕ Ajouter'}
          </button>
          <button className={`btn ${tab === 'sync' ? 'btn-primary' : ''}`} onClick={() => setTab('sync')}>📊 Google Sheets</button>
          <button className={`btn ${tab === 'stats' ? 'btn-primary' : ''}`} onClick={() => { setTab('stats'); if (!stats) load(); }}>📊 Stats</button>
          <button className={`btn ${tab === 'delivery' ? 'btn-primary' : ''}`} onClick={() => setTab('delivery')}>🚚 Livraison</button>
        </div>
        <button className="btn btn-ghost" style={{ border: '1px solid #ddd' }} onClick={() => { sessionStorage.clear(); setLoggedIn(false); setPassword(''); }}>
          🚪 Déconnexion
        </button>
      </div>

      {tab === 'products' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          {selected.length > 0 && (
            <div className="flex" style={{ gap: 8, marginBottom: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>{selected.length} sélectionné(s)</span>
              <button className="btn btn-danger" style={{ padding: '6px 16px', fontSize: 13 }} onClick={bulkDelete}>🗑️ Tout supprimer</button>
              <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: 13, border: '1px solid #ddd' }} onClick={() => bulkToggleStatus(true)}>👀 Activer</button>
              <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: 13, border: '1px solid #ddd' }} onClick={() => bulkToggleStatus(false)}>🙈 Désactiver</button>
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={e => selectAll(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} /></th>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>SKU</th>
                <th>Couleur</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
                return (
                  <tr key={p.id} style={{ background: selected.includes(p.id) ? '#fef2f2' : undefined }}>
                    <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: 18, height: 18, cursor: 'pointer' }} /></td>
                    <td><img src={imgs[0] || 'https://placehold.co/40x40/eee/999?text=N'} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} /></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td>{p.price.toLocaleString()} DA</td>
                    <td style={{ fontSize: 15, color: '#666' }}>{p.sku || '-'}</td>
                    <td><span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 6, background: p.color || '#000', verticalAlign: 'middle' }}></span></td>
                    <td>{p.stock}</td>
                    <td><span className="badge" style={{ background: p.active ? '#16a34a' : '#888' }}>{p.active ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div className="flex" style={{ gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={() => { edit(p); setTab('add'); }}>✏️</button>
                        <button className="btn btn-danger" style={{ padding: '8px 14px' }} onClick={() => remove(p.id)}>🗑️</button>
                        <button className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={() => toggleStatus(p.id, p.active)}>{p.active ? '🙈' : '👀'}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>📋 Commandes ({orders.length})</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all','pending','confirmed','shipped','delivered','cancelled'].map(s => (
                <button key={s} onClick={() => setOrderFilter(s)} style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, border: 'none',
                  cursor: 'pointer', transition: 'all .15s',
                  background: orderFilter === s ? '#1d1d1f' : '#e8e8ed',
                  color: orderFilter === s ? '#fff' : '#1d1d1f',
                }}>
                  {s === 'all' ? 'Toutes' : s === 'pending' ? '⏳ En attente' : s === 'confirmed' ? '✅ Confirmée' : s === 'shipped' ? '📦 Expédiée' : s === 'delivered' ? '🎉 Livrée' : '❌ Annulée'}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => {
              const filtered = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
              const headers = ['N°','Client','Téléphone','Wilaya','Commune','Produit','Prix unitaire','Quantité','Type livraison','Frais livraison','Total','Statut','Date'];
              const rows = filtered.map(o => [
                o.number, o.customer, o.phone, o.wilayaName, o.communeName,
                o.items?.[0]?.name || '', o.items?.[0]?.price || 0,
                o.items?.reduce((a,i) => a + i.quantity, 0) || 0,
                o.deliveryType === 'office' ? 'Stopdesk' : 'Domicile',
                o.delivery || 0, o.total, o.status,
                new Date(o.createdAt).toLocaleDateString()
              ]);
              const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'commandes.csv'; a.click();
            }}>⬇️ CSV</button>
          </div>

          {(() => {
            const filtered = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
            const statusConfig = {
              pending: { label: 'En attente', icon: '⏳', color: '#f59e0b', bg: '#fef3c7' },
              confirmed: { label: 'Confirmée', icon: '✅', color: '#2563eb', bg: '#dbeafe' },
              shipped: { label: 'Expédiée', icon: '📦', color: '#7c3aed', bg: '#ede9fe' },
              delivered: { label: 'Livrée', icon: '🎉', color: '#16a34a', bg: '#dcfce7' },
              cancelled: { label: 'Annulée', icon: '❌', color: '#dc2626', bg: '#fee2e2' },
            };
            const item = o => o.items?.[0] || {};
            const qty = o => o.items?.reduce((a,i) => a + i.quantity, 0) || 0;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 60, color: '#8e8e93', fontSize: 15 }}>
                    Aucune commande trouvée
                  </div>
                )}
                {filtered.map(o => (
                  <div key={o.id} style={{
                    background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    border: o.status === 'cancelled' ? '1px solid #fecaca' : '1px solid #f0f0f0',
                    opacity: o.status === 'cancelled' ? 0.6 : 1,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      {/* Left: order info */}
                      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f' }}>#{o.number}</span>
                          <span style={{ fontSize: 12, color: '#8e8e93' }}>
                            {new Date(o.createdAt).toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 14 }}>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Client</span>
                            <div style={{ fontWeight: 700, color: '#1d1d1f' }}>{o.customer}</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Téléphone</span>
                            <div style={{ fontWeight: 700, color: '#2563eb', direction: 'ltr' }}>{o.phone}</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Wilaya</span>
                            <div style={{ fontWeight: 600, color: '#1d1d1f' }}>{o.wilayaName}</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Commune</span>
                            <div style={{ fontWeight: 600, color: '#1d1d1f' }}>{o.communeName}</div>
                          </div>
                          {o.address && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Adresse</span>
                              <div style={{ fontWeight: 600, color: '#1d1d1f' }}>{o.address}</div>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #e8e8ed', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 16px', fontSize: 14 }}>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Produit</span>
                            <div style={{ fontWeight: 600, color: '#1d1d1f', fontSize: 13 }}>{item(o).name}</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Prix unitaire</span>
                            <div style={{ fontWeight: 700, color: '#1d1d1f' }}>{item(o).price?.toLocaleString()} DA</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Quantité</span>
                            <div style={{ fontWeight: 800, color: '#1d1d1f', fontSize: 16 }}>x{qty(o)}</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Livraison</span>
                            <div style={{ fontWeight: 600, color: '#1d1d1f' }}>
                              <span style={{
                                display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                                fontSize: 12, fontWeight: 700,
                                background: o.deliveryType === 'office' ? '#f0fdf4' : '#eff6ff',
                                color: o.deliveryType === 'office' ? '#16a34a' : '#2563eb',
                              }}>
                                {o.deliveryType === 'office' ? '📮 Stopdesk' : '🏠 Domicile'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Frais livraison</span>
                            <div style={{ fontWeight: 600, color: '#1d1d1f' }}>{o.delivery?.toLocaleString()} DA</div>
                          </div>
                          <div>
                            <span style={{ color: '#8e8e93', fontSize: 12, fontWeight: 600 }}>Total</span>
                            <div style={{ fontWeight: 900, fontSize: 18, color: '#f59e0b' }}>{o.total?.toLocaleString()} DA</div>
                          </div>
                        </div>
                      </div>

                      {/* Right: status + actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', minWidth: 140 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '6px 16px', borderRadius: 100,
                          fontSize: 13, fontWeight: 800,
                          background: (statusConfig[o.status] || statusConfig.pending).bg,
                          color: (statusConfig[o.status] || statusConfig.pending).color,
                        }}>
                          {(statusConfig[o.status] || statusConfig.pending).icon}
                          {(statusConfig[o.status] || statusConfig.pending).label}
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 4 }}>
                          {o.status === 'pending' && (
                            <>
                              <button style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStatus(o.id, 'confirmed')}>✅ Confirmer</button>
                              <button style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStatus(o.id, 'shipped')}>📦 Expédier</button>
                              <button style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStatus(o.id, 'cancelled')}>❌ Annuler</button>
                            </>
                          )}
                          {o.status === 'confirmed' && (
                            <>
                              <button style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStatus(o.id, 'shipped')}>📦 Expédier</button>
                              <button style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStatus(o.id, 'cancelled')}>❌ Annuler</button>
                            </>
                          )}
                          {o.status === 'shipped' && (
                            <button style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} onClick={() => setStatus(o.id, 'delivered')}>🎉 Marquer livrée</button>
                          )}
                          {o.status === 'delivered' && (
                            <span style={{ padding: '8px 12px', borderRadius: 10, background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 800, textAlign: 'center' }}>✅ Terminée</span>
                          )}
                          {o.status !== 'delivered' && (
                            <button style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }} onClick={() => deleteOrder(o.id)}>🗑️ Supprimer</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {tab === 'sync' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: 12 }}>📊 Synchronisation Google Sheets</h3>
          <p style={{ fontSize: 14, color: '#6e6e73', marginBottom: 16 }}>
            1. Crée un Google Sheet avec les colonnes : <code>name, price, oldPrice, images, description, color, sku, stock, active</code><br />
            2. Va dans Fichier → Partager → Publier sur le Web → CSV<br />
            3. Copie le lien et colle-le ci-dessous
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={sheetUrl} onChange={e => setSheetUrl(e.target.value)}
                   placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                   style={{ fontFamily: 'monospace', fontSize: 12, padding: '10px 12px' }} />
            <button className="btn btn-primary w-full" onClick={async () => {
              setSyncing(true); setSyncResult(null);
              try {
                const r = await fetch('/api/sync-sheet', {
                  method: 'POST', headers: authHeaders(),
                  body: JSON.stringify({ url: sheetUrl }),
                });
                const d = await r.json();
                setSyncResult(d);
                if (d.ok) load();
              } catch (e) { setSyncResult({ error: e.message }); }
              setSyncing(false);
            }} disabled={syncing || !sheetUrl}>
              {syncing ? '⏳ Synchronisation...' : '🔄 Lancer la synchronisation'}
            </button>
            {syncResult && (
              <div style={{ marginTop: 12, padding: 12, background: syncResult.error ? '#fef2f2' : '#f0fdf4', borderRadius: 10, fontSize: 14 }}>
                {syncResult.error ? (
                  <p style={{ color: '#dc2626' }}>Erreur : {syncResult.error}</p>
                ) : (
                  <div>
                    <p style={{ color: '#16a34a', fontWeight: 700, marginBottom: 8 }}>✅ {syncResult.total} produit(s) synchronisé(s)</p>
                    {syncResult.results?.map((r, i) => (
                      <p key={i} style={{ fontSize: 13, color: '#333' }}>• {r.name} — <span style={{ color: r.action === 'créé' ? '#2563eb' : '#d97706' }}>{r.action}</span></p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'delivery' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>🚚 Tarifs de livraison par wilaya</h3>
          </div>
          <table>
            <thead>
              <tr><th>Wilaya</th><th>Prix Domicile (DA)</th><th>Prix Bureau (DA)</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {wilayas.map(w => {
                const df = deliveryForm[w.id] || {};
                const price = df.price ?? w.price;
                const priceOffice = df.priceOffice ?? w.priceOffice;
                const saving = deliverySaving[w.id];
                return (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td><input type="number" value={price}
                               onChange={e => setDeliveryForm(f => ({ ...f, [w.id]: { ...f[w.id], price: e.target.value } }))}
                               style={{ width: 100, padding: '8px 10px', border: '1px solid #d2d2d7', borderRadius: 8, fontSize: 14 }} /></td>
                    <td><input type="number" value={priceOffice}
                               onChange={e => setDeliveryForm(f => ({ ...f, [w.id]: { ...f[w.id], priceOffice: e.target.value } }))}
                               style={{ width: 100, padding: '8px 10px', border: '1px solid #d2d2d7', borderRadius: 8, fontSize: 14 }} /></td>
                    <td>
                      <button className="btn btn-primary" style={{ padding: '8px 16px' }}
                              disabled={saving}
                              onClick={async () => {
                                setDeliverySaving(f => ({ ...f, [w.id]: true }));
                                await saveWilaya(w.id, price, priceOffice);
                                setDeliveryForm(f => { const r = { ...f }; delete r[w.id]; return r; });
                                setDeliverySaving(f => ({ ...f, [w.id]: false }));
                              }}>
                        {saving ? '⏳' : '💾'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'stats' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: 16 }}>📊 Statistiques</h3>
          {stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a' }}>{stats.todayViews}</div>
                  <div style={{ fontSize: 13, color: '#6e6e73' }}>Vues aujourd'hui</div>
                </div>
                <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#2563eb' }}>{stats.totalViews}</div>
                  <div style={{ fontSize: 13, color: '#6e6e73' }}>Vues totales</div>
                </div>
                <div style={{ background: '#fefce8', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#eab308' }}>{stats.totalOrders}</div>
                  <div style={{ fontSize: 13, color: '#6e6e73' }}>Commandes</div>
                </div>
                <div style={{ background: '#f5f3ff', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#8b5cf6' }}>{stats.totalProducts}</div>
                  <div style={{ fontSize: 13, color: '#6e6e73' }}>Produits actifs</div>
                </div>
              </div>
              {stats.weeklyViews?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Vues cette semaine</h4>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
                    {stats.weeklyViews.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', background: '#2563eb', borderRadius: '4px 4px 0 0',
                          height: Math.max(8, (d.count / Math.max(...stats.weeklyViews.map(x => x.count)) * 50)),
                        }} />
                        <span style={{ fontSize: 9, color: '#8e8e93' }}>{new Date(d.date).toLocaleDateString('fr', { weekday: 'short' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#8e8e93', fontSize: 14 }}>Chargement...</p>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: 12 }}>{editId ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={{ fontWeight: 700 }}>Nom du produit *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label style={{ fontWeight: 700 }}>Prix (DA) *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><label style={{ fontWeight: 700 }}>Ancien prix (optionnel)</label><input type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} /></div>
            {form.images.map((url, i) => (
                <div key={i}>
                  <label style={{ fontWeight: 700 }}>Image {i + 1}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={form.images[i]} onChange={e => setForm(f => { const im = [...f.images]; im[i] = e.target.value; return { ...f, images: im }; })} placeholder="URL ou upload" style={{ flex: 1 }} />
                  <label style={{ background: '#e8e8ed', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                    📁 Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return; e.target.value = '';
                      const fd = new FormData(); fd.append('file', file);
                      const r = await fetch('/api/upload-image', { method: 'POST', headers: { 'x-admin-password': password }, body: fd });
                      const d = await r.json();
                      if (d.url) setForm(f => { const im = [...f.images]; im[i] = d.url; return { ...f, images: im }; });
                      else alert('Erreur upload: ' + (d.error || 'inconnue'));
                    }} />
                  </label>
                  {form.images[i] && <img src={form.images[i]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                  <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16, lineHeight: 1 }} title="Supprimer">✕</button>
                </div>
              </div>
            ))}
            {form.images.length < 10 && (
              <button onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))} style={{ background: '#e8e8ed', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#6e6e73' }}>
                + Ajouter une image
              </button>
            )}
            <div><label style={{ fontWeight: 700 }}>Catégorie</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="ex: Électronique, Mode, Sport..." /></div>
            <div><label style={{ fontWeight: 700 }}>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <label style={{ fontWeight: 700 }}>Couleur du thème</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 50, height: 40, padding: 2, borderRadius: 8 }} />
                <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#000000" style={{ flex: 1 }} />
              </div>
            </div>
            <div><label style={{ fontWeight: 700 }}>SKU (optionnel)</label><input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="ex: SAM-S24-256" /></div>
            <div><label style={{ fontWeight: 700 }}>Stock</label><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>

            <div style={{ borderTop: '2px dashed #e5e5ea', margin: '12px 0', paddingTop: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>📊 Prix dégressif</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 12 }}>
                <input type="checkbox" checked={form.tierEnabled} onChange={e => setForm(f => ({ ...f, tierEnabled: e.target.checked }))} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 14 }}>Activer le prix dégressif</span>
              </label>
              {form.tierEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div><label style={{ fontWeight: 700 }}>Quantité minimum (palier 2)</label><input type="number" value={form.tierQty} onChange={e => setForm(f => ({ ...f, tierQty: e.target.value }))} placeholder="ex: 10" /></div>
                  <div><label style={{ fontWeight: 700 }}>Prix palier 2 (DA)</label><input type="number" value={form.tierPrice} onChange={e => setForm(f => ({ ...f, tierPrice: e.target.value }))} placeholder="ex: 550" /></div>
                  <div><label style={{ fontWeight: 700 }}>Message personnalisé</label><input value={form.tierMessage} onChange={e => setForm(f => ({ ...f, tierMessage: e.target.value }))} placeholder="ex: أضف 3 فقط ووفر 50 دج لكل قطعة" /></div>
                  <div><label style={{ fontWeight: 700 }}>Cadeau</label><input value={form.tierGift} onChange={e => setForm(f => ({ ...f, tierGift: e.target.value }))} placeholder="ex: قلم فاخر مجانا" /></div>
                </div>
              )}
            </div>

            <button className="btn btn-primary w-full" style={{ marginTop: 8 }} onClick={save} disabled={loading || !form.name || !form.price}>
              {loading ? '⏳...' : editId ? '💾 Enregistrer' : '✅ Ajouter le produit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
