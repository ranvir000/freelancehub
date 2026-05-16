import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast, getGigImage } from '../App.jsx'

const MOCK = {
  1:{ id:1, title:'I will build a full-stack web app with React & Django', category:'Development', seller_name:'Ranvir Singh', seller_id:'s1', seller_bio:'Final-year B.Tech CSE. Expert in React, Django, PostgreSQL.', rating:'4.9', review_count:48, orders_completed:48, img:'https://picsum.photos/seed/g1/400/300', description:`Complete web application with:\n• User authentication (JWT)\n• REST API with Django\n• PostgreSQL database\n• Responsive React frontend\n• Admin panel\n• Source code + documentation`, price_basic:2499, price_standard:4999, price_premium:8999, delivery_basic:7, delivery_standard:14, delivery_premium:21, reviews:[{name:'Alex M.',rating:5,text:'Outstanding! Delivered ahead of schedule.',date:'2 days ago'},{name:'Neha S.',rating:5,text:'Excellent code quality. Highly recommend!',date:'1 week ago'}] },
  2:{ id:2, title:'I will design a modern logo for your brand', category:'Design', seller_name:'Neha Sharma', seller_id:'s2', seller_bio:'Creative designer with 3+ years experience. I create memorable brand identities.', rating:'4.8', review_count:128, orders_completed:128, img:'https://picsum.photos/seed/g2/400/300', description:`Professional logo design package:\n• 2-4 original concepts\n• High-resolution PNG/JPG\n• Vector source files (AI, EPS)\n• Social media kit\n• 3D mockup`, price_basic:999, price_standard:1999, price_premium:3499, delivery_basic:3, delivery_standard:5, delivery_premium:7, reviews:[{name:'Rahul K.',rating:5,text:'Loved the concepts! Very responsive.',date:'3 days ago'}] },
  3:{ id:3, title:'I will create a responsive website with React', category:'Development', seller_name:'Amit Verma', seller_id:'s3', seller_bio:'Frontend Developer. Building fast, responsive, and accessible websites.', rating:'4.7', review_count:89, orders_completed:89, img:'https://picsum.photos/seed/g3/400/300', description:`Responsive frontend development:\n• React.js / Next.js\n• Tailwind CSS styling\n• Mobile-first design\n• Performance optimization\n• SEO friendly`, price_basic:1499, price_standard:2999, price_premium:5999, delivery_basic:5, delivery_standard:10, delivery_premium:14, reviews:[{name:'Priya R.',rating:4,text:'Good work, minor delay in delivery.',date:'2 weeks ago'}] },
  4:{ id:4, title:'I will write SEO-optimized blog posts for your site', category:'Writing', seller_name:'Sara Liu', seller_id:'s4', seller_bio:'Content writer specializing in tech and lifestyle blogs.', rating:'4.9', review_count:203, orders_completed:203, img:'https://picsum.photos/seed/g4/400/300', description:`High-quality content writing:\n• SEO optimization\n• Keyword research\n• Plagiarism-free\n• Engaging tone\n• Revisions included`, price_basic:499, price_standard:999, price_premium:1999, delivery_basic:2, delivery_standard:4, delivery_premium:7, reviews:[{name:'TechStartup Inc.',rating:5,text:'Traffic increased immediately. Great writing.',date:'1 month ago'}] },
  5:{ id:5, title:'I will build a REST API with Django & PostgreSQL', category:'Development', seller_name:'Ranvir Singh', seller_id:'s1', seller_bio:'Final-year B.Tech CSE. Expert in React, Django, PostgreSQL.', rating:'5.0', review_count:32, orders_completed:32, img:'https://picsum.photos/seed/g5/400/300', description:`Robust API development:\n• Django REST Framework\n• JWT Authentication\n• Custom endpoints\n• Database modeling\n• Swagger documentation`, price_basic:1999, price_standard:3499, price_premium:6999, delivery_basic:5, delivery_standard:10, delivery_premium:15, reviews:[{name:'John D.',rating:5,text:'Flawless API. Integrated perfectly with our frontend.',date:'4 days ago'}] },
  6:{ id:6, title:'I will design a stunning UI/UX for your app', category:'Design', seller_name:'Neha Sharma', seller_id:'s2', seller_bio:'Creative designer with 3+ years experience. I create memorable brand identities.', rating:'4.8', review_count:76, orders_completed:76, img:'https://picsum.photos/seed/g6/400/300', description:`App UI/UX design:\n• Wireframing\n• Interactive prototypes\n• User journey mapping\n• Figma source files\n• Developer handoff`, price_basic:1499, price_standard:2999, price_premium:5499, delivery_basic:4, delivery_standard:8, delivery_premium:12, reviews:[{name:'StartupX.',rating:5,text:'The prototype looks amazing. Investors loved it.',date:'1 week ago'}] },
  7:{ id:7, title:'I will create a social media marketing strategy', category:'Marketing', seller_name:'Kiran Mehta', seller_id:'s5', seller_bio:'Digital marketing expert with focus on organic growth.', rating:'4.7', review_count:61, orders_completed:61, img:'https://picsum.photos/seed/g7/400/300', description:`Social Media Strategy:\n• Audience research\n• Content calendar (30 days)\n• Hashtag research\n• Competitor analysis\n• Growth tactics`, price_basic:799, price_standard:1499, price_premium:2499, delivery_basic:3, delivery_standard:5, delivery_premium:7, reviews:[{name:'Local Cafe.',rating:5,text:'Our Instagram engagement doubled. Thanks Kiran!',date:'2 weeks ago'}] },
  8:{ id:8, title:'I will build a mobile app with React Native', category:'Development', seller_name:'Arjun Patel', seller_id:'s6', seller_bio:'Cross-platform mobile developer (iOS & Android).', rating:'4.9', review_count:44, orders_completed:44, img:'https://picsum.photos/seed/g8/400/300', description:`React Native App:\n• iOS & Android support\n• Custom UI components\n• API integration\n• Push notifications\n• App store deployment help`, price_basic:3499, price_standard:6999, price_premium:12999, delivery_basic:14, delivery_standard:21, delivery_premium:30, reviews:[{name:'Fitness App Co.',rating:5,text:'App runs smoothly on both platforms. Great job.',date:'3 weeks ago'}] },
  9:{ id:9, title:'I will write professional technical documentation', category:'Writing', seller_name:'Sara Liu', seller_id:'s4', seller_bio:'Content writer specializing in tech and lifestyle blogs.', rating:'4.8', review_count:97, orders_completed:97, img:'https://picsum.photos/seed/g9/400/300', description:`Technical Documentation:\n• API docs\n• User manuals\n• Architecture overviews\n• Readme files\n• Markdown format`, price_basic:699, price_standard:1299, price_premium:2499, delivery_basic:3, delivery_standard:6, delivery_premium:10, reviews:[{name:'DevTeam Alpha.',rating:5,text:'Very clear and concise documentation.',date:'1 month ago'}] },
  10:{ id:10, title:'I will design brand identity and style guide', category:'Design', seller_name:'Neha Sharma', seller_id:'s2', seller_bio:'Creative designer with 3+ years experience. I create memorable brand identities.', rating:'4.9', review_count:53, orders_completed:53, img:'https://picsum.photos/seed/g10/400/300', description:`Brand Identity Package:\n• Primary & secondary logos\n• Color palette & typography\n• Brand book / style guide\n• Business cards\n• Letterhead`, price_basic:2199, price_standard:3999, price_premium:6999, delivery_basic:7, delivery_standard:14, delivery_premium:21, reviews:[{name:'New Agency.',rating:5,text:'Captured our vision perfectly. The style guide is very detailed.',date:'2 months ago'}] },
  11:{ id:11, title:'I will run Google Ads campaigns and optimize ROI', category:'Marketing', seller_name:'Kiran Mehta', seller_id:'s5', seller_bio:'Digital marketing expert with focus on organic growth.', rating:'4.6', review_count:38, orders_completed:38, img:'https://picsum.photos/seed/g11/400/300', description:`Google Ads management:\n• Campaign setup\n• Keyword research\n• Ad copywriting\n• A/B testing\n• Weekly performance reports`, price_basic:1299, price_standard:2499, price_premium:4999, delivery_basic:5, delivery_standard:14, delivery_premium:30, reviews:[{name:'E-commerce Store.',rating:5,text:'ROAS went from 2x to 6x. Outstanding!',date:'1 month ago'}] },
  12:{ id:12, title:'I will set up a CI/CD pipeline with GitHub Actions', category:'Development', seller_name:'Arjun Patel', seller_id:'s6', seller_bio:'Cross-platform mobile developer (iOS & Android).', rating:'4.8', review_count:29, orders_completed:29, img:'https://picsum.photos/seed/g12/400/300', description:`CI/CD Pipeline Setup:\n• Automated testing\n• Linting checks\n• Docker integration\n• Automated deployment (Vercel/AWS)\n• Workflow optimization`, price_basic:1799, price_standard:2999, price_premium:4999, delivery_basic:4, delivery_standard:7, delivery_premium:10, reviews:[{name:'SaaS Builder.',rating:5,text:'Deployments are now completely automated. Huge time saver.',date:'2 weeks ago'}] },

}
Object.keys(MOCK).forEach(k => { MOCK[k].img = getGigImage(MOCK[k]) })

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
      let g = r.data;
      g.img = getGigImage(g);
      setGig(g);
    }).catch(() => setGig(MOCK[id] || MOCK[1]))
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
