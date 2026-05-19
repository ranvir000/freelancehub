import React, { useState, useEffect } from 'react'
import { api, useAuth, useToast } from '../../App.jsx'

const ST = {
  pending:     { bg:'rgba(245,158,11,0.15)',  color:'#fbbf24', label:'Pending' },
  accepted:    { bg:'rgba(59,130,246,0.15)',  color:'#60a5fa', label:'Accepted' },
  in_progress: { bg:'rgba(99,102,241,0.15)', color:'#818cf8', label:'In Progress' },
  delivered:   { bg:'rgba(34,197,94,0.15)',  color:'#4ade80', label:'Delivered' },
  completed:   { bg:'rgba(34,197,94,0.15)',  color:'#4ade80', label:'Completed' },
  cancelled:   { bg:'rgba(239,68,68,0.15)',  color:'#f87171', label:'Cancelled' },
}
const TABS = ['all','pending','accepted','in_progress','delivered','completed']

export default function SellerOrders() {
  const { user }   = useAuth()
  const toast      = useToast()
  const [orders,   setOrders]  = useState([])
  const [loading,  setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [tab,      setTab]     = useState('all')

  const localUser  = JSON.parse(localStorage.getItem('fh_user') || 'null') || user
  const userId     = localUser?.id

  useEffect(() => {
    if (!userId) return
    api.get('/api/orders/').then(r=>setOrders(r.data.filter(o=>o.seller===userId))).catch(()=>{}).finally(()=>setLoading(false))
  }, [userId])

  async function update(order, status) {
    setProcessing(order.id)
    
    let msg = ''
    if (status === 'accepted') msg = `Hi ${order.buyer_name.split(' ')[0]}, I have accepted your order for "${order.gig_title}". I will begin working on it shortly!`
    if (status === 'in_progress') msg = `Update: I have started working on your order. I will keep you posted!`
    if (status === 'delivered') msg = `Great news! I have delivered the final files for "${order.gig_title}". Please review it when you have a moment.`
    if (status === 'cancelled') msg = `I'm sorry, but I have to decline this order at this time.`

    // Simulated realistic processing delay (2-3s) to prevent rapid clicking
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000))
    
    try { 
      await api.patch(`/api/orders/${order.id}/`, { status })
      if (msg) {
        await api.post('/api/messages/', { receiver: order.buyer, content: msg, order: order.id }).catch(()=>{})
      }
    } catch {}
    
    setOrders(p => p.map(o => o.id===order.id ? {...o, status} : o))
    toast(`Order marked as ${status} ✅`)
    setProcessing(null)
  }

  const filtered = tab==='all' ? orders : orders.filter(o=>o.status===tab)

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Orders</h1>
      <p className="portal-page-sub">{orders.length} total order{orders.length!==1?'s':''}</p>

      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:24 }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
            background:tab===t?'var(--brand)':'transparent', color:tab===t?'#fff':'var(--muted)', borderColor:tab===t?'var(--brand)':'var(--border)',
          }}>{t.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
        ))}
      </div>

      {loading ? [1,2,3].map(i=><div key={i} className="skeleton" style={{height:100,marginBottom:12}}/>) :
        filtered.length===0 ? (
          <div className="card" style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}>📦</div>
            <h3 style={{fontWeight:700}}>No orders here</h3>
          </div>
        ) : filtered.map(o=>{
          const s = ST[o.status]||ST.pending
          const timeline = ['pending','accepted','in_progress','delivered','completed']
          const step = timeline.indexOf(o.status)
          return (
            <div key={o.id} className="card" style={{padding:20,marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:8}}>
                    <p style={{fontWeight:700,fontSize:15}}>{o.gig_title}</p>
                    <span style={{background:s.bg,color:s.color,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{s.label}</span>
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:12,color:'var(--muted)',flexWrap:'wrap'}}>
                    <span>Buyer: {o.buyer_name}</span>
                    <span>Package: {o.package}</span>
                    <span>Amount: <strong style={{color:'var(--brand)'}}>₹{Number(o.amount).toLocaleString()}</strong></span>
                    <span>Start: {o.created_at?.slice(0,10)}</span>
                    {o.updated_at && ['completed', 'delivered'].includes(o.status) && (
                      <span>Completed: {o.updated_at?.slice(0,10)}</span>
                    )}
                  </div>
                  {/* Timeline */}
                  {o.status !== 'cancelled' && (
                    <div style={{ display:'flex', alignItems:'center', gap:0, marginTop:16 }}>
                      {timeline.map((s_name, i) => (
                        <React.Fragment key={s_name}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                            <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, background: i<=step ? 'var(--brand)' : 'var(--surface)', color: i<=step ? '#fff' : 'var(--muted)', border:`2px solid ${i<=step ? 'var(--brand)' : 'var(--border)'}`, transition:'all 0.3s' }}>{i<step ? '✓' : i+1}</div>
                            <span style={{ fontSize:9, color: i<=step ? 'var(--brand)' : 'var(--muted)', marginTop:4, whiteSpace:'nowrap', fontWeight: i===step ? 700:400 }}>{s_name.replace('_',' ')}</span>
                          </div>
                          {i < timeline.length-1 && <div style={{ flex:1, height:2, background: i<step ? 'var(--brand)' : 'var(--border)', transition:'all 0.3s', minWidth:20 }}/>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0,flexWrap:'wrap',alignItems:'center'}}>
                  {processing === o.id && <span style={{fontSize:12,color:'var(--muted)',fontWeight:600,animation:'pulse 1.5s infinite'}}>Updating...</span>}
                  {o.status==='pending'     && <button className="btn btn-primary btn-sm" disabled={processing===o.id} onClick={()=>update(o,'accepted')}>Accept</button>}
                  {o.status==='accepted'    && <button className="btn btn-primary btn-sm" disabled={processing===o.id} onClick={()=>update(o,'in_progress')}>Start Work</button>}
                  {o.status==='in_progress' && <button className="btn btn-success btn-sm" disabled={processing===o.id} onClick={()=>update(o,'delivered')}>Mark Delivered ✓</button>}
                  {o.status==='pending'     && <button className="btn btn-ghost btn-sm" disabled={processing===o.id} style={{color:'var(--danger)'}} onClick={()=>update(o,'cancelled')}>Decline</button>}
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}
