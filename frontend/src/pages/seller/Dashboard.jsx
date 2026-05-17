import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../../App.jsx'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Star, TrendingUp, Plus } from 'lucide-react'

export default function SellerDashboard() {
  const { user }   = useAuth()
  const toast      = useToast()
  const navigate   = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [gigs,     setGigs]     = useState([])
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/orders/').catch(()=>({data:[]})),
      api.get('/api/gigs/', {params:{seller:user.id}}).catch(()=>({data:[]})),
      api.get('/api/reviews/', {params:{seller:user.id}}).catch(()=>({data:[]})),
    ]).then(([ord,gig,rev]) => {
      setOrders(ord.data.filter(o=>o.seller===user.id))
      setGigs(gig.data)
      setReviews(rev.data)
    }).finally(()=>setLoading(false))
  }, [user.id])

  async function updateStatus(order, status) {
    setProcessing(order.id)
    
    let msg = ''
    if (status === 'accepted') msg = `Hi ${order.buyer_name.split(' ')[0]}, I have accepted your order for "${order.gig_title}". I will begin working on it shortly!`
    if (status === 'in_progress') msg = `Update: I have started working on your order. I will keep you posted!`
    if (status === 'delivered') msg = `Great news! I have delivered the final files for "${order.gig_title}". Please review it when you have a moment.`

    // Simulated realistic processing delay (2-3s) to prevent rapid clicking
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000))
    
    try {
      await api.patch(`/api/orders/${order.id}/`, { status })
      if (msg) {
        await api.post('/api/messages/', { receiver: order.buyer, content: msg, order: order.id }).catch(()=>{})
      }
    } catch {}
    
    setOrders(p => p.map(o => o.id===order.id ? {...o, status} : o))
    toast(`Order ${status} ✅`)
    setProcessing(null)
  }

  const completed  = orders.filter(o=>['completed','delivered'].includes(o.status))
  const active     = orders.filter(o=>!['completed','cancelled'].includes(o.status))
  const earnings   = completed.reduce((s,o)=>s+Number(o.amount),0)
  const avgRating  = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '—'

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const chartData = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-(5-i), 1)
    const mo = orders.filter(o=>{
      const od=new Date(o.created_at); return od.getFullYear()===d.getFullYear()&&od.getMonth()===d.getMonth()&&['completed','delivered'].includes(o.status)
    })
    return { name:months[d.getMonth()], earnings: mo.reduce((s,o)=>s+Number(o.amount),0) }
  })

  return (
    <div className="portal-page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h1 className="portal-page-title" style={{ marginBottom:0 }}>Seller Dashboard</h1>
        <button onClick={()=>navigate('/seller/gigs/new')} className="btn btn-primary btn-sm"><Plus size={13}/> New Gig</button>
      </div>
      <p className="portal-page-sub">Your performance overview</p>

      <div className="stats-grid">
        {[
          {icon:'💰', label:'Total Earnings',   value:`₹${earnings.toLocaleString()}`,  color:'var(--success)'},
          {icon:'📋', label:'Active Orders',    value:active.length,                    color:'var(--brand)'},
          {icon:'✅', label:'Completed',        value:completed.length},
          {icon:'⭐', label:'Avg Rating',       value:avgRating,                        color:'#fbbf24'},
          {icon:'🎯', label:'Active Gigs',      value:gigs.filter(g=>g.is_active).length},
          {icon:'💬', label:'Total Reviews',    value:reviews.length},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{color:s.color}}>{loading?'—':s.value}</p>
            <p className="stat-icon">{s.icon}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20, marginBottom:20 }}>
        {/* Earnings chart */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Earnings Overview</h3>
          <p style={{ fontSize:12, color:'var(--muted)', marginBottom:20 }}>Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}} dy={8}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}} tickFormatter={v=>`₹${v}`} dx={-8}/>
              <Tooltip contentStyle={{background:'var(--card)',border:'none',borderRadius:8,boxShadow:'var(--shadow-md)'}} itemStyle={{color:'var(--brand)',fontWeight:700}}/>
              <Area type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2.5} fill="url(#eg)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent reviews */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>Recent Reviews</h3>
            <Star size={15} style={{ color:'#fbbf24' }}/>
          </div>
          {reviews.slice(0,3).map(r=>(
            <div key={r.id} style={{ paddingBottom:12, marginBottom:12, borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:600 }}>{r.buyer_name}</span>
                <span style={{ color:'#fbbf24', fontSize:12 }}>{'★'.repeat(r.rating)}</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{r.comment}</p>
            </div>
          ))}
          {reviews.length===0 && <p style={{ fontSize:13, color:'var(--muted)' }}>No reviews yet</p>}
        </div>
      </div>

      {/* Active orders */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Active Orders</h3>
          <button onClick={()=>navigate('/seller/orders')} className="btn btn-ghost btn-sm" style={{ display:'flex', alignItems:'center', gap:4 }}>View All <ArrowRight size={12}/></button>
        </div>
        {active.length===0 ? (
          <p style={{ color:'var(--muted)', fontSize:13 }}>No active orders. Share your gigs to get more orders!</p>
        ) : active.slice(0,5).map(o=>(
          <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.gig_title}</p>
              <p style={{ fontSize:11, color:'var(--muted)' }}>Buyer: {o.buyer_name} · ₹{Number(o.amount).toLocaleString()}</p>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0, alignItems:'center' }}>
              {processing === o.id && <span style={{fontSize:12,color:'var(--muted)',fontWeight:600,animation:'pulse 1.5s infinite'}}>Updating...</span>}
              {o.status==='pending'     && <button className="btn btn-primary btn-sm" disabled={processing===o.id} onClick={()=>updateStatus(o,'accepted')}>Accept</button>}
              {o.status==='accepted'    && <button className="btn btn-primary btn-sm" disabled={processing===o.id} onClick={()=>updateStatus(o,'in_progress')}>Start</button>}
              {o.status==='in_progress' && <button className="btn btn-success btn-sm" disabled={processing===o.id} onClick={()=>updateStatus(o,'delivered')}>Deliver</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
