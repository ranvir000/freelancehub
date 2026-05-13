import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api, getGigImage } from '../App.jsx'

// ── 12 Mock gigs with local premium images ───────────const MOCK = [
  { id:1,  title:'I will build a full-stack web app with React & Django',    category:'Development', seller_name:'Ranvir Singh',  seller_id:'s1', price:2499, rating:'4.9', review_count:48,  badge:'Top Rated' },
  { id:2,  title:'I will design a modern logo for your brand',                category:'Design',      seller_name:'Neha Sharma',   seller_id:'s2', price:999,  rating:'4.8', review_count:128, badge:'Best Seller' },
  { id:3,  title:'I will create a responsive website with React',             category:'Development', seller_name:'Amit Verma',    seller_id:'s3', price:1499, rating:'4.7', review_count:89,  badge:null },
  { id:4,  title:'I will write SEO-optimized blog posts for your site',       category:'Writing',     seller_name:'Sara Liu',      seller_id:'s4', price:499,  rating:'4.9', review_count:203, badge:'Popular' },
  { id:5,  title:'I will build a REST API with Django & PostgreSQL',          category:'Development', seller_name:'Ranvir Singh',  seller_id:'s1', price:1999, rating:'5.0', review_count:32,  badge:null },
  { id:6,  title:'I will design a stunning UI/UX for your app',               category:'Design',      seller_name:'Neha Sharma',   seller_id:'s2', price:1499, rating:'4.8', review_count:76,  badge:'New' },
  { id:7,  title:'I will create a social media marketing strategy',           category:'Marketing',   seller_name:'Kiran Mehta',   seller_id:'s5', price:799,  rating:'4.7', review_count:61,  badge:null },
  { id:8,  title:'I will build a mobile app with React Native',               category:'Development', seller_name:'Arjun Patel',   seller_id:'s6', price:3499, rating:'4.9', review_count:44,  badge:'Top Rated' },
  { id:9,  title:'I will write professional technical documentation',         category:'Writing',     seller_name:'Sara Liu',      seller_id:'s4', price:699,  rating:'4.8', review_count:97,  badge:null },
  { id:10, title:'I will design brand identity and style guide',              category:'Design',      seller_name:'Neha Sharma',   seller_id:'s2', price:2199, rating:'4.9', review_count:53,  badge:'Popular' },
  { id:11, title:'I will run Google Ads campaigns and optimize ROI',          category:'Marketing',   seller_name:'Kiran Mehta',   seller_id:'s5', price:1299, rating:'4.6', review_count:38,  badge:null },
  { id:12, title:'I will set up a CI/CD pipeline with GitHub Actions',        category:'Development', seller_name:'Arjun Patel',   seller_id:'s6', price:1799, rating:'4.8', review_count:29,  badge:'New' },
].map(g => ({ ...g, img: getGigImage(g) }))

const CATS = ['All','Development','Design','Writing','Marketing']

