import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CATS = [
  { icon:'💻', name:'Development',  color:'#6366f1', bg:'rgba(99,102,241,0.15)',  desc:'Web, mobile, and software development',  count:'8.2k', tags:['React','Python','Node.js','Flutter'] },
  { icon:'🎨', name:'Design',       color:'#ec4899', bg:'rgba(236,72,153,0.15)',  desc:'Graphic design, UI/UX, and branding',    count:'5.1k', tags:['Logo','UI/UX','Figma','Branding'] },
  { icon:'✍️', name:'Writing',      color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  desc:'Content writing, copywriting, and SEO',  count:'3.8k', tags:['Blog Posts','Copywriting','SEO','Proofreading'] },
  { icon:'📣', name:'Marketing',    color:'#22c55e', bg:'rgba(34,197,94,0.15)',   desc:'Social media, SEO, and paid advertising', count:'2.9k', tags:['Google Ads','Social Media','Email','SEO'] },
  { icon:'🎬', name:'Video',        color:'#ef4444', bg:'rgba(239,68,68,0.15)',   desc:'Video editing, animation, and production', count:'1.7k', tags:['Editing','Animation','YouTube','Reels'] },
  { icon:'📊', name:'Data',         color:'#14b8a6', bg:'rgba(20,184,166,0.15)', desc:'Data science, analysis, and AI solutions', count:'2.3k', tags:['Python','Excel','ML','Tableau'] },
]

export default function Categories() {
  const navigate = useNavigate()
  return (
    <div style={{ paddingTop:64, minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(135deg,var(--bg2),var(--bg))', borderBottom:'1px solid var(--border)', padding:'48px 0 40px' }}>
        <div className="page-wrap" style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:36, fontWeight:900, marginBottom:12 }}>Browse Categories</h1>
          <p style={{ color:'var(--muted)', fontSize:16, maxWidth:480, margin:'0 auto' }}>
            Find experts in every skill — from code to creative
          </p>
        </div>
      </div>

      <div className="page-wrap" style={{ padding:'48px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
          {CATS.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08, duration:0.4 }}>
              <div className="card" onClick={() => navigate(`/browse?category=${c.name}`)}
                style={{ padding:28, cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=c.color; e.currentTarget.style.boxShadow=`0 12px 32px ${c.bg}` }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='' }}
              >
                <div style={{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:'50%', background:c.bg, filter:'blur(20px)', pointerEvents:'none' }}/>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{c.icon}</div>
                  <div>
                    <h3 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:2 }}>{c.name}</h3>
                    <p style={{ fontSize:12, color:'var(--muted)' }}>{c.count} active gigs</p>
                  </div>
                  <ArrowRight size={18} style={{ marginLeft:'auto', color:'var(--muted)', flexShrink:0 }}/>
                </div>
                <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16, lineHeight:1.5 }}>{c.desc}</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {c.tags.map(t => (
                    <span key={t} style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)', padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:500 }}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
