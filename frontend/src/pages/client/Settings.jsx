import React, { useState } from 'react'
import { api, useAuth, useToast } from '../../App.jsx'
import { User, Mail, MapPin, Briefcase, DollarSign, Save } from 'lucide-react'

export default function ClientSettings() {
  const { user, login } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    name:     user?.name || '',
    bio:      user?.bio || '',
    location: user?.location || '',
    avatar_url: user?.avatar_url || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(p => ({...p, [k]:v}))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/api/auth/me/', form)
      login(res.data, localStorage.getItem('fh_token'))
      toast('Settings saved ✅')
    } catch { toast('Failed to save settings', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Account Settings</h1>
      <p className="portal-page-sub">Manage your profile and preferences</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <form onSubmit={save}>
          <div className="card" style={{ padding:28, marginBottom:20 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}><User size={16}/> Profile Info</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your full name"/>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" value={form.location} onChange={e=>set('location',e.target.value)} placeholder="City, Country"/>
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input className="form-control" value={form.avatar_url} onChange={e=>set('avatar_url',e.target.value)} placeholder="https://..."/>
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label>Bio</label>
              <textarea className="form-control" value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell us about yourself..." style={{ minHeight:100 }}/>
            </div>
          </div>

          <div className="card" style={{ padding:28 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}><Mail size={16}/> Account Details</h2>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label>Email Address</label>
              <input className="form-control" value={user?.email || ''} disabled style={{ opacity:.6, cursor:'not-allowed' }}/>
            </div>
            <p style={{ fontSize:11, color:'var(--muted)', marginTop:8 }}>Email cannot be changed. Contact support if needed.</p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop:20, width:'100%' }} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Preview */}
        <div>
          <div className="card" style={{ padding:28 }}>
            <h2 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>Profile Preview</h2>
            <div style={{ textAlign:'center' }}>
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px' }}/>
              ) : (
                <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:24, margin:'0 auto 12px' }}>
                  {form.name?.slice(0,2).toUpperCase() || '??'}
                </div>
              )}
              <h3 style={{ fontWeight:800, marginBottom:4 }}>{form.name || 'Your Name'}</h3>
              {form.location && <p style={{ fontSize:13, color:'var(--muted)', display:'flex', alignItems:'center', gap:4, justifyContent:'center', marginBottom:4 }}><MapPin size={12}/>{form.location}</p>}
              <span className="badge badge-blue" style={{ marginBottom:12 }}>Client Account</span>
              {form.bio && <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{form.bio}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
