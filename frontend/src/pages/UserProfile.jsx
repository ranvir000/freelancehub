import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast, getGigImage } from '../App.jsx'

// Mock sellers
const MOCK_SELLERS = {
  s1: { id:'s1', name:'Ranvir Singh', role:'seller', bio:'Final-year B.Tech CSE student at GZSCCET. Expert in React, Django, PostgreSQL. Passionate about building scalable web applications.', skills:['React','Django','PostgreSQL','JWT','REST API','Docker'], rating:'4.9', reviewCount:80, completedOrders:80, joinedDate:'January 2025', location:'Bathinda, Punjab', img:null, gigs:[1,5], reviews:[{name:'Alex M.',rating:5,text:'Outstanding work! Delivered a complete app ahead of schedule.',date:'2 days ago'},{name:'Vikram B.',rating:5,text:'Clean code, great documentation. Will hire again.',date:'1 week ago'},{name:'Meera P.',rating:4,text:'Good communication and quality work.',date:'2 weeks ago'}] },
  s2: { id:'s2', name:'Neha Sharma', role:'seller', bio:'Creative designer specializing in brand identity and UI/UX. 3+ years of experience working with startups and SMEs across India.', skills:['Figma','Adobe Illustrator','Brand Identity','UI/UX','Logo Design','Prototyping'], rating:'4.8', reviewCount:204, completedOrders:204, joinedDate:'March 2024', location:'Chandigarh, Punjab', img:null, gigs:[2,6,10], reviews:[{name:'James T.',rating:5,text:'Amazing designs. Our brand looks world-class now!',date:'3 days ago'},{name:'Startup Founder.',rating:5,text:'Neha understood our vision perfectly.',date:'1 week ago'}] },
  s3: { id:'s3', name:'Amit Verma',  role:'seller', bio:'Frontend developer focused on mobile-first experiences. Building responsive websites since 2022 with React and Tailwind CSS.', skills:['React','Tailwind CSS','HTML/CSS','SEO','Responsive Design'], rating:'4.7', reviewCount:89, completedOrders:89, joinedDate:'June 2024', location:'Ludhiana, Punjab', img:null, gigs:[3], reviews:[{name:'Dev K.',rating:5,text:'Super fast delivery and clean code.',date:'5 days ago'}] },
  s4: { id:'s4', name:'Sara Liu',    role:'seller', bio:'Professional content writer and SEO specialist. Helping businesses rank on Google with high-quality, engaging content.', skills:['SEO Writing','Content Strategy','Keyword Research','Blog Posts','Technical Writing'], rating:'4.9', reviewCount:300, completedOrders:300, joinedDate:'November 2023', location:'Delhi, India', img:null, gigs:[4,9], reviews:[{name:'Amit V.',rating:5,text:'Traffic increased 40% after her articles!',date:'1 week ago'},{name:'Dev Team.',rating:5,text:'Best documentation we have ever had.',date:'2 weeks ago'}] },
  s5: { id:'s5', name:'Kiran Mehta', role:'seller', bio:'Digital marketing expert specializing in paid ads and organic growth strategies. Managed ₹50L+ in ad spend across Google and Meta.', skills:['Google Ads','Meta Ads','SEO','Social Media','Analytics','PPC'], rating:'4.7', reviewCount:99, completedOrders:99, joinedDate:'February 2024', location:'Mumbai, Maharashtra', img:null, gigs:[7,11], reviews:[{name:'E-commerce Store.',rating:5,text:'ROAS went from 2x to 6x. Outstanding!',date:'1 month ago'},{name:'Meera P.',rating:5,text:'Followers grew 200% in one month!',date:'2 weeks ago'}] },
  s6: { id:'s6', name:'Arjun Patel', role:'seller', bio:'Mobile and DevOps engineer. Built 4 apps on the Play Store. Expert in React Native, GitHub Actions, and cloud deployments.', skills:['React Native','GitHub Actions','Docker','AWS','CI/CD','iOS/Android'], rating:'4.9', reviewCount:73, completedOrders:73, joinedDate:'August 2024', location:'Ahmedabad, Gujarat', img:null, gigs:[8,12], reviews:[{name:'Rohan S.',rating:5,text:'App is live on Play Store. Amazing!',date:'3 weeks ago'},{name:'Dev Team.',rating:5,text:'Deploy time went from 2hr to 5min!',date:'3 weeks ago'}] },
}

const MOCK_GIGS = {
  1: { title:'Full-stack web app with React & Django', category:'Development' },
  2: { title:'Modern logo for your brand', category:'Design' },
  3: { title:'Responsive website with React', category:'Development' },
  4: { title:'SEO-optimized blog posts', category:'Writing' },
  5: { title:'REST API with Django & PostgreSQL', category:'Development' },
  6: { title:'Stunning UI/UX for your app', category:'Design' },
  7: { title:'Social media marketing strategy', category:'Marketing' },
  8: { title:'Mobile app with React Native', category:'Development' },
  9: { title:'Professional technical documentation', category:'Writing' },
  10: { title:'Brand identity and style guide', category:'Design' },
  11: { title:'Google Ads campaigns & ROI', category:'Marketing' },
  12: { title:'CI/CD pipeline with GitHub Actions', category:'Development' },
}

