import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api, useAuth } from '../App.jsx'
import { Search, Star, ArrowRight, Zap, Shield, Clock, Users, TrendingUp, ChevronRight } from 'lucide-react'

const CATS = [
  { icon:'💻', name:'Development',  color:'#6366f1', bg:'rgba(99,102,241,0.15)',  count:'8.2k' },
  { icon:'🎨', name:'Design',       color:'#ec4899', bg:'rgba(236,72,153,0.15)',  count:'5.1k' },
  { icon:'✍️', name:'Writing',      color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  count:'3.8k' },
  { icon:'📣', name:'Marketing',    color:'#22c55e', bg:'rgba(34,197,94,0.15)',   count:'2.9k' },
  { icon:'🎬', name:'Video',        color:'#ef4444', bg:'rgba(239,68,68,0.15)',   count:'1.7k' },
  { icon:'📊', name:'Data',         color:'#14b8a6', bg:'rgba(20,184,166,0.15)', count:'2.3k' },
]

const STATS = [
  { value:'50K+',  label:'Freelancers', icon:<Users size={20}/> },
  { value:'200K+', label:'Projects Done', icon:<TrendingUp size={20}/> },
  { value:'98%',   label:'Satisfaction', icon:<Star size={20} fill="currentColor"/> },
  { value:'4.9★',  label:'Avg Rating', icon:<Zap size={20}/> },
]

const HOW = [
  { step:'01', title:'Post or Browse', desc:'Clients post projects or browse thousands of expert gigs instantly.', icon:'🔍' },
  { step:'02', title:'Connect',        desc:'Message sellers, review portfolios, and choose the perfect match.', icon:'🤝' },
  { step:'03', title:'Collaborate',    desc:'Work together with real-time updates and milestone tracking.', icon:'⚡' },
  { step:'04', title:'Pay Securely',   desc:'Funds released only when you approve the delivered work.', icon:'🔒' },
]

const MOCK_GIGS = [
  { id:1, title:'I will build a full-stack React + Django web app', seller_name:'Ranvir Singh', seller_avatar:'', category:'Development', price_basic:2499, rating:4.9, review_count:87, orders_completed:128, badge:'Top Rated' },
  { id:2, title:'I will design a modern brand identity and logo',   seller_name:'Priya Kapoor', seller_avatar:'', category:'Design',       price_basic:999,  rating:4.8, review_count:204, orders_completed:310, badge:'Best Seller' },
  { id:3, title:'I will write SEO-optimized blog posts and articles',seller_name:'Sara Liu',    seller_avatar:'', category:'Writing',      price_basic:499,  rating:4.7, review_count:156, orders_completed:249, badge:'Popular' },
  { id:4, title:'I will create professional video ads for social media',seller_name:'James T.', seller_avatar:'', category:'Video',        price_basic:1499, rating:5.0, review_count:42, orders_completed:67, badge:'Top Rated' },
  { id:5, title:'I will build and manage your Google Ads campaigns', seller_name:'Neha S.',    seller_avatar:'', category:'Marketing',    price_basic:799,  rating:4.8, review_count:93, orders_completed:187, badge:'Best Seller' },
  { id:6, title:'I will analyse your data and build ML models',     seller_name:'Alex Chen',   seller_avatar:'', category:'Data',         price_basic:3499, rating:4.9, review_count:38, orders_completed:54, badge:'Top Rated' },
]

const TESTIMONIALS = [
  { name:'Michael Torres', role:'Startup Founder', avatar:'MT', text:'Found an amazing React developer in under 10 minutes. The quality of work was exceptional and communication was smooth throughout. Highly recommend!', rating:5 },
  { name:'Lisa Park',      role:'E-commerce Owner', avatar:'LP', text:'We hired a designer and within 3 days had a complete brand identity. The platform made it incredibly easy to find verified, skilled professionals.', rating:5 },
  { name:'Raj Patel',      role:'Marketing Director', avatar:'RP', text:'Our campaign ROI doubled after working with a freelancer we found here. The talent pool is unmatched. Will keep coming back!', rating:5 },
]

