import React, { useState, useEffect } from 'react'
import { api, useToast } from '../../App.jsx'
import { Search, Shield } from 'lucide-react'

export default function AdminUsers() {
  const toast = useToast()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]   = useState('')

  useEffect(() => {
    api.get('/api/admin/users/').then(r=>setUsers(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function changeRole(id, role) {
    try { await api.patch(`/api/admin/users/${id}/`, { role }) } catch {}
    setUsers(p => p.map(u => u.id===id ? {...u, role} : u))
    toast(`User role changed to ${role}`)
  }

  const filtered = users.filter(u =>
    !query || u.name?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase())
  )

  const ROLE_COLOR = { buyer:'blue', seller:'purple', admin:'red' }

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">User Management</h1>
      <p className="portal-page-sub">{users.length} total users</p>

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
        <input className="form-control" placeholder="Search users by name or email..." value={query} onChange={e=>setQuery(e.target.value)} style={{paddingLeft:42,height:44}}/>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        {loading ? [1,2,3,4,5].map(i=><div key={i} className="skeleton" style={{height:56,margin:8}}/>) : (
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Gigs</th><th>Actions</th></tr></thead>
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
                    <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                      style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'4px 8px',fontSize:12,color:'var(--text)',cursor:'pointer'}}>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
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
