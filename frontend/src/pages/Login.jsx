import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../App.jsx'
import { useAuth, useToast } from '../App.jsx'

function AuthLayout({ children, title, sub }) {
  return (
    <div style={{
      minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--bg)', padding:24
    }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🚀</div>
          <h1 style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>{title}</h1>
          <p style={{ color:'var(--muted)', fontSize:14 }}>{sub}</p>
        </div>
        <div className="card" style={{ padding:32 }}>{children}</div>
      </div>
    </div>
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

  function demoLogin(role) {
    const demos = {
      buyer:  { id:1, name:'Alex Morgan',  email:'alex@demo.com',   role:'buyer'  },
      seller: { id:2, name:'Ranvir Singh', email:'ranvir@demo.com', role:'seller' },
      admin:  { id:3, name:'Admin User',   email:'admin@demo.com',  role:'admin'  },
    }
    login(demos[role], 'demo-token-' + role)
    toast(`Logged in as ${role} ✓`)
    navigate('/dashboard')
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

      <div style={{ margin:'20px 0', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
        — or try a demo account —
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {['buyer','seller','admin'].map(r => (
          <button key={r} className="btn btn-ghost btn-sm" onClick={() => demoLogin(r)}
            style={{ flexDirection:'column', gap:2, padding:'10px 6px' }}>
            <span>{r==='buyer'?'🛒':r==='seller'?'💼':'⚙️'}</span>
            <span style={{textTransform:'capitalize',fontSize:11}}>{r}</span>
          </button>
        ))}
      </div>

      <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginTop:20 }}>
        No account? <Link to="/register" style={{color:'var(--brand)',fontWeight:600}}>Create one</Link>
      </p>
    </AuthLayout>
  )
}

export function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'buyer' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handle(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register/', form)
      login(res.data.user, res.data.token)
      toast('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      // Demo mode — create account locally
      login({ id: Date.now(), name: form.name, email: form.email, role: form.role }, 'demo-token')
      toast('Account created! Welcome 🎉')
      navigate('/dashboard')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Join FreelanceHub" sub="Create your account and get started today">
      <form onSubmit={handle}>
        <div className="form-group">
          <label>Full name</label>
          <input className="form-control" placeholder="Ranvir Singh"
            value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
        </div>
        <div className="form-group">
          <label>Email address</label>
          <input className="form-control" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="form-control" type="password" placeholder="Min. 8 characters"
            value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required minLength={8} />
        </div>
        <div className="form-group">
          <label>I want to</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['buyer','🛒','Hire talent'],['seller','💼','Offer services']].map(([v,icon,label]) => (
              <div key={v} onClick={() => setForm(p=>({...p,role:v}))} style={{
                padding:12, borderRadius:8, border: form.role===v ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                background: form.role===v ? 'var(--brand-l)' : '#fff',
                cursor:'pointer', textAlign:'center', transition:'all 0.15s'
              }}>
                <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
                <div style={{fontSize:13,fontWeight:600,color:form.role===v?'var(--brand)':'var(--text)'}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" style={{width:'100%', marginTop:8}} disabled={loading}>
          {loading ? <><span className="spinner"/>Creating account...</> : 'Create Account'}
        </button>
      </form>
      <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)', marginTop:20 }}>
        Have an account? <Link to="/login" style={{color:'var(--brand)',fontWeight:600}}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default Login
