import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../App.jsx'

// ── Mock gigs (shown when backend not connected) ──────────────────────────────
const MOCK = [
  { id:1, title:'I will build a full-stack web app with React & Django', category:'Development', seller_name:'Ranvir Singh', price:2499, rating:'4.9', review_count:48, badge:'Top Rated' },
  { id:2, title:'I will design a modern logo for your brand',            category:'Design',      seller_name:'Priya Kapoor', price:999,  rating:'4.8', review_count:128, badge:'Best Seller' },
  { id:3, title:'I will create a responsive website with React',         category:'Development', seller_name:'Amit Verma',  price:1499, rating:'4.7', review_count:89,  badge:null },
  { id:4, title:'I will write SEO-optimized blog posts for your site',   category:'Writing',     seller_name:'Sara Liu',    price:499,  rating:'4.9', review_count:203, badge:'Popular' },
  { id:5, title:'I will build a REST API with Django & PostgreSQL',      category:'Development', seller_name:'Ranvir Singh', price:1999, rating:'5.0', review_count:32,  badge:null },
  { id:6, title:'I will design a stunning UI/UX for your app',           category:'Design',      seller_name:'Priya Kapoor', price:1499, rating:'4.8', review_count:76,  badge:'New' },
]

const CATS = ['All','Development','Design','Writing','Marketing']
const ICONS = { Development:'💻', Design:'🎨', Writing:'✍️', Marketing:'📣', default:'🔧' }
const COLORS = { Development:'linear-gradient(135deg,#6366f1,#8b5cf6)', Design:'linear-gradient(135deg,#ec4899,#f43f5e)', Writing:'linear-gradient(135deg,#10b981,#059669)', Marketing:'linear-gradient(135deg,#f59e0b,#ef4444)', default:'linear-gradient(135deg,#6366f1,#06b6d4)' }

