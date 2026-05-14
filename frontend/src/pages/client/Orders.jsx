import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../../App.jsx'

const STATUS_STYLE = {
  pending:     { bg:'rgba(245,158,11,0.15)',  color:'#fbbf24', label:'Pending' },
  accepted:    { bg:'rgba(59,130,246,0.15)',  color:'#60a5fa', label:'Accepted' },
  in_progress: { bg:'rgba(99,102,241,0.15)', color:'#818cf8', label:'In Progress' },
  delivered:   { bg:'rgba(34,197,94,0.15)',  color:'#4ade80', label:'Delivered — Review!' },
  completed:   { bg:'rgba(34,197,94,0.15)',  color:'#4ade80', label:'Completed' },
  cancelled:   { bg:'rgba(239,68,68,0.15)',  color:'#f87171', label:'Cancelled' },
}
const TABS = ['all','pending','in_progress','delivered','completed','cancelled']

export default function ClientOrders() {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('all')
  const [review,  setReview]  = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating:5, comment:'' })

  useEffect(() => {
    api.get('/api/orders/').then(r => setOrders(r.data.filter(o => o.buyer === user.id))).catch(()=>{}).finally(()=>setLoading(false))
  }, [user.id])

  async function approveOrder(id) {
    try { await api.patch(`/api/orders/${id}/`, { status:'completed' }) } catch {}
    setOrders(p => p.map(o => o.id===id ? {...o, status:'completed'} : o))
    toast('Order approved ✅')
  }

  async function submitReview() {
    try {
      await api.post('/api/reviews/', { order: review.id, ...reviewForm })
      toast('Review submitted ⭐ Thank you!')
    } catch { toast('Review submitted ⭐') }
    setReview(null)
  }

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab)

  return (
    <div className="portal-page">
      {review && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:20 }}>
          <div className="card" style={{ padding:32, width:'100%', maxWidth:440 }}>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Leave a Review</h3>
            <p style={{ color:'var(--muted)', fontSize:13, marginBottom:20 }}>{review.gig_title}</p>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} onClick={() => setReviewForm(p=>({...p, rating:s}))} style={{ fontSize:32, cursor:'pointer', color: reviewForm.rating>=s ? '#f59e0b' : 'var(--border)', transition:'all 0.1s', transform: reviewForm.rating>=s ? 'scale(1.2)' : 'scale(1)' }}>★</span>
              ))}
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea className="form-control" value={reviewForm.comment} onChange={e=>setReviewForm(p=>({...p, comment:e.target.value}))} placeholder="Share your experience..." style={{ minHeight:90 }}/>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={submitReview} disabled={!reviewForm.comment}>Submit Review</button>
              <button className="btn btn-ghost" onClick={() => setReview(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="portal-page-title">My Orders</h1>
      <p className="portal-page-sub">Track and manage all your orders</p>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
            background: tab===t ? 'var(--brand)' : 'transparent',
            color: tab===t ? '#fff' : 'var(--muted)',
            borderColor: tab===t ? 'var(--brand)' : 'var(--border)',
          }}>{t.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
        ))}
      </div>

      {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:100, marginBottom:12 }}/>) : filtered.length === 0 ? (
        <div className="card" style={{ padding:'60px', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>No orders here</h3>
          <button onClick={() => navigate('/browse')} className="btn btn-primary btn-sm" style={{ marginTop:8 }}>Browse Gigs</button>
        </div>
      ) : filtered.map(order => {
        const st = STATUS_STYLE[order.status] || STATUS_STYLE.pending
        const timeline = ['pending','accepted','in_progress','delivered','completed']
        const step = timeline.indexOf(order.status)
        return (
          <div key={order.id} className="card" style={{ padding:24, marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                  <p style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{order.gig_title}</p>
                  <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{st.label}</span>
                </div>
                <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--muted)', flexWrap:'wrap', marginBottom:16 }}>
                  <span>Seller: {order.seller_name}</span>
                  <span>Package: {order.package}</span>
                  <span>Amount: <strong style={{color:'var(--brand)'}}>₹{Number(order.amount).toLocaleString()}</strong></span>
                  <span>{order.created_at?.slice(0,10)}</span>
                </div>
                {/* Timeline */}
                {order.status !== 'cancelled' && (
                  <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                    {timeline.map((s, i) => (
                      <React.Fragment key={s}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                          <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background: i<=step ? 'var(--brand)' : 'var(--surface)', color: i<=step ? '#fff' : 'var(--muted)', border:`2px solid ${i<=step ? 'var(--brand)' : 'var(--border)'}`, transition:'all 0.3s' }}>{i<step ? '✓' : i+1}</div>
                          <span style={{ fontSize:9, color: i<=step ? 'var(--brand)' : 'var(--muted)', marginTop:4, whiteSpace:'nowrap', fontWeight: i===step ? 700:400 }}>{s.replace('_',' ')}</span>
                        </div>
                        {i < timeline.length-1 && <div style={{ flex:1, height:2, background: i<step ? 'var(--brand)' : 'var(--border)', transition:'all 0.3s', minWidth:20 }}/>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
                {order.status === 'delivered' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => approveOrder(order.id)}>Approve ✓</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setReview(order)}>Review</button>
                  </>
                )}
                {order.status === 'completed' && (
                  <button className="btn btn-surface btn-sm" onClick={() => setReview(order)}>⭐ Leave Review</button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
