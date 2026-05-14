import React, { useState, useEffect } from 'react'
import { api, useToast } from '../../App.jsx'
import { Search } from 'lucide-react'

const ST = { pending:'yellow', accepted:'blue', in_progress:'purple', delivered:'teal', completed:'green', cancelled:'red' }

export default function AdminOrders() {
  const toast = useToast()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    api.get('/api/admin/orders/').then(r=>setOrders(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function changeStatus(id, status) {
    try { await api.patch(`/api/admin/orders/${id}/`, { status }) } catch {}
    setOrders(p => p.map(o => o.id===id ? {...o, status} : o))
    toast(`Order status updated to ${status}`)
  }

  const filtered = orders.filter(o => {
    const qMatch = !query || o.gig_title?.toLowerCase().includes(query.toLowerCase()) || o.buyer_name?.toLowerCase().includes(query.toLowerCase())
    const fMatch = filter==='all' || o.status===filter
    return qMatch && fMatch
  })

  const TABS = ['all','pending','in_progress','delivered','completed','cancelled']

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Order Management</h1>
      <p className="portal-page-sub">{orders.length} total orders · ₹{orders.filter(o=>o.status==='completed').reduce((s,o)=>s+Number(o.amount),0).toLocaleString()} revenue</p>

      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{
            padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700,cursor:'pointer',border:'1.5px solid',transition:'all 0.15s',
            background:filter===t?'#dc2626':'transparent', color:filter===t?'#fff':'var(--muted)', borderColor:filter===t?'#dc2626':'var(--border)'
          }}>{t.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
        ))}
      </div>

      <div style={{position:'relative',marginBottom:20}}>
        <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}/>
        <input className="form-control" placeholder="Search orders..." value={query} onChange={e=>setQuery(e.target.value)} style={{paddingLeft:42,height:44}}/>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        {loading ? [1,2,3,4,5].map(i=><div key={i} className="skeleton" style={{height:56,margin:8}}/>) : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Gig</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(o=>(
                <tr key={o.id}>
                  <td style={{color:'var(--muted)',fontSize:12}}>#{o.id}</td>
                  <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:13,fontWeight:600}}>{o.gig_title}</td>
                  <td style={{fontSize:12,color:'var(--muted)'}}>{o.buyer_name}</td>
                  <td style={{fontSize:12,color:'var(--muted)'}}>{o.seller_name}</td>
                  <td style={{fontWeight:700,color:'var(--brand)'}}>₹{Number(o.amount).toLocaleString()}</td>
                  <td><span className={`badge badge-${ST[o.status]||'gray'}`}>{o.status}</span></td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{o.created_at}</td>
                  <td>
                    <select value={o.status} onChange={e=>changeStatus(o.id,e.target.value)}
                      style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'4px 6px',fontSize:11,color:'var(--text)',cursor:'pointer'}}>
                      {['pending','accepted','in_progress','delivered','completed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:'center',padding:32,color:'var(--muted)'}}>No orders found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
