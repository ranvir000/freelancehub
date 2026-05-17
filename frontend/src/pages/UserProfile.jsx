import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, useAuth, useToast, getGigImage } from '../App.jsx'

export default function UserProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/users/${id}/`).then(r => {
      setProfile(r.data)
      setLoading(false)
    }).catch(() => {
      if (currentUser && (id === 'me' || id === currentUser.id?.toString())) {
        setProfile({ ...currentUser, bio: currentUser.bio || '', skills: currentUser.skills || [], gigs: [], reviews: [] })
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

            {/* Active gigs — uses real gigs array from API */}
            {profile.gigs?.length > 0 && (
              <div className="card" style={{ padding:24, marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'var(--text)' }}>Active Gigs</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {profile.gigs.map(gig => {
                    const gigId = typeof gig === 'object' ? gig.id : gig
                    const gigTitle = typeof gig === 'object' ? gig.title : `Gig #${gigId}`
                    const gigCategory = typeof gig === 'object' ? gig.category : 'Development'
                    return (
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
                          background: `url(${getGigImage({id: gigId, category: gigCategory})}) center/cover`,
                          backgroundColor: 'var(--brand-l)', border:'1px solid var(--border)'
                        }} />
                        <p style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{gigTitle}</p>
                      </div>
                    )
                  })}
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
