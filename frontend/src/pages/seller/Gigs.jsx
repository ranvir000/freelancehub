import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../../App.jsx'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react'

export default function SellerGigs() {
  const { user }   = useAuth()
  const toast      = useToast()
  const navigate   = useNavigate()
  const [gigs,     setGigs]    = useState([])
  const [loading,  setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  const localUser  = JSON.parse(localStorage.getItem('fh_user') || 'null') || user
  const userId     = localUser?.id

  useEffect(() => {
    if (!userId) return
    api.get('/api/gigs/', { params:{ seller: userId } }).then(r=>setGigs(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [userId])

  async function toggleActive(gig) {
    try { await api.patch(`/api/gigs/${gig.id}/`, { is_active: !gig.is_active }) } catch {}
    setGigs(p => p.map(g => g.id===gig.id ? {...g, is_active:!g.is_active} : g))
    toast(`Gig ${gig.is_active ? 'paused' : 'activated'}`)
  }

  async function deleteGig(id) {
    if (!window.confirm('Delete this gig?')) return
    try { await api.delete(`/api/gigs/${id}/`) } catch {}
    setGigs(p => p.filter(g => g.id!==id))
    toast('Gig deleted')
  }

  const CAT_ICON = {'Development':'💻','Design':'🎨','Writing':'✍️','Marketing':'📣','Video':'🎬','Data':'📊'}

  return (
    <div className="portal-page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h1 className="portal-page-title" style={{ marginBottom:0 }}>My Gigs</h1>
        <button onClick={()=>navigate('/seller/gigs/new')} className="btn btn-primary"><Plus size={15}/> New Gig</button>
      </div>
      <p className="portal-page-sub">{gigs.length} gig{gigs.length!==1?'s':''} posted</p>

      {loading ? [1,2,3].map(i=><div key={i} className="skeleton" style={{ height:120, marginBottom:12 }}/>) :
        gigs.length===0 ? (
          <div className="card" style={{ padding:'80px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
            <h3 style={{ fontWeight:700, marginBottom:8 }}>No gigs yet</h3>
            <p style={{ color:'var(--muted)', marginBottom:20 }}>Create your first gig to start getting orders</p>
            <button onClick={()=>navigate('/seller/gigs/new')} className="btn btn-primary"><Plus size={15}/> Create Gig</button>
          </div>
        ) : gigs.map(g => (
          <div key={g.id} className="card" style={{ padding:20, marginBottom:12, transition:'all 0.2s', opacity: g.is_active ? 1 : 0.6 }}>
            <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              <div style={{ width:56, height:56, borderRadius:12, background:'var(--brand-l)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
                {CAT_ICON[g.category] || '🛠️'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6, gap:12, flexWrap:'wrap' }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text)', flex:1, minWidth:0 }}>{g.title}</h3>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <span className={`badge badge-${g.is_active?'green':'gray'}`}>{g.is_active?'Active':'Paused'}</span>
                    {g.badge && <span className="badge badge-purple">{g.badge}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:20, fontSize:12, color:'var(--muted)', flexWrap:'wrap' }}>
                  <span>📦 {g.orders_completed} orders</span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}><Star size={11} fill="#fbbf24" color="#fbbf24"/> {g.rating} ({g.review_count})</span>
                  <span>💰 From ₹{Number(g.price_basic).toLocaleString()}</span>
                  <span>📂 {g.category}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={()=>navigate(`/gig/${g.id}`)} className="btn btn-surface btn-sm" title="Preview"><Eye size={13}/></button>
                <button onClick={()=>toggleActive(g)} className="btn btn-surface btn-sm" title={g.is_active?'Pause':'Activate'}>
                  {g.is_active ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
                <button onClick={()=>deleteGig(g.id)} className="btn btn-surface btn-sm" title="Delete" style={{ color:'var(--danger)' }}><Trash2 size={13}/></button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}
