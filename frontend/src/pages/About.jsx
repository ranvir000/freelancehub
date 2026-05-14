import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Briefcase, Star, Shield, Zap, Heart } from 'lucide-react'

const TEAM = [
  { initials:'RS', name:'Ranvir Singh', role:'Founder & CEO',    skills:'Django · React · Cloud' },
  { initials:'MK', name:'Mukesh',       role:'Co-Founder & CTO', skills:'Node.js · React · DevOps' },
]
const VALUES = [
  { icon:<Shield size={24}/>, title:'Trust First',   desc:'Every seller is verified. Secure payments and dispute resolution built in.' },
  { icon:<Zap size={24}/>,    title:'Fast Matching',  desc:'AI-powered recommendations connect you with the perfect talent in seconds.' },
  { icon:<Heart size={24}/>,  title:'Quality Work',   desc:'Only top-rated freelancers pass our quality standards. Satisfaction guaranteed.' },
  { icon:<Star size={24}/>,   title:'Fair Pricing',   desc:'Transparent pricing with no hidden fees. Pay only for work you approve.' },
]

export default function About() {
  const navigate = useNavigate()
  return (
    <div style={{ paddingTop:64 }}>
      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg,var(--bg2),var(--bg))', borderBottom:'1px solid var(--border)', padding:'80px 0', textAlign:'center' }}>
        <div className="page-wrap">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <span style={{ background:'var(--brand-l)', color:'var(--brand)', padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700, marginBottom:20, display:'inline-block' }}>About FreelanceHub</span>
            <h1 style={{ fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:900, marginBottom:16, letterSpacing:'-1px' }}>
              Where Talent Meets<br/>
              <span style={{ background:'linear-gradient(135deg,var(--brand),#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Opportunity</span>
            </h1>
            <p style={{ color:'var(--text2)', fontSize:17, maxWidth:560, margin:'0 auto 36px', lineHeight:1.7 }}>
              FreelanceHub connects ambitious businesses with the world's best freelance talent — making quality work accessible, fast, and reliable.
            </p>
            <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('/browse')} className="btn btn-primary btn-lg" style={{ borderRadius:12 }}>Browse Gigs</button>
              <button onClick={() => navigate('/register')} className="btn btn-ghost btn-lg" style={{ borderRadius:12 }}>Join as Freelancer</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:'var(--card)', borderBottom:'1px solid var(--border)', padding:'36px 0' }}>
        <div className="page-wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, textAlign:'center' }}>
            {[['50K+','Registered Users'],['200K+','Projects Completed'],['98%','Client Satisfaction'],['4.9/5','Average Rating']].map(([v,l]) => (
              <div key={l}>
                <p style={{ fontSize:32, fontWeight:900, color:'var(--brand)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{v}</p>
                <p style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="page-wrap">
          <h2 style={{ fontSize:28, fontWeight:800, textAlign:'center', marginBottom:48 }}>What We Stand For</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.4 }}>
                <div className="card" style={{ padding:28, textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:'var(--brand-l)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--brand)', margin:'0 auto 16px' }}>{v.icon}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:10 }}>{v.title}</h3>
                  <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)' }}>
        <div className="page-wrap">
          <h2 style={{ fontSize:28, fontWeight:800, textAlign:'center', marginBottom:48 }}>Meet the Team</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20 }}>
            {TEAM.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.4 }}>
                <div className="card" style={{ padding:28, textAlign:'center' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:`linear-gradient(135deg,${['#6366f1','#14b8a6'][i]},${['#8b5cf6','#06b6d4'][i]})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:18, margin:'0 auto 16px' }}>{m.initials}</div>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{m.name}</h3>
                  <p style={{ fontSize:12, color:'var(--brand)', fontWeight:600, marginBottom:8 }}>{m.role}</p>
                  <p style={{ fontSize:11, color:'var(--muted)' }}>{m.skills}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 0', textAlign:'center' }}>
        <div className="page-wrap">
          <h2 style={{ fontSize:28, fontWeight:900, marginBottom:12 }}>Ready to Get Started?</h2>
          <p style={{ color:'var(--muted)', marginBottom:28, maxWidth:400, margin:'0 auto 28px' }}>Join tens of thousands of businesses and freelancers already on FreelanceHub.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{ borderRadius:12 }}>Create Free Account</button>
            <button onClick={() => navigate('/sellers')} className="btn btn-ghost btn-lg" style={{ borderRadius:12 }}>Find Freelancers</button>
          </div>
        </div>
      </section>
    </div>
  )
}