const GigCard = ({ gig, onFav, favIds, onClick }) => {
  const initials = gig.seller_name?.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)
  const isFav = favIds?.includes(gig.id)
  return (
    <div className="gig-card" onClick={onClick}>
      <div className="gig-card-img" style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>
        {{'Development':'💻','Design':'🎨','Writing':'✍️','Marketing':'📣','Video':'🎬','Data':'📊'}[gig.category] || '🛠️'}
      </div>
      <div className="gig-card-body">
        <div className="gig-card-seller">
          {gig.seller_avatar ? <img src={gig.seller_avatar} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }}/> : <div className="gig-card-avatar">{initials}</div>}
          <span style={{ fontSize:12, color:'var(--muted)', fontWeight:500 }}>{gig.seller_name}</span>
          {gig.badge && <span className="badge badge-purple" style={{ marginLeft:'auto', fontSize:10 }}>{gig.badge}</span>}
        </div>
        <p className="gig-card-title">{gig.title}</p>
        <div className="gig-card-footer">
          <div className="gig-card-rating">
            <Star size={12} fill="#f59e0b" color="#f59e0b"/>
            <span style={{ fontWeight:700, color:'var(--text)', fontSize:12 }}>{gig.rating}</span>
            <span style={{ color:'var(--muted)', fontSize:12 }}>({gig.review_count})</span>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'var(--muted)' }}>Starting at</div>
            <div className="gig-card-price">₹{Number(gig.price_basic).toLocaleString()}</div>
          </div>
        </div>
      </div>
      {onFav && (
        <button onClick={e => { e.stopPropagation(); onFav(gig.id) }} style={{
          position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%',
          background: isFav ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.4)',
          border:'none', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14
        }}>
          {isFav ? '❤️' : '🤍'}
        </button>
      )}
    </div>
  )
}

export { GigCard }

