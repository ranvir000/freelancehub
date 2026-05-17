import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast, getGigImage } from '../App.jsx'



export default function GigDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [pkg, setPkg] = useState('standard')
  const [req, setReq] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)

  useEffect(() => {
    api.get(`/api/gigs/${id}/`).then(r => {
      let g = r.data
      g.img = getGigImage(g)
      setGig(g)
    }).catch(() => setGig('error'))
  }, [id])

  if (gig === 'error') return (
    <div style={{ padding:'80px', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>😕</div>
      <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Gig not found</h3>
      <p style={{ color:'var(--muted)', marginBottom:20 }}>This gig may have been removed or doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
    </div>
  )

  const pkgs = gig ? {
    basic:    { label:'Basic',    price: gig.price_basic,    delivery: gig.delivery_basic,    features:['Core deliverables',`${gig.delivery_basic} day delivery`,'2 revisions','Source files'] },
    standard: { label:'Standard', price: gig.price_standard, delivery: gig.delivery_standard, features:['Everything in Basic','Priority support',`${gig.delivery_standard} day delivery`,'3 revisions'] },
    premium:  { label:'Premium',  price: gig.price_premium,  delivery: gig.delivery_premium,  features:['Everything in Standard','Unlimited revisions',`${gig.delivery_premium} day delivery`,'1-on-1 call'] },
  } : {}

  const selPkg = pkgs[pkg] || {}

  async function placeOrder() {
    if (!user) { navigate('/login'); return }
    setOrdering(true)
    try {
      await api.post('/api/orders/', { gig: gig.id, package: pkg, requirements: req, amount: selPkg.price })
      setOrdered(true)
      toast('Order placed successfully! 🎉')
      const dashPath = user?.role === 'seller' ? '/seller/dashboard' : '/client/dashboard'
      setTimeout(() => navigate(dashPath), 1500)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to place order. Please try again.'
      toast(msg, 'error')
    } finally { setOrdering(false) }
  }

  function contactSeller() {
    if (!user) { navigate('/login'); return }
    // gig.seller is the real DB integer PK (from API response)
    // gig.seller_id is used for mock data only (e.g. 's1')
    const realId = gig.seller   // integer from backend
    const mockId = gig.seller_id // 's1' etc from mock fallback
    const msgPath = user.role === 'seller' ? '/seller/messages' : '/client/messages';
    
    if (realId && typeof realId === 'number') {
      const params = new URLSearchParams({ with: realId, name: gig.seller_name || 'Seller', role: 'seller' })
      navigate(`${msgPath}?${params}`)
    } else {
      // Mock gig or no real ID — send to messages page, user can pick from seller list
      navigate(msgPath)
    }
  }

  if (!gig) return <div style={{padding:'80px',textAlign:'center',color:'var(--muted)'}}>Loading...</div>

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ background:'var(--card)', borderBottom:'1px solid var(--border)', padding:'24px 0' }}>
        <div className="page-wrap">
          <div className="badge badge-purple" style={{marginBottom:12}}>{gig.category}</div>
          <h1 style={{ fontSize:'clamp(1.2rem,3vw,1.8rem)', fontWeight:800, lineHeight:1.3, maxWidth:700, marginBottom:16, color:'var(--text)' }}>{gig.title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
              onClick={() => navigate(`/profile/${gig.seller || gig.seller_id || 's1'}`)}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 }}>
                {gig.seller_name?.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight:600, fontSize:14, color:'var(--brand)' }}>{gig.seller_name}</p>
                <p style={{ fontSize:12, color:'var(--muted)' }}>{gig.seller_bio}</p>
              </div>
            </div>
            <span className="stars">★ {gig.rating} <span style={{color:'var(--muted)',fontSize:12}}>({gig.review_count} reviews)</span></span>
            <span style={{ fontSize:13, color:'var(--muted)' }}>{gig.orders_completed}+ orders completed</span>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ padding:'32px 20px', display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
        {/* Left */}
        <div>
          {/* Gig image */}
          {gig.img ? (
            <div style={{ borderRadius:12, overflow:'hidden', marginBottom:20, border:'1px solid var(--border)' }}>
              <img src={gig.img} alt={gig.title} style={{ width:'100%', height:300, objectFit:'cover' }}
                onError={e => { e.target.style.display='none'; e.target.parentElement.style.background='linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
            </div>
          ) : (
            <div style={{ borderRadius:12, overflow:'hidden', marginBottom:20, border:'1px solid var(--border)', width:'100%', height:300, background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
          )}

          {/* About */}
          <div className="card" style={{ padding:24, marginBottom:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16, color:'var(--text)' }}>About this gig</h2>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.9, whiteSpace:'pre-line' }}>{gig.description}</p>
          </div>

          {/* Package comparison */}
          <div className="card" style={{ padding:24, marginBottom:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16, color:'var(--text)' }}>Compare packages</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {Object.entries(pkgs).map(([key, p]) => (
                <div key={key} onClick={() => setPkg(key)} style={{
                  padding:16, borderRadius:10, cursor:'pointer', textAlign:'center',
                  border: pkg===key ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                  background: pkg===key ? 'var(--brand-l)' : 'var(--card)', transition:'all 0.15s'
                }}>
                  <p style={{ fontSize:12, fontWeight:600, color: pkg===key ? 'var(--brand)' : 'var(--muted)', marginBottom:6 }}>{p.label}</p>
                  <p style={{ fontSize:20, fontWeight:800, color: pkg===key ? 'var(--brand)' : 'var(--text)', marginBottom:6 }}>₹{Number(p.price).toLocaleString()}</p>
                  <p style={{ fontSize:11, color:'var(--muted)' }}>⏱ {p.delivery} days</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {gig.reviews?.length > 0 && (
            <div className="card" style={{ padding:24 }}>
              <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16, color:'var(--text)' }}>Client reviews</h2>
              {gig.reviews.map((r,i) => (
                <div key={i} style={{ paddingBottom:16, marginBottom:16, borderBottom: i<gig.reviews.length-1?'1px solid var(--border)':'' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--brand)', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {r.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{r.name}</p>
                      <span className="stars" style={{fontSize:11}}>{'★'.repeat(r.rating)}</span>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:11, color:'var(--muted)' }}>{r.date}</span>
                  </div>
                  <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order card */}
        <div className="card" style={{ padding:24, position:'sticky', top:80 }}>
          <p style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>{selPkg.label} Package</p>
          <p style={{ fontSize:28, fontWeight:800, color:'var(--brand)', marginBottom:16 }}>
            ₹{Number(selPkg.price).toLocaleString()}
          </p>

          <ul style={{ listStyle:'none', marginBottom:20 }}>
            {(selPkg.features||[]).map(f => (
              <li key={f} style={{ display:'flex', gap:8, fontSize:13, color:'var(--muted)', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--success)', fontWeight:700 }}>✓</span>{f}
              </li>
            ))}
          </ul>

          <div className="form-group">
            <label>Describe your requirements</label>
            <textarea className="form-control" placeholder="Tell the seller exactly what you need..."
              value={req} onChange={e => setReq(e.target.value)} style={{ minHeight:80 }} />
          </div>

          {ordered ? (
            <div style={{ background:'#dcfce7', color:'#15803d', padding:16, borderRadius:10, textAlign:'center', fontWeight:600 }}>
              ✅ Order placed! Going to dashboard...
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width:'100%', padding:'14px' }} onClick={placeOrder} disabled={ordering}>
              {ordering ? <><span className="spinner"/>Placing order...</> : `Order Now — ₹${Number(selPkg.price||0).toLocaleString()}`}
            </button>
          )}

          <button
            onClick={contactSeller}
            className="btn btn-outline"
            style={{ width:'100%', marginTop:10 }}
          >
            ✉️ Contact Seller
          </button>

          <div style={{ marginTop:16, padding:14, background:'var(--brand-l)', borderRadius:10, fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
            🔒 <strong>Secure payment</strong> — Your payment is protected until you approve the delivered work
          </div>
        </div>
      </div>

    </div>
  )
}
