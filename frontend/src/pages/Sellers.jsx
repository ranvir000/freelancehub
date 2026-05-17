import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../App.jsx'
import { Search, MapPin, Briefcase } from 'lucide-react'

const SKILLS = ['All','React','Python','Figma','SEO','Branding','Video Editing','Django','Marketing','Writing']

export default function Sellers() {
  const navigate = useNavigate()
  const [sellers,  setSellers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [skill,    setSkill]    = useState('All')

  useEffect(() => {
    setLoading(true)
    const p = {}
    if (query) p.search = query
    if (skill && skill !== 'All') p.skill = skill
    api.get('/api/sellers/', { params: p }).then(r => setSellers(r.data)).catch(() => setSellers([])).finally(() => setLoading(false))
  }, [query, skill])

  return (
    <div style={{ paddingTop:64, minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(135deg,var(--bg2),var(--bg))', borderBottom:'1px solid var(--border)', padding:'48px 0 32px' }}>
        <div className="page-wrap">
          <h1 style={{ fontSize:34, fontWeight:900, marginBottom:8 }}>Find Freelancers</h1>
          <p style={{ color:'var(--muted)', fontSize:15, marginBottom:28 }}>Hire verified experts across all skill categories</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:240, position:'relative' }}>
              <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }}/>
              <input className="form-control" placeholder="Search by name, skill, or expertise..." value={query} onChange={e=>setQuery(e.target.value)} style={{ paddingLeft:42, height:44 }}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
            {SKILLS.map(s => (
              <button key={s} onClick={() => setSkill(s)} style={{
                padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
                background: skill===s ? 'var(--brand)' : 'transparent',
                color: skill===s ? '#fff' : 'var(--muted)',
                borderColor: skill===s ? 'var(--brand)' : 'var(--border)',
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ padding:'32px 24px' }}>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20 }}>
          {loading ? 'Finding freelancers...' : `${sellers.length} freelancer${sellers.length !== 1 ? 's' : ''} available`}
        </p>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:220 }}/>)}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {sellers.map(s => {
              const initials = s.name?.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)
              return (
                <div key={s.id} className="seller-card" style={{ cursor:'pointer' }} onClick={() => navigate(`/profile/${s.id}`)}>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>
                    ) : (
                      <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:16, flexShrink:0 }}>{initials}</div>
                    )}
                    <div style={{ minWidth:0 }}>
                      <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{s.name}</h3>
                      {s.location && (
                        <p style={{ fontSize:12, color:'var(--muted)', display:'flex', alignItems:'center', gap:4, marginBottom:4 }}>
                          <MapPin size={11}/>{s.location}
                        </p>
                      )}
                      <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--muted)' }}>
                        <span><Briefcase size={11} style={{ marginRight:4 }}/>{s.gig_count || 0} gigs</span>
                        <span>✅ {s.completed_orders || 0} orders</span>
                      </div>
                    </div>
                    {s.hourly_rate && (
                      <div style={{ marginLeft:'auto', textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontSize:12, color:'var(--muted)' }}>From</p>
                        <p style={{ fontSize:15, fontWeight:800, color:'var(--brand)' }}>₹{Number(s.hourly_rate).toLocaleString()}/hr</p>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{s.bio}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {(s.skills_list || s.skills || []).slice(0,4).map(sk => (
                      <span key={sk} style={{ background:'var(--brand-l)', color:'var(--brand)', padding:'2px 10px', borderRadius:12, fontSize:11, fontWeight:600 }}>{sk}</span>
                    ))}
                  </div>
                  <button className="btn btn-outline" style={{ width:'100%', marginTop:16, fontSize:13 }}>View Profile</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
