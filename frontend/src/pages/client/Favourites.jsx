import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useToast } from '../../App.jsx'
import { Heart, Star, Trash2 } from 'lucide-react'

export default function ClientFavourites() {
  const navigate = useNavigate()
  const toast    = useToast()
  const [favs, setFavs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/favourites/').then(r => setFavs(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function remove(gigId) {
    await api.post('/api/favourites/toggle/', { gig_id: gigId }).catch(()=>{})
    setFavs(p => p.filter(f => f.gig !== gigId))
    toast('Removed from saved gigs')
  }

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Saved Gigs</h1>
      <p className="portal-page-sub">Your bookmarked services</p>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:200 }}/>)}
        </div>
      ) : favs.length === 0 ? (
        <div className="card" style={{ padding:'80px', textAlign:'center' }}>
          <Heart size={48} style={{ margin:'0 auto 16px', color:'var(--muted)', opacity:.3 }}/>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>No saved gigs yet</h3>
          <p style={{ color:'var(--muted)', marginBottom:20 }}>Browse gigs and click ❤️ to save them here</p>
          <button onClick={() => navigate('/browse')} className="btn btn-primary">Browse Gigs</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {favs.map(f => {
            const gig = f.gig_data || {}
            return (
              <div key={f.id} className="card" style={{ overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='var(--brand)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'}}>
                <div style={{ height:140, background:'linear-gradient(135deg,var(--card2),var(--surface))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }} onClick={() => navigate(`/gig/${f.gig}`)}>
                  {{'Development':'💻','Design':'🎨','Writing':'✍️','Marketing':'📣','Video':'🎬','Data':'📊'}[gig.category] || '🛠️'}
                </div>
                <div style={{ padding:16 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }} onClick={() => navigate(`/gig/${f.gig}`)}>{gig.title || 'Gig'}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b"/>
                      <span style={{ fontWeight:700 }}>{gig.rating || '—'}</span>
                      <span style={{ color:'var(--muted)' }}>({gig.review_count || 0})</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:15, fontWeight:800, color:'var(--brand)' }}>₹{Number(gig.price_basic||0).toLocaleString()}</span>
                      <button onClick={e=>{e.stopPropagation(); remove(f.gig)}} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', padding:4 }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/gig/${f.gig}`)} className="btn btn-primary" style={{ width:'100%', marginTop:12, fontSize:12 }}>View Gig</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
