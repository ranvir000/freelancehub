import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api, useAuth, useToast } from '../../App.jsx'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const CATS = ['Development','Design','Writing','Marketing','Video','Data']

const STEPS = ['Basics','Pricing','Requirements']

export default function SellerPostGig() {
  const { user }  = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({
    title:'', category:'Development', description:'',
    price_basic:'', price_standard:'', price_premium:'',
    delivery_basic:'7', delivery_standard:'14', delivery_premium:'21',
    requirements:'', faq:'',
  })
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  async function submit() {
    setLoading(true)
    try {
      await api.post('/api/gigs/', form)
      toast('Gig published! 🎉')
      navigate('/seller/gigs')
    } catch(err) {
      toast(err.response?.data?.error || 'Failed to publish gig', 'error')
    } finally { setLoading(false) }
  }

  const canNext = [
    form.title.length>10 && form.description.length>30,
    form.price_basic && form.price_standard && form.price_premium,
    true,
  ]

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Post a New Gig</h1>
      <p className="portal-page-sub">Create your service listing in 3 easy steps</p>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
        {STEPS.map((s,i) => (
          <React.Fragment key={s}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700,
                background: i<step ? 'var(--success)' : i===step ? 'var(--brand)' : 'var(--surface)',
                color: i<=step ? '#fff' : 'var(--muted)', transition:'all 0.3s' }}>
                {i<step ? <Check size={14}/> : i+1}
              </div>
              <span style={{ fontSize:13, fontWeight: i===step?700:400, color: i===step?'var(--text)':'var(--muted)' }}>{s}</span>
            </div>
            {i<STEPS.length-1 && <div style={{ flex:1, height:2, background: i<step?'var(--brand)':'var(--border)', margin:'0 12px', transition:'all 0.3s' }}/>}
          </React.Fragment>
        ))}
      </div>

      <div className="card" style={{ padding:32, maxWidth:680 }}>
        <AnimatePresence mode="wait">
          {step===0 && (
            <motion.div key="s0" initial={{x:40,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-40,opacity:0}} transition={{duration:0.25}}>
              <h2 style={{ fontSize:18, fontWeight:800, marginBottom:24 }}>Tell us about your service</h2>
              <div className="form-group">
                <label>Gig Title</label>
                <input className="form-control" placeholder='e.g. "I will build a full-stack web application"' value={form.title} onChange={e=>set('title',e.target.value)} required/>
                <p style={{ fontSize:11, color:'var(--muted)', marginTop:6 }}>{form.title.length}/80 characters</p>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e=>set('category',e.target.value)}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Description</label>
                <textarea className="form-control" placeholder="Describe what you'll deliver, your process, and why clients should choose you..." value={form.description} onChange={e=>set('description',e.target.value)} style={{ minHeight:140 }} required/>
              </div>
            </motion.div>
          )}
          {step===1 && (
            <motion.div key="s1" initial={{x:40,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-40,opacity:0}} transition={{duration:0.25}}>
              <h2 style={{ fontSize:18, fontWeight:800, marginBottom:24 }}>Set your pricing packages</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {[['basic','Basic','Core deliverable'],['standard','Standard','Most popular ⭐'],['premium','Premium','Maximum value']].map(([key,label,sub])=>(
                  <div key={key} style={{ padding:20, borderRadius:12, border:`2px solid ${key==='standard'?'var(--brand)':'var(--border)'}`, background: key==='standard'?'var(--brand-l)':'var(--bg2)' }}>
                    <p style={{ fontSize:13, fontWeight:800, color:'var(--brand)', marginBottom:4 }}>{label}</p>
                    <p style={{ fontSize:11, color:'var(--muted)', marginBottom:14 }}>{sub}</p>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input className="form-control" type="number" placeholder="999" value={form[`price_${key}`]} onChange={e=>set(`price_${key}`,e.target.value)} required/>
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label>Delivery (days)</label>
                      <input className="form-control" type="number" value={form[`delivery_${key}`]} onChange={e=>set(`delivery_${key}`,e.target.value)} required/>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step===2 && (
            <motion.div key="s2" initial={{x:40,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-40,opacity:0}} transition={{duration:0.25}}>
              <h2 style={{ fontSize:18, fontWeight:800, marginBottom:24 }}>Final details</h2>
              <div className="form-group">
                <label>Requirements from buyer</label>
                <textarea className="form-control" placeholder="What do you need from the buyer to get started? e.g. brand colors, target audience, reference links..." value={form.requirements} onChange={e=>set('requirements',e.target.value)} style={{ minHeight:100 }}/>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>FAQ (optional)</label>
                <textarea className="form-control" placeholder="Common questions and answers about this service..." value={form.faq} onChange={e=>set('faq',e.target.value)} style={{ minHeight:100 }}/>
              </div>

              {/* Preview */}
              <div style={{ marginTop:24, padding:20, borderRadius:12, background:'var(--bg2)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:12 }}>Gig Preview</p>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>{form.title || 'Your Gig Title'}</h3>
                <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--muted)' }}>
                  <span>📂 {form.category}</span>
                  <span>💰 From ₹{form.price_basic || '—'}</span>
                  <span>📦 {form.delivery_basic}d delivery</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display:'flex', gap:12, marginTop:32 }}>
          {step>0 && <button onClick={()=>setStep(p=>p-1)} className="btn btn-ghost"><ChevronLeft size={15}/> Back</button>}
          <div style={{ flex:1 }}/>
          {step<STEPS.length-1 ? (
            <button onClick={()=>setStep(p=>p+1)} className="btn btn-primary" disabled={!canNext[step]}>
              Continue <ChevronRight size={15}/>
            </button>
          ) : (
            <button onClick={submit} className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"/> Publishing...</> : '🚀 Publish Gig'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
