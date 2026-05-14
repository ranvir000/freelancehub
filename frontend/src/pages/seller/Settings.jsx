import React, { useState } from 'react'
import { api, useAuth, useToast } from '../../App.jsx'
import { User, MapPin, Briefcase, DollarSign, Tag, Save } from 'lucide-react'

export default function SellerSettings() {
  const { user, login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    name:        user?.name || '',
    bio:         user?.bio || '',
    skills:      user?.skills || '',
    location:    user?.location || '',
    avatar_url:  user?.avatar_url || '',
    hourly_rate: user?.hourly_rate || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/api/auth/me/', form)
      login(res.data, localStorage.getItem('fh_token'))
      toast('Profile updated ✅')
    } catch { toast('Failed to save', 'error') }
    finally { setSaving(false) }
  }

  const skillsList = form.skills ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : []

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Profile & Settings</h1>
      <p className="portal-page-sub">Your public seller profile — buyers see this</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <form onSubmit={save}>
          <div className="card" style={{padding:28,marginBottom:20}}>
            <h2 style={{fontSize:15,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}><User size={16}/> Profile</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)}/>
            </div>
            <div className="form-group">
              <label>Professional Bio</label>
              <textarea className="form-control" value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Describe your expertise and experience..." style={{minHeight:100}}/>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label><MapPin size={12} style={{marginRight:4}}/>Location</label>
                <input className="form-control" value={form.location} onChange={e=>set('location',e.target.value)} placeholder="City, Country"/>
              </div>
              <div className="form-group">
                <label><DollarSign size={12} style={{marginRight:4}}/>Hourly Rate (₹)</label>
                <input className="form-control" type="number" value={form.hourly_rate} onChange={e=>set('hourly_rate',e.target.value)} placeholder="1500"/>
              </div>
            </div>
            <div className="form-group">
              <label><Tag size={12} style={{marginRight:4}}/>Skills (comma-separated)</label>
              <input className="form-control" value={form.skills} onChange={e=>set('skills',e.target.value)} placeholder="React, Django, Figma, Python"/>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
                {skillsList.map(s=><span key={s} style={{background:'var(--brand-l)',color:'var(--brand)',padding:'2px 10px',borderRadius:12,fontSize:11,fontWeight:600}}>{s}</span>)}
              </div>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label>Avatar URL</label>
              <input className="form-control" value={form.avatar_url} onChange={e=>set('avatar_url',e.target.value)} placeholder="https://..."/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={saving}>
            <Save size={14}/> {saving?'Saving...':'Save Profile'}
          </button>
        </form>

        <div>
          <div className="card" style={{padding:28}}>
            <h2 style={{fontSize:15,fontWeight:700,marginBottom:20}}>Profile Preview</h2>
            <div style={{textAlign:'center'}}>
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="" style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',margin:'0 auto 12px'}}/>
              ) : (
                <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,var(--brand))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:24,margin:'0 auto 12px'}}>
                  {form.name?.slice(0,2).toUpperCase()||'??'}
                </div>
              )}
              <h3 style={{fontWeight:800,marginBottom:4}}>{form.name||'Your Name'}</h3>
              {form.location&&<p style={{fontSize:12,color:'var(--muted)',display:'flex',alignItems:'center',gap:4,justifyContent:'center',marginBottom:6}}><MapPin size={11}/>{form.location}</p>}
              {form.hourly_rate&&<p style={{fontSize:14,fontWeight:800,color:'var(--brand)',marginBottom:8}}>₹{form.hourly_rate}/hr</p>}
              <span className="badge badge-purple" style={{marginBottom:12}}>Freelancer</span>
              {form.bio&&<p style={{fontSize:12,color:'var(--text2)',lineHeight:1.6,marginBottom:12}}>{form.bio}</p>}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
                {skillsList.slice(0,4).map(s=><span key={s} style={{background:'var(--brand-l)',color:'var(--brand)',padding:'2px 10px',borderRadius:12,fontSize:11,fontWeight:600}}>{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
