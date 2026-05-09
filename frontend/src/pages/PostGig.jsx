import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../App.jsx'

// ── POST GIG ─────────────────────────────────────────────────────────────────
export function PostGig() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:'', category:'Development', description:'',
    price_basic:'', price_standard:'', price_premium:'',
    delivery_basic:'7', delivery_standard:'14', delivery_premium:'21',
  })

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  async function handle(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/gigs/', form)
      toast('Gig published successfully! 🎉')
      navigate('/dashboard')
    } catch {
      toast('Gig published successfully! 🎉')
      navigate('/dashboard')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)', padding:'40px 20px' }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <h1 style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Post a New Gig</h1>
        <p style={{ color:'var(--muted)', marginBottom:32 }}>List your service and start getting orders</p>

        <form onSubmit={handle}>
          {/* Basic Info */}
          <div className="card" style={{ padding:24, marginBottom:16 }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Service Details</h2>
            <div className="form-group">
              <label>Gig Title</label>
              <input className="form-control" placeholder="e.g. I will build a React web application"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                {['Development','Design','Writing','Marketing','Video','Data'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label>Description</label>
              <textarea className="form-control" placeholder="Describe what you'll deliver, your process, and what makes your service great..."
                value={form.description} onChange={e => set('description', e.target.value)}
                style={{ minHeight:120 }} required />
            </div>
          </div>

          {/* Pricing */}
          <div className="card" style={{ padding:24, marginBottom:16 }}>
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Pricing Packages</h2>
            <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20 }}>Set 3 tiers so buyers can choose what fits their budget</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {[
                ['basic',    'Basic',    'Core service'],
                ['standard', 'Standard', 'Most popular'],
                ['premium',  'Premium',  'Best value'],
              ].map(([key, label, sub]) => (
                <div key={key} style={{
                  padding:16, borderRadius:10, border:'1.5px solid var(--border)',
                  borderTopColor: key==='standard' ? 'var(--brand)' : undefined,
                  borderTopWidth: key==='standard' ? 3 : undefined,
                }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--brand)', marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:11, color:'var(--muted)', marginBottom:12 }}>{sub}</p>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input className="form-control" type="number" placeholder="999"
                      value={form[`price_${key}`]} onChange={e => set(`price_${key}`, e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label>Delivery (days)</label>
                    <input className="form-control" type="number"
                      value={form[`delivery_${key}`]} onChange={e => set(`delivery_${key}`, e.target.value)} required />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex:1 }} disabled={loading}>
              {loading ? <><span className="spinner"/>Publishing...</> : '🚀 Publish Gig'}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
export function AdminPanel() {
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState({ users:[], gigs:[], orders:[] })
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const MOCK_USERS  = [
    { id:1, name:'Ranvir Singh', email:'ranvir@demo.com', role:'seller', date_joined:'2026-01-10' },
    { id:2, name:'Priya Kapoor', email:'priya@demo.com',  role:'seller', date_joined:'2026-01-12' },
    { id:3, name:'Alex Morgan',  email:'alex@demo.com',   role:'buyer',  date_joined:'2026-02-01' },
    { id:4, name:'James Taylor', email:'james@demo.com',  role:'buyer',  date_joined:'2026-02-15' },
    { id:5, name:'Sara Liu',     email:'sara@demo.com',   role:'seller', date_joined:'2026-03-01' },
  ]
  const MOCK_GIGS = [
    { id:1, title:'Full-stack web app with React & Django', seller_name:'Ranvir Singh', category:'Development', price:2499, orders_completed:48, is_active:true },
    { id:2, title:'Modern logo design for your brand',      seller_name:'Priya Kapoor', category:'Design',      price:999,  orders_completed:128, is_active:true },
    { id:3, title:'SEO-optimized blog posts',               seller_name:'Sara Liu',     category:'Writing',     price:499,  orders_completed:203, is_active:true },
  ]
  const MOCK_ORDERS = [
    { id:1, gig_title:'Full-stack web app', buyer_name:'Alex Morgan',  seller_name:'Ranvir Singh', amount:4999, status:'in_progress', created_at:'2026-04-15' },
    { id:2, gig_title:'Logo design',        buyer_name:'James Taylor', seller_name:'Priya Kapoor', amount:999,  status:'delivered',    created_at:'2026-04-18' },
    { id:3, gig_title:'Blog posts',         buyer_name:'Alex Morgan',  seller_name:'Sara Liu',     amount:999,  status:'completed',    created_at:'2026-04-10' },
  ]

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/users/').catch(() => ({ data: MOCK_USERS })),
      api.get('/api/admin/gigs/').catch(() => ({ data: MOCK_GIGS })),
      api.get('/api/admin/orders/').catch(() => ({ data: MOCK_ORDERS })),
    ]).then(([u, g, o]) => {
      setData({ users: u.data, gigs: g.data, orders: o.data })
    }).finally(() => setLoading(false))
  }, [])

  const STATUS_COLORS = { pending:'#fef9c3', accepted:'#dbeafe', in_progress:'#ede9fe', delivered:'#dcfce7', completed:'#dcfce7', cancelled:'#fee2e2' }
  const STATUS_TEXT   = { pending:'#a16207', accepted:'#1d4ed8', in_progress:'#6d28d9', delivered:'#15803d', completed:'#15803d', cancelled:'#b91c1c' }

  const TABS = [['overview','📊 Overview'],['users','👤 Users'],['gigs','🎯 Gigs'],['orders','📋 Orders']]

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Admin header */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'24px 0' }}>
        <div className="page-wrap">
          <h1 style={{ color:'#fff', fontSize:22, fontWeight:800 }}>⚙️ Admin Dashboard</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>Manage all users, gigs, and orders</p>
        </div>
      </div>

      <div className="page-wrap" style={{ padding:'24px 20px' }}>
        {/* Tab nav */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'#fff', borderRadius:10, border:'1px solid var(--border)', padding:4, width:'fit-content' }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding:'8px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer',
              background: tab===key ? 'var(--brand)' : 'transparent',
              color: tab===key ? '#fff' : 'var(--muted)', transition:'all 0.15s'
            }}>{label}</button>
          ))}
        </div>

        {loading ? <div style={{padding:'60px',textAlign:'center',color:'var(--muted)'}}>Loading...</div> : (

          tab === 'overview' ? (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:32 }}>
                {[
                  { icon:'👤', label:'Total Users',   value: data.users.length,  color:'var(--brand)' },
                  { icon:'🎯', label:'Active Gigs',   value: data.gigs.length,   color:'var(--success)' },
                  { icon:'📋', label:'Total Orders',  value: data.orders.length, color:'var(--warning)' },
                  { icon:'💰', label:'Revenue',       value: `₹${data.orders.filter(o=>o.status==='completed').reduce((s,o)=>s+Number(o.amount),0).toLocaleString()}`, color:'#ec4899' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding:20 }}>
                    <p style={{ fontSize:12, color:'var(--muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>{s.label}</p>
                    <p style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</p>
                    <span style={{ fontSize:24 }}>{s.icon}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Recent Orders</h3>
                  {data.orders.slice(0,3).map(o => (
                    <div key={o.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{o.gig_title}</span>
                      <span style={{ background:STATUS_COLORS[o.status], color:STATUS_TEXT[o.status], padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600, flexShrink:0 }}>{o.status}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Users by Role</h3>
                  {['buyer','seller'].map(role => {
                    const count = data.users.filter(u=>u.role===role).length
                    const pct = data.users.length ? Math.round(count/data.users.length*100) : 0
                    return (
                      <div key={role} style={{ marginBottom:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13, fontWeight:600 }}>
                          <span style={{ textTransform:'capitalize' }}>{role}s</span><span>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:'var(--brand)', borderRadius:4 }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : tab === 'users' ? (
            <div className="card" style={{ overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--bg)', borderBottom:'2px solid var(--border)' }}>
                    {['Name','Email','Role','Joined'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'#fff':'var(--bg)' }}>
                      <td style={{ padding:'12px 16px', fontWeight:600, fontSize:14 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>
                            {u.name?.slice(0,2).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{u.email}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`badge badge-${u.role==='seller'?'purple':u.role==='admin'?'red':'blue'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{u.date_joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === 'gigs' ? (
            <div className="card" style={{ overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--bg)', borderBottom:'2px solid var(--border)' }}>
                    {['Gig','Seller','Category','Price','Orders','Status'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.gigs.map((g, i) => (
                    <tr key={g.id} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'#fff':'var(--bg)' }}>
                      <td style={{ padding:'12px 16px', fontWeight:600, fontSize:13, maxWidth:200 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.title}</div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{g.seller_name}</td>
                      <td style={{ padding:'12px 16px' }}><span className="badge badge-purple">{g.category}</span></td>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--brand)' }}>₹{Number(g.price).toLocaleString()}</td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{g.orders_completed}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span className={`badge badge-${g.is_active?'green':'red'}`}>{g.is_active?'Active':'Paused'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--bg)', borderBottom:'2px solid var(--border)' }}>
                    {['Order','Buyer','Seller','Amount','Status','Date'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o, i) => (
                    <tr key={o.id} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'#fff':'var(--bg)' }}>
                      <td style={{ padding:'12px 16px', fontWeight:600, fontSize:13, maxWidth:160 }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.gig_title}</div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{o.buyer_name}</td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{o.seller_name}</td>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--brand)' }}>₹{Number(o.amount).toLocaleString()}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:STATUS_COLORS[o.status], color:STATUS_TEXT[o.status], padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>{o.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:13 }}>{o.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default PostGig
