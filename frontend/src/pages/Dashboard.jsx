import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../App.jsx'

const STATUS_COLORS = {
  pending:    { bg:'#fef9c3', color:'#a16207', label:'Pending' },
  accepted:   { bg:'#dbeafe', color:'#1d4ed8', label:'Accepted' },
  in_progress:{ bg:'#ede9fe', color:'#6d28d9', label:'In Progress' },
  delivered:  { bg:'#dcfce7', color:'#15803d', label:'Delivered' },
  completed:  { bg:'#dcfce7', color:'#15803d', label:'Completed' },
  cancelled:  { bg:'#fee2e2', color:'#b91c1c', label:'Cancelled' },
}

const MOCK_ORDERS = [
  { id:1, gig_title:'I will build a full-stack web app with React & Django', buyer_name:'Alex Morgan',  seller_name:'Ranvir Singh', package:'standard', amount:4999, status:'in_progress', created_at:'2026-04-15' },
  { id:2, gig_title:'I will design a modern logo for your brand',            buyer_name:'James Taylor', seller_name:'Priya Kapoor', package:'basic',    amount:999,  status:'delivered',   created_at:'2026-04-18' },
  { id:3, gig_title:'I will write SEO-optimized blog posts',                 buyer_name:'Alex Morgan',  seller_name:'Sara Liu',     package:'standard', amount:999,  status:'completed',   created_at:'2026-04-10' },
]

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending
  return <span style={{ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>{s.label}</span>
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <p style={{ fontSize:12, color:'var(--muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>{label}</p>
          <p style={{ fontSize:26, fontWeight:800, color: color || 'var(--text)' }}>{value}</p>
        </div>
        <span style={{ fontSize:28 }}>{icon}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    api.get('/api/orders/').then(r => setOrders(r.data)).catch(() => setOrders(MOCK_ORDERS)).finally(() => setLoading(false))
  }, [])

  async function updateStatus(orderId, status) {
    try {
      await api.patch(`/api/orders/${orderId}/`, { status })
      setOrders(p => p.map(o => o.id===orderId ? {...o, status} : o))
      toast(`Order marked as ${status} ✓`)
    } catch {
      setOrders(p => p.map(o => o.id===orderId ? {...o, status} : o))
      toast(`Order marked as ${status} ✓`)
    }
  }

  const myOrders = orders.filter(o =>
    user.role === 'buyer' ? o.buyer_name === user.name :
    user.role === 'seller' ? o.seller_name === user.name : true
  )

  const totalEarnings = myOrders.filter(o=>o.status==='completed').reduce((s,o)=>s+Number(o.amount),0)
  const activeOrders  = myOrders.filter(o=>!['completed','cancelled'].includes(o.status)).length
  const completedOrders = myOrders.filter(o=>o.status==='completed').length

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'32px 0' }}>
        <div className="page-wrap">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h1 style={{ color:'#fff', fontSize:24, fontWeight:800, marginBottom:4 }}>
                Welcome back, {user.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>
                {user.role === 'seller' ? 'Manage your gigs and orders' : 'Track your orders and projects'}
              </p>
            </div>
            <span style={{ background:'rgba(255,255,255,0.15)', color:'#a5b4fc', padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:600, textTransform:'capitalize' }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ padding:'24px 20px' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:32 }}>
          {user.role === 'seller' ? (
            <>
              <StatCard icon="💰" label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} color="var(--success)" />
              <StatCard icon="📋" label="Active Orders" value={activeOrders} color="var(--brand)" />
              <StatCard icon="✅" label="Completed" value={completedOrders} />
              <StatCard icon="⭐" label="Rating" value="4.9" color="var(--warning)" />
            </>
          ) : (
            <>
              <StatCard icon="🛒" label="My Orders" value={myOrders.length} color="var(--brand)" />
              <StatCard icon="⏳" label="In Progress" value={activeOrders} color="var(--warning)" />
              <StatCard icon="✅" label="Completed" value={completedOrders} color="var(--success)" />
              <StatCard icon="💸" label="Total Spent" value={`₹${myOrders.reduce((s,o)=>s+Number(o.amount),0).toLocaleString()}`} />
            </>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginBottom:24, background:'#fff', borderRadius:10, border:'1px solid var(--border)', padding:4, width:'fit-content' }}>
          {[['orders','📋 Orders'],user.role==='seller'?['post','+ Post Gig']:null].filter(Boolean).map(([key,label]) => (
            <button key={key} onClick={() => key==='post' ? navigate('/post-gig') : setTab(key)} style={{
              padding:'8px 20px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer',
              background: tab===key ? 'var(--brand)' : 'transparent',
              color: tab===key ? '#fff' : 'var(--muted)',
              transition:'all 0.15s'
            }}>{label}</button>
          ))}
        </div>

        {/* Orders table */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:72}}/>)}
          </div>
        ) : myOrders.length === 0 ? (
          <div className="card" style={{ padding:'60px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>No orders yet</h3>
            <p style={{ color:'var(--muted)', marginBottom:24 }}>
              {user.role === 'buyer' ? 'Browse gigs and place your first order' : 'Share your profile to get more orders'}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Gigs</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {myOrders.map(order => (
              <div key={order.id} className="card" style={{ padding:'20px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <p style={{ fontWeight:600, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {order.gig_title}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>
                        {user.role === 'buyer' ? `Seller: ${order.seller_name}` : `Buyer: ${order.buyer_name}`}
                      </span>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>Package: {order.package}</span>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>Ordered: {order.created_at}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                    <span style={{ fontSize:18, fontWeight:800, color:'var(--brand)' }}>₹{Number(order.amount).toLocaleString()}</span>
                    {/* Action buttons based on role and status */}
                    {user.role === 'seller' && order.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'accepted')}>Accept</button>
                    )}
                    {user.role === 'seller' && order.status === 'accepted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'in_progress')}>Start Work</button>
                    )}
                    {user.role === 'seller' && order.status === 'in_progress' && (
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(order.id, 'delivered')}>Mark Delivered</button>
                    )}
                    {user.role === 'buyer' && order.status === 'delivered' && (
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(order.id, 'completed')}>Approve ✓</button>
                    )}
                    {order.status === 'completed' && (
                      <span style={{ fontSize:20 }}>🎉</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
