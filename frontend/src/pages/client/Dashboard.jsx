import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../../App.jsx'
import { ShoppingBag, Clock, CheckCircle, TrendingUp, ArrowRight, Star } from 'lucide-react'

const STATUS_STYLE = {
  pending:     { bg:'rgba(245,158,11,0.15)',  color:'#fbbf24', label:'Pending' },
  accepted:    { bg:'rgba(59,130,246,0.15)',  color:'#60a5fa', label:'Accepted' },
  in_progress: { bg:'rgba(99,102,241,0.15)', color:'#818cf8', label:'In Progress' },
  delivered:   { bg:'rgba(34,197,94,0.15)',  color:'#4ade80', label:'Delivered' },
  completed:   { bg:'rgba(34,197,94,0.15)',  color:'#4ade80', label:'Completed' },
  cancelled:   { bg:'rgba(239,68,68,0.15)',  color:'#f87171', label:'Cancelled' },
}

export default function ClientDashboard() {
  const { user }   = useAuth()
  const toast      = useToast()
  const navigate   = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [recGigs,  setRecGigs]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/orders/').catch(() => ({ data: [] })),
      api.get('/api/gigs/').catch(() => ({ data: [] })),
    ]).then(([ord, gigs]) => {
      const myOrders = ord.data.filter(o => o.buyer === user.id)
      setOrders(myOrders)
      setRecGigs(gigs.data.slice(0,4))
    }).finally(() => setLoading(false))
  }, [user.id])

  async function approveOrder(id) {
    await api.patch(`/api/orders/${id}/`, { status:'completed' }).catch(() => {})
    setOrders(p => p.map(o => o.id===id ? {...o, status:'completed'} : o))
    toast('Order marked as completed ✅')
  }

  const myOrders   = orders
  const active     = myOrders.filter(o => !['completed','cancelled'].includes(o.status))
  const completed  = myOrders.filter(o => o.status === 'completed')
  const totalSpent = myOrders.reduce((s,o) => s + Number(o.amount), 0)

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Dashboard</h1>
      <p className="portal-page-sub">Welcome back, {user.name?.split(' ')[0]}! Here's your overview.</p>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon:'🛒', label:'Total Orders',   value: myOrders.length, color:'var(--brand)' },
          { icon:'⏳', label:'Active Orders',  value: active.length,   color:'var(--warning)' },
          { icon:'✅', label:'Completed',      value: completed.length, color:'var(--success)' },
          { icon:'💸', label:'Total Spent',    value:`₹${totalSpent.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color:s.color }}>{s.value}</p>
            <p className="stat-icon">{s.icon}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20, marginBottom:24 }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:16, fontWeight:700 }}>Recent Orders</h2>
            <button onClick={() => navigate('/client/orders')} className="btn btn-ghost btn-sm" style={{ display:'flex', alignItems:'center', gap:4 }}>View All <ArrowRight size={12}/></button>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:56, marginBottom:10 }}/>) : myOrders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--muted)' }}>
              <ShoppingBag size={32} style={{ margin:'0 auto 10px', opacity:.3 }}/>
              <p style={{ fontSize:13 }}>No orders yet</p>
              <button onClick={() => navigate('/browse')} className="btn btn-primary btn-sm" style={{ marginTop:12 }}>Browse Gigs</button>
            </div>
          ) : myOrders.slice(0,5).map(order => {
            const st = STATUS_STYLE[order.status] || STATUS_STYLE.pending
            return (
              <div key={order.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text)' }}>{order.gig_title}</p>
                  <p style={{ fontSize:11, color:'var(--muted)' }}>Seller: {order.seller_name}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>{st.label}</span>
                  {order.status === 'delivered' && (
                    <button onClick={() => approveOrder(order.id)} className="btn btn-success btn-sm">Approve</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card" style={{ padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Quick Actions</h2>
            {[
              { icon:'🔍', label:'Browse Gigs',         path:'/browse' },
              { icon:'👨‍💼', label:'Find Freelancers',    path:'/sellers' },
              { icon:'❤️', label:'Saved Gigs',           path:'/client/favourites' },
              { icon:'✉️', label:'Messages',             path:'/client/messages' },
              { icon:'⚙️', label:'Account Settings',    path:'/client/settings' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:8, border:'none', background:'transparent',
                color:'var(--text2)', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--brand-l)'; e.currentTarget.style.color='var(--brand)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text2)' }}
              >
                <span style={{ fontSize:18 }}>{a.icon}</span>{a.label}
                <ArrowRight size={13} style={{ marginLeft:'auto', opacity:.4 }}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended gigs */}
      {recGigs.length > 0 && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:16, fontWeight:700 }}>Recommended For You</h2>
            <button onClick={() => navigate('/browse')} className="btn btn-ghost btn-sm">Browse All</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
            {recGigs.map(g => (
              <div key={g.id} onClick={() => navigate(`/gig/${g.id}`)} style={{ cursor:'pointer', padding:16, background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='' }}
              >
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{g.title}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#fbbf24', fontWeight:600 }}><Star size={12} fill="#fbbf24"/>  {g.rating}</span>
                  <span style={{ fontSize:14, fontWeight:800, color:'var(--brand)' }}>₹{Number(g.price_basic).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