function GigCard({ gig }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/gig/${gig.id}`)} style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
      overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.12)' }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
      {/* Thumbnail */}
      <div style={{
        height: 160, background: COLORS[gig.category] || COLORS.default,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48, position: 'relative'
      }}>
        {ICONS[gig.category] || ICONS.default}
        {gig.badge && (
          <span style={{
            position:'absolute', top:10, left:10,
            background:'#fff', color:'var(--brand)',
            fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6
          }}>{gig.badge}</span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{
            width:24, height:24, borderRadius:'50%', background:'var(--brand)',
            color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center'
          }}>{gig.seller_name?.slice(0,2).toUpperCase()}</div>
          <span style={{ fontSize:12, color:'var(--muted)' }}>{gig.seller_name}</span>
        </div>
        <p style={{
          fontSize:13, fontWeight:500, lineHeight:1.45, marginBottom:12,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
        }}>{gig.title}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span className="stars">★ {gig.rating} <span style={{color:'var(--muted)',fontSize:11}}>({gig.review_count})</span></span>
          <span style={{ fontSize:13, color:'var(--muted)' }}>
            From <strong style={{ color:'var(--brand)', fontSize:15 }}>₹{Number(gig.price).toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [gigs, setGigs]     = useState([])
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchGigs() }, [])
  useEffect(() => { fetchGigs() }, [cat])

  async function fetchGigs() {
    setLoading(true)
    try {
      const params = {}
      if (cat !== 'All') params.category = cat
      const res = await api.get('/api/gigs/', { params })
      setGigs(res.data.length ? res.data : MOCK.filter(g => cat === 'All' || g.category === cat))
    } catch {
      setGigs(cat === 'All' ? MOCK : MOCK.filter(g => g.category === cat))
    } finally { setLoading(false) }
  }

  function handleSearch(e) {
    e.preventDefault()
    const filtered = MOCK.filter(g => g.title.toLowerCase().includes(search.toLowerCase()))
    setGigs(filtered)
  }

  const shown = search
    ? gigs.filter(g => g.title.toLowerCase().includes(search.toLowerCase()))
    : gigs

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(99,102,241,0.2)' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:200, height:200, borderRadius:'50%', background:'rgba(139,92,246,0.2)' }}/>

        <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
          <div className="badge badge-purple" style={{ marginBottom:16, fontSize:12 }}>
            🚀 India's #1 Student Freelance Platform
          </div>
          <h1 style={{ color:'#fff', fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, lineHeight:1.15, marginBottom:20 }}>
            Find the perfect<br/>
            <span style={{ color:'#a5b4fc' }}>freelance service</span><br/>
            for your project
          </h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:17, marginBottom:32, lineHeight:1.6 }}>
            Connect with skilled professionals. Get quality work done fast.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display:'flex', maxWidth:520, margin:'0 auto',
            background:'#fff', borderRadius:12, overflow:'hidden',
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for any service..."
              style={{ flex:1, padding:'16px 20px', border:'none', fontSize:15, outline:'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius:0, padding:'0 28px', fontSize:15 }}>
              Search
            </button>
          </form>

          {/* Quick tags */}
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20, flexWrap:'wrap' }}>
            {['Web Design','Logo Design','React Dev','Django API','SEO Writing'].map(t => (
              <span key={t} onClick={() => setSearch(t)} style={{
                background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)',
                border:'1px solid rgba(255,255,255,0.2)', padding:'6px 14px',
                borderRadius:20, fontSize:12, cursor:'pointer'
              }}>{t}</span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:40 }}>
            {[['500+','Freelancers'],['1200+','Projects Done'],['4.9★','Avg Rating']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ color:'#a5b4fc', fontSize:22, fontWeight:800 }}>{n}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--border)',
        padding:'0 24px', display:'flex', gap:8, overflowX:'auto'
      }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding:'14px 18px', background:'transparent', border:'none',
            borderBottom: cat===c ? '2px solid var(--brand)' : '2px solid transparent',
            color: cat===c ? 'var(--brand)' : 'var(--muted)',
            fontWeight: cat===c ? 600 : 400, fontSize:14, cursor:'pointer',
            whiteSpace:'nowrap', transition:'all 0.15s'
          }}>{c}</button>
        ))}
      </div>

      {/* ── GIG GRID ── */}
      <div className="page-wrap" style={{ padding:'40px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700 }}>
              {cat === 'All' ? 'Popular Services' : `${cat} Services`}
            </h2>
            <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>{shown.length} services available</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/post-gig')}>
            + Post a Gig
          </button>
        </div>

        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:280 }}/>)}
          </div>
        ) : shown.length ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {shown.map(g => <GigCard key={g.id} gig={g}/>)}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:16 }}>No services found. Try a different search.</p>
          </div>
        )}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background:'#fff', padding:'60px 24px', borderTop:'1px solid var(--border)' }}>
        <div className="page-wrap">
          <h2 style={{ textAlign:'center', fontSize:28, fontWeight:800, marginBottom:8 }}>How it works</h2>
          <p style={{ textAlign:'center', color:'var(--muted)', marginBottom:48 }}>Get your project done in 3 simple steps</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32 }}>
            {[
              { n:'1', icon:'🔍', title:'Find a service', desc:'Browse hundreds of services or search for exactly what you need' },
              { n:'2', icon:'📋', title:'Place an order', desc:'Choose your package, describe your requirements, and pay securely' },
              { n:'3', icon:'✅', title:'Get it done', desc:'Receive your work, review it, and approve when satisfied' },
            ].map(s => (
              <div key={s.n} style={{ textAlign:'center' }}>
                <div style={{
                  width:60, height:60, borderRadius:'50%', background:'var(--brand-l)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:28, margin:'0 auto 16px'
                }}>{s.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0f172a', color:'rgba(255,255,255,0.5)', padding:'32px 24px', textAlign:'center', fontSize:13 }}>
        <div style={{ fontWeight:700, color:'#fff', fontSize:18, marginBottom:8 }}>
          Freelance<span style={{ color:'#818cf8' }}>Hub</span>
        </div>
        Built with React + Django · B.Tech CSE Final Year Project · GZSCCET, MRSPTU
      </footer>
    </div>
  )
}
