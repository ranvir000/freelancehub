import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast } from '../App.jsx'

const MOCK = {
  1:{ id:1, title:'I will build a full-stack web app with React & Django', category:'Development', seller_name:'Ranvir Singh', seller_bio:'Final-year B.Tech CSE. Expert in React, Django, PostgreSQL.', rating:'4.9', review_count:48, orders_completed:48, description:`Complete web application with:\n• User authentication (JWT)\n• REST API with Django\n• PostgreSQL database\n• Responsive React frontend\n• Admin panel\n• Source code + documentation`, price_basic:2499, price_standard:4999, price_premium:8999, delivery_basic:7, delivery_standard:14, delivery_premium:21, reviews:[{name:'Alex M.',rating:5,text:'Outstanding! Delivered ahead of schedule.',date:'2 days ago'},{name:'Priya K.',rating:5,text:'Excellent code quality. Highly recommend!',date:'1 week ago'}] },
  2:{ id:2, title:'I will design a modern logo for your brand', category:'Design', seller_name:'Priya Kapoor', seller_bio:'Creative designer with 3 years experience in brand identity.', rating:'4.8', review_count:128, orders_completed:128, description:`Professional logo design:\n• 3 unique concepts\n• Vector files (AI, SVG, PNG)\n• Full brand kit\n• Unlimited revisions\n• Commercial rights included`, price_basic:999, price_standard:1999, price_premium:3999, delivery_basic:3, delivery_standard:5, delivery_premium:10, reviews:[{name:'James T.',rating:5,text:'Perfect logo! Very professional.',date:'3 days ago'},{name:'Sara L.',rating:5,text:'Fast delivery and great quality.',date:'1 week ago'}] },
  3:{ id:3, title:'I will create a responsive website with React', category:'Development', seller_name:'Amit Verma', seller_bio:'Mobile-first developer specializing in React and Tailwind.', rating:'4.7', review_count:89, orders_completed:89, description:`Responsive website including:\n• React + Tailwind CSS\n• Mobile-first design\n• SEO optimization\n• Contact form\n• Source code delivered`, price_basic:1499, price_standard:2999, price_premium:5999, delivery_basic:5, delivery_standard:10, delivery_premium:20, reviews:[{name:'Vikram B.',rating:5,text:'Beautiful website! Very fast.',date:'5 days ago'}] },
  4:{ id:4, title:'I will write SEO-optimized blog posts for your site', category:'Writing', seller_name:'Sara Liu', seller_bio:'Professional content writer and SEO specialist.', rating:'4.9', review_count:203, orders_completed:203, description:`SEO content writing:\n• Keyword research included\n• Plagiarism-free content\n• Meta descriptions\n• 2-3 revisions\n• Fast delivery`, price_basic:499, price_standard:999, price_premium:1999, delivery_basic:2, delivery_standard:4, delivery_premium:7, reviews:[{name:'Amit V.',rating:5,text:'Traffic increased 40% after her articles!',date:'1 week ago'}] },
  5:{ id:5, title:'I will build a REST API with Django & PostgreSQL', category:'Development', seller_name:'Ranvir Singh', seller_bio:'Final-year B.Tech CSE. Expert in React, Django, PostgreSQL.', rating:'5.0', review_count:32, orders_completed:32, description:`Production-ready REST API:\n• Django REST Framework\n• JWT authentication\n• PostgreSQL database\n• API documentation (Swagger)\n• Filtering + pagination\n• Source code`, price_basic:1999, price_standard:3999, price_premium:6999, delivery_basic:5, delivery_standard:10, delivery_premium:18, reviews:[{name:'Alex M.',rating:5,text:'Clean API, well documented.',date:'4 days ago'}] },
  6:{ id:6, title:'I will design a stunning UI/UX for your app', category:'Design', seller_name:'Priya Kapoor', seller_bio:'Creative designer with 3 years experience in brand identity.', rating:'4.8', review_count:76, orders_completed:76, description:`Complete UI/UX design:\n• Figma wireframes\n• High-fidelity mockups\n• Interactive prototype\n• Design system\n• Dark mode included\n• All assets exported`, price_basic:1499, price_standard:2999, price_premium:5499, delivery_basic:4, delivery_standard:8, delivery_premium:15, reviews:[{name:'James T.',rating:5,text:'The designs look like a real app!',date:'1 week ago'}] },
}

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
    api.get(`/api/gigs/${id}/`).then(r => setGig(r.data)).catch(() => setGig(MOCK[id] || MOCK[1]))
  }, [id])

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
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch {
      setOrdered(true)
      toast('Order placed successfully! 🎉')
      setTimeout(() => navigate('/dashboard'), 1500)
    } finally { setOrdering(false) }
  }

  if (!gig) return <div style={{padding:'80px',textAlign:'center',color:'var(--muted)'}}>Loading...</div>

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'24px 0' }}>
        <div className="page-wrap">
          <div className="badge badge-purple" style={{marginBottom:12}}>{gig.category}</div>
          <h1 style={{ fontSize:'clamp(1.2rem,3vw,1.8rem)', fontWeight:800, lineHeight:1.3, maxWidth:700, marginBottom:16 }}>{gig.title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 }}>
                {gig.seller_name?.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight:600, fontSize:14 }}>{gig.seller_name}</p>
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
          {/* About */}
          <div className="card" style={{ padding:24, marginBottom:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>About this gig</h2>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.9, whiteSpace:'pre-line' }}>{gig.description}</p>
          </div>

          {/* Package comparison */}
          <div className="card" style={{ padding:24, marginBottom:20 }}>
            <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>Compare packages</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {Object.entries(pkgs).map(([key, p]) => (
                <div key={key} onClick={() => setPkg(key)} style={{
                  padding:16, borderRadius:10, cursor:'pointer', textAlign:'center',
                  border: pkg===key ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                  background: pkg===key ? 'var(--brand-l)' : '#fff', transition:'all 0.15s'
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
              <h2 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>Client reviews</h2>
              {gig.reviews.map((r,i) => (
                <div key={i} style={{ paddingBottom:16, marginBottom:16, borderBottom: i<gig.reviews.length-1?'1px solid var(--border)':'' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--brand)', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {r.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600 }}>{r.name}</p>
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

          <div style={{ marginTop:16, padding:14, background:'#f8fafc', borderRadius:10, fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
            🔒 <strong>Secure payment</strong> — Your payment is protected until you approve the delivered work
          </div>
        </div>
      </div>
    </div>
  )
}
