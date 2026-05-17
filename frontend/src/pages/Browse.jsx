import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, useAuth } from '../App.jsx'
import { Search, SlidersHorizontal, Star, Heart, X } from 'lucide-react'
import { GigCard } from './Home.jsx'

const CATS = ['All','Development','Design','Writing','Marketing','Video','Data']
const SORTS = [
  { value:'-created_at',      label:'Newest' },
  { value:'-orders_completed',label:'Most Popular' },
  { value:'-rating',          label:'Top Rated' },
  { value:'price_basic',      label:'Price: Low to High' },
  { value:'-price_basic',     label:'Price: High to Low' },
]

export default function Browse() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()

  const [gigs,    setGigs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [favIds,  setFavIds]  = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const [query,    setQuery]    = useState(params.get('search')   || '')
  const [cat,      setCat]      = useState(params.get('category') || 'All')
  const [sort,     setSort]     = useState('-created_at')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    setLoading(true)
    const p = {}
    if (query && query !== 'All') p.search = query
    if (cat   && cat   !== 'All') p.category = cat
    if (sort)     p.sort      = sort
    if (minPrice) p.min_price = minPrice
    if (maxPrice) p.max_price = maxPrice
    api.get('/api/gigs/', { params: p }).then(r => setGigs(r.data)).catch(() => setGigs([])).finally(() => setLoading(false))
    if (user) api.get('/api/favourites/').then(r => setFavIds(r.data.map(f=>f.gig))).catch(()=>{})
  }, [query, cat, sort, minPrice, maxPrice, user])

  async function toggleFav(gigId) {
    if (!user) { navigate('/login'); return }
    const res = await api.post('/api/favourites/toggle/', { gig_id: gigId }).catch(() => null)
    if (res) setFavIds(p => res.data.favourited ? [...p, gigId] : p.filter(id=>id!==gigId))
  }

  const filtered = cat && cat !== 'All' ? gigs.filter(g => g.category === cat) : gigs

  return (
    <div style={{ paddingTop:64, minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'var(--card)', borderBottom:'1px solid var(--border)', padding:'28px 0' }}>
        <div className="page-wrap">
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:16 }}>Browse Gigs</h1>
          {/* Search */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:240, position:'relative' }}>
              <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }}/>
              <input className="form-control" placeholder="Search gigs..." value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft:42, height:44 }}/>
            </div>
            <select className="form-control" value={sort} onChange={e => setSort(e.target.value)} style={{ width:180, height:44 }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={() => setShowFilter(!showFilter)} className="btn btn-surface" style={{ height:44, gap:8 }}>
              <SlidersHorizontal size={15}/> Filters {showFilter && '▲'}
            </button>
          </div>
          {/* Filter panel */}
          {showFilter && (
            <div style={{ marginTop:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', padding:'16px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <label style={{ fontSize:12, color:'var(--muted)', fontWeight:600 }}>MIN PRICE</label>
                <input className="form-control" type="number" placeholder="₹0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} style={{ width:100, height:36 }}/>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <label style={{ fontSize:12, color:'var(--muted)', fontWeight:600 }}>MAX PRICE</label>
                <input className="form-control" type="number" placeholder="₹99999" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} style={{ width:100, height:36 }}/>
              </div>
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinPrice(''); setMaxPrice('') }} className="btn btn-ghost btn-sm">
                  <X size={13}/> Clear
                </button>
              )}
            </div>
          )}
          {/* Category tabs */}
          <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
                background: cat===c ? 'var(--brand)' : 'transparent',
                color: cat===c ? '#fff' : 'var(--muted)',
                borderColor: cat===c ? 'var(--brand)' : 'var(--border)',
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="page-wrap" style={{ padding:'28px 24px' }}>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20 }}>
          {loading ? 'Loading...' : `${filtered.length} gig${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:280 }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>No gigs found</h3>
            <p style={{ color:'var(--muted)' }}>Try different keywords or remove filters</p>
            <button onClick={() => { setQuery(''); setCat('All'); setMinPrice(''); setMaxPrice('') }} className="btn btn-primary" style={{ marginTop:20 }}>Clear All Filters</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {filtered.map(gig => (
              <div key={gig.id} style={{ position:'relative' }}>
                <GigCard gig={gig} onClick={() => navigate(`/gig/${gig.id}`)} onFav={toggleFav} favIds={favIds}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
