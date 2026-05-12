import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../App.jsx'
import { motion, AnimatePresence } from 'framer-motion'

function AuthLayout({ children, title, sub }) {
  return (
    <div style={{
      minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:24
    }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🚀</div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:6, color:'var(--text)' }}>{title}</h1>
          <p style={{ color:'var(--muted)', fontSize:14 }}>{sub}</p>
        </div>
        <div className="card" style={{ padding:32 }}>{children}</div>
      </div>
    </div>
  )
}

// Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export function Login() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handle(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login/', form)
      login(res.data.user, res.data.token)
      toast('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast(err.response?.data?.message || 'Invalid email or password', 'error')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your FreelanceHub account">

      <form onSubmit={handle}>
        <div className="form-group">
          <label>Email address</label>
          <input className="form-control" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required />
        </div>
        <button className="btn btn-primary" style={{width:'100%', marginTop:8}} disabled={loading}>
          {loading ? <><span className="spinner"/>Signing in...</> : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginTop:20 }}>
        No account? <Link to="/register" style={{color:'var(--brand)',fontWeight:600}}>Create one</Link>
      </p>
    </AuthLayout>
  )
}

export function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'buyer', bio:'', skills:'' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handle(e) {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (form.skills) payload.skills = form.skills.split(',').map(s=>s.trim())
      const res = await api.post('/api/auth/register/', payload)
      login(res.data.user, res.data.token)
      toast('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch {
      // Demo mode
      const newUser = {
        id: 'u_' + Date.now(),
        name: form.name,
        email: form.email,
        role: form.role,
        joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        bio: form.bio || '',
        skills: form.skills ? form.skills.split(',').map(s=>s.trim()) : [],
        completedOrders: 0,
        rating: null
      }
      login(newUser, 'demo-token-' + Date.now())
      toast('Account created! Welcome 🎉')
      navigate('/dashboard')
    } finally { setLoading(false) }
  }

  const nextStep = (e) => {
    e.preventDefault()
    if (step === 1 && (!form.name || !form.email || !form.password)) {
      toast('Please fill all fields', 'error')
      return
    }
    if (step === 2 && !form.role) return
    setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => s - 1)

  return (
    <div style={{
      minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:24
    }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        {/* Progress Bar */}
        <div style={{ display:'flex', gap:8, marginBottom:32, justifyContent:'center' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height:4, width:40, borderRadius:2,
              background: i <= step ? 'var(--brand)' : 'var(--border)',
              transition:'background 0.3s'
            }} />
          ))}
        </div>

        <div className="card" style={{ padding:40, overflow:'hidden', position:'relative', minHeight:420 }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>👋</div>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>Create an account</h1>
                  <p style={{ color:'var(--muted)', fontSize:14 }}>Join the FreelanceHub community</p>
                </div>
                <form onSubmit={nextStep}>
                  <div className="form-group">
                    <label>Full name</label>
                    <input className="form-control" placeholder="Ranvir Singh" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label>Email address</label>
                    <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input className="form-control" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required minLength={8} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:16}}>Continue ➔</button>
                </form>
                <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginTop:20 }}>
                  Have an account? <Link to="/login" style={{color:'var(--brand)',fontWeight:600}}>Sign in</Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>🎯</div>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>What brings you here?</h1>
                  <p style={{ color:'var(--muted)', fontSize:14 }}>Select how you want to use the platform</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    ['buyer','🛒','Hire Talent','I want to find professionals for my projects'],
                    ['seller','💼','Offer Services','I want to sell my skills and get hired']
                  ].map(([v,icon,label,desc]) => (
                    <div key={v} onClick={() => setForm(p=>({...p,role:v}))} style={{
                      padding:20, borderRadius:12, border: form.role===v ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                      background: form.role===v ? 'var(--brand-l)' : 'var(--input-bg)',
                      cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:16
                    }}>
                      <div style={{fontSize:32}}>{icon}</div>
                      <div>
                        <div style={{fontSize:16,fontWeight:700,color:form.role===v?'var(--brand)':'var(--text)',marginBottom:4}}>{label}</div>
                        <div style={{fontSize:13,color:form.role===v?'var(--brand)':'var(--muted)'}}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:12, marginTop:24 }}>
                  <button className="btn btn-ghost" onClick={prevStep}>Back</button>
                  <button className="btn btn-primary" style={{flex:1}} onClick={() => {
                    if(form.role === 'buyer') handle() // Skip step 3 for buyers
                    else nextStep({preventDefault:()=>{}})
                  }}>
                    {form.role === 'buyer' ? (loading ? 'Creating...' : 'Create Account ✓') : 'Continue ➔'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>⭐</div>
                  <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)' }}>Build your profile</h1>
                  <p style={{ color:'var(--muted)', fontSize:14 }}>Stand out to potential clients</p>
                </div>
                <form onSubmit={handle}>
                  <div className="form-group">
                    <label>Professional Bio (Optional)</label>
                    <textarea className="form-control" placeholder="I am a full-stack developer with 3 years of experience..." value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))} style={{minHeight:80}} />
                  </div>
                  <div className="form-group">
                    <label>Skills (Comma separated, Optional)</label>
                    <input className="form-control" placeholder="React, Node.js, Design" value={form.skills} onChange={e => setForm(p=>({...p,skills:e.target.value}))} />
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:24 }}>
                    <button type="button" className="btn btn-ghost" onClick={prevStep}>Back</button>
                    <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={loading}>
                      {loading ? <><span className="spinner"/>Finishing...</> : 'Complete Profile ✓'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Login
