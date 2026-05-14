import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, useToast } from '../../App.jsx'
import { Eye, EyeOff, Search } from 'lucide-react'

export default function AdminGigs() {
  const toast    = useToast()
  const navigate = useNavigate()
  const [gigs,    setGigs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')

  useEffect(() => {
    api.get('/api/admin/gigs/').then(r=>setGigs(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function toggleGig(id, is_active) {
    try { await api.patch(`/api/admin/gigs/${id}/`, { is_active: !is_active }) } catch {}
    setGigs(p => p.map(g => g.id===id ? {...g, is_active:!is_active} : g))
    toast(`Gig ${is_active ? 'paused' : 'activated'}`)
  }

  const filtered = gigs.filter(g =>
    !query || g.title?.toLowerCase().includes(query.toLowerCase()) || g.seller_name?.toLowerCase().includes(query.toLowerCase())
  )
  const CAT_ICON = {'Development':'💻','Design':'🎨','Writing':'✍️','Marketing':'📣','Video':'🎬','Data':'📊'}

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Gig Management</h1>
      <p className="portal-page-sub">{gigs.length} total gigs · {gigs.filter(g=>g.is_active).length} active</p>
      <div style={{position:'relative',marginBottom:20}}>
        <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}/>
        <input className="form-control" placeholder="Search gigs or sellers..." value={query} onChange={e=>setQuery(e.target.value)} style={{paddingLeft:42,height:44}}/>
      </div>
      <div className="card" style={{overflow:'auto'}}>
        {loading ? [1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:56,margin:8}}/>) : (
          <table className="data-table">
            <thead><tr><th>Gig</th><th>Seller</th><th>Category</th><th>Price</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(g=>(
                <tr key={g.id}>
                  <td style={{maxWidth:200}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:18}}>{CAT_ICON[g.category]||'🛠️'}</span>
                      <span style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.title}</span>
                    </div>
                  </td>
                  <td style={{fontSize:13,color:'var(--muted)'}}>{g.seller_name}</td>
                  <td><span className="badge badge-purple">{g.category}</span></td>
                  <td style={{fontWeight:700,color:'var(--brand)'}}>₹{Number(g.price).toLocaleString()}</td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{g.orders_completed}</td>
                  <td><span className={`badge badge-${g.is_active?'green':'gray'}`}>{g.is_active?'Active':'Paused'}</span></td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>navigate(`/gig/${g.id}`)} className="btn btn-surface btn-sm" title="View"><Eye size={12}/></button>
                      <button onClick={()=>toggleGig(g.id,g.is_active)} className={`btn btn-sm ${g.is_active?'btn-ghost':'btn-success'}`}>
                        {g.is_active ? <EyeOff size={12}/> : <Eye size={12}/>}
                      </button>
                    </div>
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
