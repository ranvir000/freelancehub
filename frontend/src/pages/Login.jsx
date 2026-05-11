import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../App.jsx'

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

  function handleGoogle() {
    // Demo: simulate Google login
    const googleUser = {
      id: 'g1', name: 'Google User', email: 'googleuser@gmail.com', role: 'buyer',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    }
    login(googleUser, 'google-demo-token')
    toast('Signed in with Google ✓')
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your FreelanceHub account">
      {/* Google button */}
      <button onClick={handleGoogle} style={{
        width:'100%', padding:'11px 16px', borderRadius:8,
        border:'1.5px solid var(--border)', background:'var(--card)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        fontSize:14, fontWeight:600, color:'var(--text)', cursor:'pointer',
        marginBottom:20, transition:'all 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--brand)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
      >
        <GoogleIcon /> Continue with Google
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ flex:1, height:1, background:'var(--border)' }}/>
        <span style={{ fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>or sign in with email</span>
        <div style={{ flex:1, height:1, background:'var(--border)' }}/>
      </div>

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
    } catch {
      // Demo mode — create account locally with a proper id
      const newUser = {
        id: 'u_' + Date.now(),
        name: form.name,
        email: form.email,
        role: form.role,
        joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        bio: '',
        skills: [],
        completedOrders: 0,
        rating: null
      }
      login(newUser, 'demo-token-' + Date.now())
      toast('Account created! Welcome 🎉')
      navigate('/dashboard')
    } finally { setLoading(false) }
  }

  function handleGoogle() {
    const googleUser = {
      id: 'g_' + Date.now(), name: 'Google User', email: 'googleuser@gmail.com', role: form.role
    }
    login(googleUser, 'google-demo-token')
    toast('Signed up with Google ✓')
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Join FreelanceHub" sub="Create your account and get started today">
      <button onClick={handleGoogle} style={{
        width:'100%', padding:'11px 16px', borderRadius:8,
        border:'1.5px solid var(--border)', background:'var(--card)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        fontSize:14, fontWeight:600, color:'var(--text)', cursor:'pointer',
        marginBottom:20, transition:'all 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--brand)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
      >
        <GoogleIcon /> Continue with Google
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ flex:1, height:1, background:'var(--border)' }}/>
        <span style={{ fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>or create with email</span>
        <div style={{ flex:1, height:1, background:'var(--border)' }}/>
      </div>

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
                background: form.role===v ? 'var(--brand-l)' : 'var(--input-bg)',
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