function GigCard({ gig }) {
  const navigate = useNavigate()
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      onClick={() => navigate(`/gig/${gig.id}`)} style={{
        background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)',
        overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s',
      }}>
      {/* Thumbnail */}
      <div style={{ height: 170, overflow: 'hidden', position: 'relative' }}>
        {gig.img ? (
          <img src={gig.img} alt={gig.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onError={e => { e.target.style.display='none'; e.target.parentElement.style.background='linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
        )}
        {gig.badge && (
          <span style={{
            position:'absolute', top:12, left:12,
            background:'rgba(255,255,255,0.95)', color:'var(--brand)', backdropFilter:'blur(4px)',
            fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20,
            boxShadow:'0 4px 12px rgba(0,0,0,0.15)'
          }}>{gig.badge}</span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div
            onClick={e => { e.stopPropagation(); navigate(`/profile/${gig.seller_id}`) }}
            style={{
              width:26, height:26, borderRadius:'50%', background:'var(--brand)',
              color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', flexShrink: 0
            }}>{gig.seller_name?.slice(0,2).toUpperCase()}</div>
          <span
            onClick={e => { e.stopPropagation(); navigate(`/profile/${gig.seller_id}`) }}
            style={{ fontSize:13, fontWeight:500, color:'var(--muted)', cursor:'pointer' }}
            onMouseEnter={e => e.target.style.color='var(--brand)'}
            onMouseLeave={e => e.target.style.color='var(--muted)'}
          >{gig.seller_name}</span>
        </div>
        <p style={{
          fontSize:14, fontWeight:600, lineHeight:1.5, marginBottom:14, color:'var(--text)',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
        }}>{gig.title}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:12, marginTop:'auto' }}>
          <span className="stars">★ {gig.rating} <span style={{color:'var(--muted)',fontSize:12}}>({gig.review_count})</span></span>
          <span style={{ fontSize:13, color:'var(--muted)', fontWeight:500 }}>
            From <strong style={{ color:'var(--text)', fontSize:16, fontWeight:800 }}>₹{Number(gig.price).toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [gigs, setGigs]     = useState(MOCK)
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchGigs() }, [cat])

  async function fetchGigs() {
    // Show mock data immediately (already set), fetch real data in background
    const mockFiltered = cat === 'All' ? MOCK : MOCK.filter(g => g.category === cat)
    setGigs(mockFiltered)

    try {
      const params = {}
      if (cat !== 'All') params.category = cat
      const res = await api.get('/api/gigs/', { params })
      if (res.data.length) {
        let fetched = res.data.map(g => ({ ...g, img: getGigImage(g) }))
        setGigs(fetched)
      }
    } catch {
      // API failed — keep showing mock data (already displayed)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
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
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(99,102,241,0.2)' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:200, height:200, borderRadius:'50%', background:'rgba(139,92,246,0.2)' }}/>

        {/* Floating Animation Elements (Hidden on very small screens via CSS later if needed, but safe here) */}
        <motion.div animate={{ y:[-15,15,-15], rotate:[-2,2,-2] }} transition={{ repeat:Infinity, duration:6, ease:'easeInOut' }} style={{ position:'absolute', top:80, left:'10%', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', padding:'12px 20px', borderRadius:16, border:'1px solid rgba(255,255,255,0.2)', color:'#fff', gap:10, alignItems:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.2)', zIndex:10, display: window.innerWidth > 768 ? 'flex' : 'none' }}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'var(--success)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff'}}>✓</div>
          <div style={{textAlign:'left'}}><p style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginBottom:2}}>Order Completed</p><p style={{fontSize:15,fontWeight:700}}>₹14,999 Earned</p></div>
        </motion.div>
        
        <motion.div animate={{ y:[15,-15,15], rotate:[2,-2,2] }} transition={{ repeat:Infinity, duration:7, ease:'easeInOut' }} style={{ position:'absolute', bottom:100, right:'12%', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', padding:'12px 20px', borderRadius:16, border:'1px solid rgba(255,255,255,0.2)', color:'#fff', gap:10, alignItems:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.2)', zIndex:10, display: window.innerWidth > 768 ? 'flex' : 'none' }}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'var(--warning)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff'}}>⭐</div>
          <div style={{textAlign:'left'}}><p style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginBottom:2}}>New Review</p><p style={{fontSize:15,fontWeight:700}}>5.0 from Client</p></div>
        </motion.div>

        <div style={{ position:'relative', maxWidth:640, margin:'0 auto', zIndex:20 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="badge badge-purple" style={{ marginBottom:16, fontSize:12, padding: '6px 14px' }}>
            🚀 India's #1 Student Freelance Platform
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ color:'#fff', fontSize:'clamp(2.4rem,6vw,4rem)', fontWeight:800, lineHeight:1.2, marginBottom:24, letterSpacing:'-0.02em' }}>
            Find the perfect<br/>
            <span style={{ color:'#a5b4fc' }}>freelance service</span><br/>
            for your project
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ color:'rgba(255,255,255,0.8)', fontSize:18, marginBottom:40, lineHeight:1.6, fontWeight: 400 }}>
            Connect with top-tier professionals. Get guaranteed quality work done fast and securely.
          </motion.p>

          <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} onSubmit={handleSearch} style={{
            display:'flex', maxWidth:560, margin:'0 auto',
            background:'#fff', borderRadius:16, overflow:'hidden',
            boxShadow:'0 24px 80px rgba(0,0,0,0.4)', padding: 4
          }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for any service (e.g. Logo Design)..."
              style={{ flex:1, padding:'16px 24px', border:'none', fontSize:16, outline:'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius:12, padding:'0 32px', fontSize:15, fontWeight: 700 }}>
              Search
            </button>
          </motion.form>

          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20, flexWrap:'wrap' }}>
            {['Web Design','Logo Design','React Dev','Django API','SEO Writing'].map(t => (
              <span key={t} onClick={() => setSearch(t)} style={{
                background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)',
                border:'1px solid rgba(255,255,255,0.2)', padding:'6px 14px',
                borderRadius:20, fontSize:12, cursor:'pointer'
              }}>{t}</span>
            ))}
          </div>

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
        background:'var(--nav-bg)', borderBottom:'1px solid var(--border)',
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
            <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text)' }}>
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
      <div style={{ background:'var(--card)', padding:'80px 24px', borderTop:'1px solid var(--border)' }}>
        <div className="page-wrap">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ textAlign:'center', fontSize:32, fontWeight:800, marginBottom:12, color:'var(--text)', letterSpacing:'-0.02em' }}>How it works</h2>
            <p style={{ textAlign:'center', color:'var(--muted)', marginBottom:64, fontSize: 16 }}>Get your project done in 3 simple steps</p>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:40 }}>
            {[
              { icon:'🔍', title:'Find a service', desc:'Browse hundreds of services or search for exactly what you need with our AI-powered engine' },
              { icon:'📋', title:'Place an order', desc:'Choose your package, describe your requirements, and pay securely via our guaranteed escrow' },
              { icon:'✅', title:'Get it done', desc:'Receive your work, review it, and only approve payment when you are 100% satisfied' },
            ].map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ textAlign:'center' }}>
                <div style={{
                  width:80, height:80, borderRadius:'50%', background:'var(--brand-l)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:36, margin:'0 auto 24px', boxShadow: 'inset 0 4px 12px rgba(99,102,241,0.1)'
                }}>{s.icon}</div>
                <h3 style={{ fontSize:20, fontWeight:800, marginBottom:12, color:'var(--text)' }}>{s.title}</h3>
                <p style={{ fontSize:15, color:'var(--muted)', lineHeight:1.7 }}>{s.desc}</p>
              </motion.div>
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
