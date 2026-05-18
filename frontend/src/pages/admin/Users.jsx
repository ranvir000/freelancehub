import React, { useState, useEffect } from 'react'
import { api, useToast } from '../../App.jsx'
import { Search, KeyRound } from 'lucide-react'

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [resetModal, setResetModal] = useState(null) // { id, name }
  const [newPw, setNewPw]       = useState('demo1234')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    api.get('/api/admin/users/').then(r=>setUsers(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function deleteUser(id, name) {
    if (!window.confirm(`Are you absolutely sure you want to delete user "${name}"? This action is permanent and will delete all their gigs, orders, and reviews.`)) return
    try {
      await api.delete(`/api/admin/users/${id}/`)
      setUsers(p => p.filter(u => u.id !== id))
      toast(`✅ User "${name}" deleted successfully`)
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to delete user', 'error')
    }
  }

  async function resetPassword() {
    if (!newPw || newPw.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    setResetting(true)
    try {
      await api.patch(`/api/admin/users/${resetModal.id}/`, { password: newPw })
      toast(`✅ Password reset for ${resetModal.name}`)
      setResetModal(null)
      setNewPw('demo1234')
    } catch (e) {
      toast(e.response?.data?.error || 'Reset failed', 'error')
    } finally { setResetting(false) }
  }

  const filtered = users.filter(u =>
    !query || u.name?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase())
  )

  const ROLE_COLOR = { buyer:'blue', seller:'purple', admin:'red' }

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">User Management</h1>
      <p className="portal-page-sub">{users.length} total users — click 🔑 to reset any user's password</p>

      {/* Reset Password Modal */}
      {resetModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500 }}>
          <div className="card" style={{ width:380, padding:28 }}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>🔑 Reset Password</h3>
            <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20 }}>
              Set a new password for <strong>{resetModal.name}</strong>
            </p>
            <div className="form-group">
              <label>New Password</label>
              <input
                className="form-control"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && resetPassword()}
              />
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className="btn btn-primary" onClick={resetPassword} disabled={resetting} style={{ flex:1 }}>
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
              <button className="btn btn-outline" onClick={() => { setResetModal(null); setNewPw('demo1234') }} style={{ flex:1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        {['buyer','seller','admin'].map(r=>(
          <div key={r} className="card" style={{padding:'12px 20px', display:'flex', alignItems:'center', gap:12}}>
            <span className={`badge badge-${ROLE_COLOR[r]}`} style={{fontSize:12}}>{r}</span>
            <span style={{fontSize:20,fontWeight:800}}>{users.filter(u=>u.role===r).length}</span>
          </div>
        ))}
      </div>

      <div style={{position:'relative',marginBottom:20}}>
        <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}/>
        <input className="form-control" placeholder="Search by name or email..." value={query} onChange={e=>setQuery(e.target.value)} style={{paddingLeft:42,height:44}}/>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        {loading ? [1,2,3,4,5].map(i=><div key={i} className="skeleton" style={{height:56,margin:8}}/>) : (
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Gigs</th><th>Password</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand),#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>
                        {u.name?.slice(0,2).toUpperCase()}
                      </div>
                      <span style={{fontWeight:600,fontSize:13}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{u.email}</td>
                  <td><span className={`badge badge-${ROLE_COLOR[u.role]||'gray'}`}>{u.role}</span></td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{u.date_joined}</td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{u.gig_count||0}</td>
                  <td>
                    <button
                      onClick={() => { setResetModal({ id: u.id, name: u.name }); setNewPw('demo1234') }}
                      style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text)' }}
                      title="Reset password"
                    >
                      <KeyRound size={13}/> Reset
                    </button>
                  </td>
                  <td>
                    {u.role !== 'admin' ? (
                      <button
                        onClick={() => deleteUser(u.id, u.name)}
                        style={{ background:'none', border:'1px solid rgba(239, 68, 68, 0.3)', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:12, color:'rgb(239, 68, 68)', fontWeight:600 }}
                        title="Delete user permanently"
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor='rgb(239, 68, 68)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='rgba(239, 68, 68, 0.3)' }}
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span style={{ color:'var(--muted)', fontSize:12 }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
