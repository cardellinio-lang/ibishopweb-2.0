'use client';

import { useState, useEffect } from 'react';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({ name: '', price: '', oldPrice: '', images: ['', '', '', '', ''], description: '', color: '#000000', sku: '', stock: '1' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setLoggedIn(true);
  }, []);

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
  };

  useEffect(() => { if (loggedIn) load(); }, [loggedIn]);

  const save = async () => {
    setLoading(true);
    const body = { ...form, price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : null, color: form.color || '#000000', sku: form.sku || null, stock: Number(form.stock) };
    try {
      const res = await fetch('/api/products' + (editId ? `/${editId}` : ''), {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Erreur ' + res.status);
      setForm({ name: '', price: '', oldPrice: '', images: ['', '', '', '', ''], description: '', color: '#000000', stock: '1' });
      setEditId(null);
      load();
    } catch (e) {
      alert('Erreur : ' + e.message);
    }
    setLoading(false);
  };

  const edit = (p) => {
    const imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images || '[]');
    setForm({ name: p.name, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '', images: [...imgs, '', '', '', '', ''].slice(0, 5), description: p.description, color: p.color || '#000000', sku: p.sku || '', stock: String(p.stock) });
    setEditId(p.id);
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleStatus = async (id, active) => {
    await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) });
    load();
  };

  const delivered = async (id) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'delivered' }) });
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={`btn ${tab === 'products' ? 'btn-primary' : ''}`} onClick={() => setTab('products')}>📦 Produits ({products.length})</button>
        <button className={`btn ${tab === 'orders' ? 'btn-primary' : ''}`} onClick={() => setTab('orders')}>📋 Commandes ({orders.length})</button>
        <button className={`btn ${tab === 'add' ? 'btn-primary' : ''}`} onClick={() => { setTab('add'); setForm({ name: '', price: '', oldPrice: '', images: ['', '', '', '', ''], description: '', color: '#000000', sku: '', stock: '1' }); setEditId(null); }}>
          {editId ? '✏️ Modifier' : '➕ Ajouter'}
        </button>
      </div>

      {tab === 'products' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
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
                  <tr key={p.id}>
                    <td><img src={imgs[0] || 'https://placehold.co/40x40/eee/999?text=N'} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} /></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.price.toLocaleString()} DA</td>
                    <td style={{ fontSize: 12, color: '#666' }}>{p.sku || '-'}</td>
                    <td><span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 6, background: p.color || '#000', verticalAlign: 'middle' }}></span></td>
                    <td>{p.stock}</td>
                    <td><span className="badge" style={{ background: p.active ? '#16a34a' : '#888' }}>{p.active ? 'Actif' : 'Inactif'}</span></td>
                    <td>
                      <div className="flex" style={{ gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { edit(p); setTab('add'); }}>✏️</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remove(p.id)}>🗑️</button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => toggleStatus(p.id, p.active)}>{p.active ? '🙈' : '👀'}</button>
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
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>N°</th><th>Client</th><th>Tél</th><th>Wilaya</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>#{o.number}</td>
                  <td>{o.customer}</td>
                  <td dir="ltr" style={{ textAlign: 'left' }}>{o.phone}</td>
                  <td>{o.wilayaId}</td>
                  <td>{o.total.toLocaleString()} DA</td>
                  <td><span className="badge" style={{ background: o.status === 'delivered' ? '#16a34a' : '#f59e0b' }}>{o.status === 'delivered' ? 'Livré' : 'En attente'}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.status !== 'delivered' && <button className="btn" style={{ padding: '4px 10px', fontSize: 12, background: '#16a34a', color: '#fff' }} onClick={() => delivered(o.id)}>✅ Livré</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'add' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: 12 }}>{editId ? '✏️ Modifier le produit' : '➕ Ajouter un produit'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><label style={{ fontWeight: 700 }}>Nom du produit *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label style={{ fontWeight: 700 }}>Prix (DA) *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><label style={{ fontWeight: 700 }}>Ancien prix (optionnel)</label><input type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} /></div>
            {[0, 1, 2, 3, 4].map(i => (
                <div key={i}>
                  <label style={{ fontWeight: 700 }}>Image {i + 1} URL</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={form.images[i]} onChange={e => setForm(f => { const im = [...f.images]; im[i] = e.target.value; return { ...f, images: im }; })} placeholder="https://..." style={{ flex: 1 }} />
                  {form.images[i] && <img src={form.images[i]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                </div>
              </div>
            ))}
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
            <button className="btn btn-primary w-full" style={{ marginTop: 8 }} onClick={save} disabled={loading || !form.name || !form.price}>
              {loading ? '⏳...' : editId ? '💾 Enregistrer' : '✅ Ajouter le produit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