export default function UserProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Try API first
    api.get(`/api/users/${id}/`).then(r => {
      setProfile(r.data)
      setLoading(false)
    }).catch(() => {
      // Fall back to mock or current user
      if (MOCK_SELLERS[id]) {
        setProfile(MOCK_SELLERS[id])
      } else if (currentUser && (id === 'me' || id === currentUser.id?.toString())) {
        // Show current user's profile
        setProfile({
          ...currentUser,
          bio: currentUser.bio || 'No bio yet.',
          skills: currentUser.skills || [],
          rating: currentUser.rating || null,
          reviewCount: currentUser.reviewCount || 0,
          completedOrders: currentUser.completedOrders || 0,
          joinedDate: currentUser.joinedDate || 'Recently',
          location: currentUser.location || 'India',
          gigs: [],
          reviews: [],
        })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [id, currentUser])

  if (loading) return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center', color:'var(--muted)' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
        <p>Loading profile...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div className="card" style={{ padding:40, textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>👤</div>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8, color:'var(--text)' }}>Profile not found</h2>
        <p style={{ color:'var(--muted)', marginBottom:24 }}>This user doesn't exist or hasn't set up their profile yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  )

  const isOwnProfile = currentUser && (id === 'me' || id === currentUser.id?.toString())
  const displayName = profile.name || profile.username || (profile.first_name ? `${profile.first_name} ${profile.last_name}` : 'Anonymous User')
  const initials = displayName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '??'

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', background:'var(--bg)' }}>
      {/* Cover band */}
      <div style={{ height:180, background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)', position:'relative' }}>
        {isOwnProfile && (
          <div style={{ position:'absolute', top:16, right:16 }}>
            <button className="btn btn-ghost btn-sm" style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)' }}>
              ✏️ Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Avatar row — sits between cover and card, fully outside both */}
      <div className="page-wrap" style={{ padding:'0 20px' }}>
        <div style={{ position:'relative', height:56 }}>
          <div style={{ position:'absolute', top:-48, left:0, display:'flex', alignItems:'flex-end' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              {profile.img ? (
                <img src={profile.img} alt={displayName} style={{ width:96, height:96, borderRadius:'50%', border:'4px solid var(--card)', objectFit:'cover' }}
                     onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
              ) : null}
              <div style={{
                display: profile.img ? 'none' : 'flex',
                width:96, height:96, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)',
                color:'#fff', alignItems:'center', justifyContent:'center',
                fontSize:30, fontWeight:800, border:'4px solid var(--card)', flexShrink:0
              }}>{initials}</div>
              {/* Online dot */}
              <div style={{
                position:'absolute', bottom:6, right:6, width:16, height:16,
                background:'var(--success)', borderRadius:'50%', border:'3px solid var(--card)'
              }} title="Online Now"/>
            </div>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ padding:'0 20px 40px' }}>
        {/* Profile header card — starts fully below the cover */}
        <div className="card" style={{ padding:'20px 28px', marginBottom:24, position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            {/* Spacer for avatar width */}
            <div style={{ width:96, flexShrink:0 }} />

            {/* Name + meta — entirely on the card background */}
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text)', marginBottom:6 }}>{displayName}</h1>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                <span className="badge badge-purple" style={{ textTransform:'capitalize' }}>{profile.role}</span>
                {profile.email   && <span style={{ fontSize:13, color:'var(--muted)' }}>📧 {profile.email}</span>}
                {profile.location&& <span style={{ fontSize:13, color:'var(--muted)' }}>📍 {profile.location}</span>}
                {profile.joinedDate&&<span style={{ fontSize:13, color:'var(--muted)' }}>🗓 Joined {profile.joinedDate}</span>}
              </div>
            </div>

            {/* CTA buttons */}
            {!isOwnProfile && profile.role === 'seller' && (
              <div style={{ display:'flex', gap:10, flexShrink:0 }}>
                <button className="btn btn-outline" onClick={async () => {
                  if (!currentUser) { navigate('/login'); return }
                  const msgPath = currentUser.role === 'seller' ? '/seller/messages' : '/client/messages'
                  // If we have a real numeric ID, go straight to the conversation
                  if (typeof profile.id === 'number') {
                    const params = new URLSearchParams({ with: profile.id, name: profile.name || displayName, role: 'seller' })
                    navigate(`${msgPath}?${params}`)
                    return
                  }
                  // Mock profile — try to find the real seller by name via API
                  try {
                    const res = await api.get('/api/sellers/', { params: { search: displayName } })
                    const match = res.data.find(s => s.name === displayName || s.name?.includes(displayName.split(' ')[0]))
                    if (match) {
                      const params = new URLSearchParams({ with: match.id, name: match.name, role: 'seller' })
                      navigate(`${msgPath}?${params}`)
                    } else {
                      navigate(msgPath)
                    }
                  } catch {
                    navigate(msgPath)
                  }
                }}>✉️ Message</button>
                <button className="btn btn-primary" onClick={() => navigate(`/browse?search=${encodeURIComponent(displayName)}`)}>View Gigs</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>
          {/* Left */}
          <div>
            {/* Bio */}
            <div className="card" style={{ padding:24, marginBottom:20 }}>
              <h2 style={{ fontSize:16, fontWeight:700, marginBottom:12, color:'var(--text)' }}>About</h2>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>
                {profile.bio || 'No bio yet.'}
              </p>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="card" style={{ padding:24, marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:700, marginBottom:12, color:'var(--text)' }}>Skills</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {profile.skills.map(s => (
                    <span key={s} style={{
                      background:'var(--brand-l)', color:'var(--brand)',
                      padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Active gigs */}
            {profile.gigs?.length > 0 && (
              <div className="card" style={{ padding:24, marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'var(--text)' }}>Active Gigs</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {profile.gigs.map(gigId => (
                    <div key={gigId}
                      onClick={() => navigate(`/gig/${gigId}`)}
                      style={{
                        padding:'12px 16px', borderRadius:10, border:'1px solid var(--border)',
                        cursor:'pointer', transition:'all 0.15s', background:'var(--card)',
                        display:'flex', alignItems:'center', gap:12
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--brand)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                    >
                      <div style={{
                        width:80, height:60, borderRadius:8, flexShrink:0,
                        background: `url(${getGigImage({id: gigId, category: MOCK_GIGS[gigId]?.category})}) center/cover`,
                        backgroundColor: 'var(--brand-l)', border:'1px solid var(--border)'
                      }} />
                      <p style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>
                        {MOCK_GIGS[gigId]?.title || `Gig #${gigId}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {profile.reviews?.length > 0 && (
              <div className="card" style={{ padding:24 }}>
                <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'var(--text)' }}>
                  Reviews <span style={{ color:'var(--muted)', fontWeight:400, fontSize:13 }}>({profile.reviewCount})</span>
                </h2>
                {profile.reviews.map((r, i) => (
                  <div key={i} style={{ paddingBottom:16, marginBottom:16, borderBottom: i<profile.reviews.length-1?'1px solid var(--border)':'' }}>
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

            {/* Empty state for new users */}
            {(!profile.reviews || profile.reviews.length === 0) && (!profile.gigs || profile.gigs.length === 0) && (
              <div className="card" style={{ padding:40, textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🌱</div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8, color:'var(--text)' }}>Just getting started</h3>
                <p style={{ color:'var(--muted)', fontSize:13 }}>
                  {isOwnProfile
                    ? profile.role === 'seller' ? 'Post your first gig to start earning!' : 'Browse gigs and place your first order!'
                    : 'This user is new to FreelanceHub.'}
                </p>
                {isOwnProfile && (
                  <button className="btn btn-primary" style={{ marginTop:16 }}
                    onClick={() => navigate(profile.role === 'seller' ? '/post-gig' : '/')}>
                    {profile.role === 'seller' ? '+ Post a Gig' : 'Browse Gigs'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Stats */}
            {profile.role === 'seller' && (
              <div className="card" style={{ padding:20 }}>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'var(--text)' }}>Stats</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    { icon:'⭐', label:'Rating', value: profile.rating ? `${profile.rating}/5.0` : 'No ratings yet' },
                    { icon:'✅', label:'Orders Done', value: profile.completedOrders || 0 },
                    { icon:'⚡', label:'Avg. Response', value: '1 hr' },
                    { icon:'🗓', label:'Member Since', value: profile.joinedDate || 'Recently' },
                  ].map(s => (
                    <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontSize:14, color:'var(--muted)', display:'flex', alignItems:'center', gap:8 }}>{s.icon} {s.label}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {!isOwnProfile && (
              <div className="card" style={{ padding:20 }}>
                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12, color:'var(--text)' }}>Contact</h3>
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => navigate('/')}>
                  💬 View Gigs & Order
                </button>
              </div>
            )}

            {/* Trust badges */}
            <div className="card" style={{ padding:20 }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12, color:'var(--text)' }}>Trust & Safety</h3>
              {[
                { icon:'✅', text:'Identity verified' },
                { icon:'🔒', text:'Secure payments' },
                { icon:'⭐', text:'FreelanceHub member' },
              ].map(b => (
                <div key={b.text} style={{ display:'flex', gap:8, alignItems:'center', padding:'6px 0', fontSize:13, color:'var(--muted)' }}>
                  <span>{b.icon}</span><span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
