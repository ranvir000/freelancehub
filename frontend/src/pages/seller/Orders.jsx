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
  const [tab,      setTab]     = useState('all')

  useEffect(() => {
    api.get('/api/orders/').then(r=>setOrders(r.data.filter(o=>o.seller===user.id))).catch(()=>{}).finally(()=>setLoading(false))
  }, [user.id])

  async function update(id, status) {
    try { await api.patch(`/api/orders/${id}/`, { status }) } catch {}
    setOrders(p => p.map(o => o.id===id ? {...o, status} : o))
    toast(`Order marked as ${status} ✅`)
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
                    <span>{o.created_at?.slice(0,10)}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0,flexWrap:'wrap'}}>
                  {o.status==='pending'     && <button className="btn btn-primary btn-sm" onClick={()=>update(o.id,'accepted')}>Accept</button>}
                  {o.status==='accepted'    && <button className="btn btn-primary btn-sm" onClick={()=>update(o.id,'in_progress')}>Start Work</button>}
                  {o.status==='in_progress' && <button className="btn btn-success btn-sm" onClick={()=>update(o.id,'delivered')}>Mark Delivered ✓</button>}
                  {o.status==='pending'     && <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}} onClick={()=>update(o.id,'cancelled')}>Decline</button>}
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}