export default function Home() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [query, setQuery]   = useState('')
  const [gigs,  setGigs]    = useState(MOCK_GIGS)
  const [favIds, setFavIds] = useState([])

  useEffect(() => {
    api.get('/api/gigs/').then(r => { if (r.data.length) setGigs(r.data) }).catch(() => {})
    if (user) {
      api.get('/api/favourites/').then(r => setFavIds(r.data.map(f => f.gig))).catch(() => {})
    }
  }, [user])

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/browse?search=${encodeURIComponent(query.trim())}`)
  }

  async function toggleFav(gigId) {
    if (!user) { navigate('/login'); return }
    const res = await api.post('/api/favourites/toggle/', { gig_id: gigId }).catch(() => null)
    if (res) setFavIds(p => res.data.favourited ? [...p, gigId] : p.filter(id => id !== gigId))
  }

  return (
    <div style={{ paddingTop:64 }}>

      {/* ── HERO ── */}
      <section className="hero-gradient" style={{ padding:'100px 0 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'10%', left:'20%', width:400, height:400, borderRadius:'50%', background:'rgba(99,102,241,0.08)', filter:'blur(80px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'0', right:'15%', width:300, height:300, borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(60px)', pointerEvents:'none' }}/>

        <div className="page-wrap" style={{ position:'relative', zIndex:1 }}>
          <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:30, padding:'6px 16px', marginBottom:24, fontSize:13, color:'var(--brand)', fontWeight:600 }}>
              <Zap size={13} fill="currentColor"/> Empowering the Future of Work
            </div>
            <h1 style={{ fontSize:'clamp(2.2rem,6vw,4rem)', fontWeight:900, lineHeight:1.1, marginBottom:20, letterSpacing:'-1.5px' }}>
              Hire World-Class<br/>
              <span style={{ background:'linear-gradient(135deg,var(--brand),#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Freelancers
              </span>
            </h1>
            <p style={{ fontSize:'clamp(1rem,2.5vw,1.2rem)', color:'var(--text2)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.6 }}>
              Connect with top talent across 200+ skill categories. Scale your team instantly with verified experts.
            </p>
            <form onSubmit={handleSearch} style={{ display:'flex', maxWidth:560, margin:'0 auto 32px', gap:8 }}>
              <div style={{ flex:1, position:'relative' }}>
                <Search size={18} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }}/>
                <input
                  className="form-control"
                  style={{ paddingLeft:46, height:52, borderRadius:12, fontSize:15 }}
                  placeholder='Try "React developer", "Logo design"...'
                  value={query} onChange={e => setQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius:12, paddingInline:28, height:52 }}>Search</button>
            </form>
            <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
              {['React', 'UI Design', 'SEO Writing', 'Data Analysis', 'Video Editing'].map(t => (
                <button key={t} onClick={() => navigate(`/browse?search=${t}`)} style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text2)', padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.color='var(--brand)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)' }}
                >{t}</button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background:'var(--card)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'32px 0' }}>
        <div className="page-wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, textAlign:'center' }}>
            {STATS.map(s => (
              <motion.div key={s.label} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.4 }}>
                <div style={{ color:'var(--brand)', display:'flex', justifyContent:'center', marginBottom:8 }}>{s.icon}</div>
                <p style={{ fontSize:28, fontWeight:900, color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.value}</p>
                <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="page-wrap">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
            <div>
              <h2 style={{ fontSize:28, fontWeight:800 }}>Popular Categories</h2>
              <p style={{ color:'var(--muted)', marginTop:4 }}>Find experts in every discipline</p>
            </div>
            <button onClick={() => navigate('/categories')} className="btn btn-surface" style={{ display:'flex', alignItems:'center', gap:6 }}>View All <ChevronRight size={14}/></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16 }}>
            {CATS.map(c => (
              <motion.div key={c.name} whileHover={{ y:-4 }} transition={{ duration:0.2 }}>
                <div className="cat-card" onClick={() => navigate(`/browse?category=${c.name}`)}>
                  <div className="cat-card-icon" style={{ background:c.bg, color:c.color }}><span style={{ fontSize:26 }}>{c.icon}</span></div>
                  <p style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:4 }}>{c.name}</p>
                  <p style={{ fontSize:12, color:'var(--muted)' }}>{c.count} active gigs</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GIGS ── */}
      <section className="section" style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)' }}>
        <div className="page-wrap">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
            <div>
              <h2 style={{ fontSize:28, fontWeight:800 }}>Featured Gigs</h2>
              <p style={{ color:'var(--muted)', marginTop:4 }}>Hand-picked top services this week</p>
            </div>
            <button onClick={() => navigate('/browse')} className="btn btn-outline" style={{ display:'flex', alignItems:'center', gap:6 }}>Browse All <ArrowRight size={14}/></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {gigs.slice(0,6).map((gig,i) => (
              <motion.div key={gig.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07, duration:0.4 }} style={{ position:'relative' }}>
                <GigCard gig={gig} onClick={() => navigate(`/gig/${gig.id}`)} onFav={toggleFav} favIds={favIds}/>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="page-wrap" style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>How FreelanceHub Works</h2>
          <p style={{ color:'var(--muted)', marginBottom:48, maxWidth:500, margin:'0 auto 48px' }}>Get your project done in 4 simple steps</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24 }}>
            {HOW.map((h, i) => (
              <motion.div key={h.step} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.4 }}>
                <div className="card" style={{ padding:32, textAlign:'center', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:12, right:16, fontSize:48, fontWeight:900, color:'rgba(99,102,241,0.06)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{h.step}</div>
                  <div style={{ fontSize:36, marginBottom:16 }}>{h.icon}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:10 }}>{h.title}</h3>
                  <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)' }}>
        <div className="page-wrap">
          <h2 style={{ fontSize:28, fontWeight:800, textAlign:'center', marginBottom:48 }}>What Our Users Say</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.4 }}>
                <div className="card" style={{ padding:28 }}>
                  <div style={{ color:'#f59e0b', fontSize:16, marginBottom:16 }}>{'★'.repeat(t.rating)}</div>
                  <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>"{t.text}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:13 }}>{t.avatar}</div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:13 }}>{t.name}</p>
                      <p style={{ fontSize:12, color:'var(--muted)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'80px 0', background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))', borderTop:'1px solid rgba(99,102,241,0.2)' }}>
        <div className="page-wrap" style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, marginBottom:16 }}>Ready to Get Started?</h2>
          <p style={{ color:'var(--text2)', fontSize:16, marginBottom:36, maxWidth:480, margin:'0 auto 36px' }}>Join 50,000+ professionals growing their careers on FreelanceHub.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate(user ? '/browse' : '/register')} className="btn btn-primary btn-lg" style={{ borderRadius:12, paddingInline:36 }}>
              {user ? '🔍 Browse Gigs' : '🚀 Get Started Free'}
            </button>
            <button onClick={() => navigate('/sellers')} className="btn btn-ghost btn-lg" style={{ borderRadius:12 }}>
              Find Freelancers <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
