import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  {
    key: 'buyer',
    label: 'Client / Buyer',
    emoji: '🛍️',
    color: '#3b82f6',
    bg: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    desc: 'Looking to hire freelancers for your projects',
    steps: [
      { icon: '🔍', title: 'Browse Gigs', desc: 'Explore hundreds of services across Development, Design, Writing, Marketing and more. Filter by price, category or rating.' },
      { icon: '⭐', title: 'Pick Your Package', desc: 'Every gig has Basic, Standard and Premium packages. Choose the one that fits your budget and timeline.' },
      { icon: '📋', title: 'Place an Order', desc: 'Describe your requirements clearly and place the order. Your payment is protected until you approve the delivery.' },
      { icon: '💬', title: 'Chat with Seller', desc: 'Use the built-in messaging system to communicate directly with the seller throughout the project.' },
      { icon: '✅', title: 'Review & Approve', desc: 'Once the work is delivered, review it and mark as complete. Then leave a star rating and review for the seller.' },
    ],
    features: ['Browse all gigs', 'Place & track orders', 'Message sellers', 'Save favourites', 'Leave reviews'],
  },
  {
    key: 'seller',
    label: 'Freelancer / Seller',
    emoji: '💼',
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    desc: 'Offer your skills and earn money on your own terms',
    steps: [
      { icon: '✍️', title: 'Create Your Gig', desc: 'Post a service with a title, description, category, and 3 pricing tiers (Basic / Standard / Premium). Takes under 5 minutes.' },
      { icon: '📦', title: 'Receive Orders', desc: 'Buyers place orders and you get notified instantly. Accept and start working on the project at your own pace.' },
      { icon: '💬', title: 'Communicate', desc: 'Use the Messages section to clarify requirements, send updates and share files with your clients.' },
      { icon: '🚀', title: 'Deliver Work', desc: 'Mark the order as Delivered when done. The buyer reviews it and approves the delivery to release payment.' },
      { icon: '💰', title: 'Track Earnings', desc: 'See all your earnings, active gigs and completed orders in your seller dashboard. Grow your rating over time.' },
    ],
    features: ['Post unlimited gigs', 'Manage orders', 'Message buyers', 'Track earnings', 'Build your profile'],
  },
  {
    key: 'admin',
    label: 'Platform Admin',
    emoji: '🛡️',
    color: '#ef4444',
    bg: 'linear-gradient(135deg,#dc2626,#ef4444)',
    desc: 'Manage users, monitor gigs, and oversee platform operations',
    steps: [
      { icon: '👥', title: 'User Management', desc: 'View all registered users, reset passwords, and securely manage or delete accounts.' },
      { icon: '🛒', title: 'Monitor Gigs', desc: 'Oversee all marketplace listings. Disable or remove inappropriate content instantly.' },
      { icon: '📊', title: 'Track Orders', desc: 'Monitor all transactions and order statuses across the platform to ensure smooth operations.' },
    ],
    features: ['Reset passwords', 'Delete users', 'Disable gigs', 'View all transactions', 'Global oversight'],
  },
]

const PLATFORM_FEATURES = [
  { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login with JSON Web Tokens. Each session is authenticated server-side.' },
  { icon: '💬', title: 'Real-time Messaging', desc: 'Buyers and sellers can chat directly. Messages are stored in the database and load instantly.' },
  { icon: '💳', title: 'Order Management', desc: 'Full order lifecycle: Pending → Accepted → In Progress → Delivered → Completed.' },
  { icon: '⭐', title: 'Reviews & Ratings', desc: 'Buyers can leave ratings after completed orders. Gig ratings are recalculated automatically.' },
  { icon: '❤️', title: 'Favourites', desc: 'Buyers can save gigs they like for later. Favourites are stored per user account.' },
  { icon: '🌙', title: 'Dark / Light Mode', desc: 'Full theme switcher persisted in localStorage. Every component responds to the active theme.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Works on desktop, tablet and mobile. Sidebar collapses on small screens.' },
  { icon: '🛡️', title: 'Role-based Access', desc: 'Three distinct roles — Buyer, Seller, Admin — each with a dedicated portal and permissions.' },
]

const TECH_STACK = [
  { layer: 'Frontend', items: ['React 18', 'React Router v6', 'Framer Motion', 'Lucide Icons', 'Vite', 'Vanilla CSS'] },
  { layer: 'Backend', items: ['Django 4', 'Django REST Framework', 'SimpleJWT', 'PostgreSQL', 'Python 3.11'] },
  { layer: 'Deployment', items: ['Vercel (frontend)', 'Render (backend)', 'Supabase (database)', 'GitHub CI/CD'] },
]

export default function HowItWorks() {
  const navigate = useNavigate()
  const [activeRole, setActiveRole] = useState('buyer')
  const role = ROLES.find(r => r.key === activeRole)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', padding: '72px 20px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '6px 16px', marginBottom: 20, fontSize: 13, color: '#a5b4fc' }}>
          📋 Platform Demo Guide
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
          How FreelanceHub Works
        </h1>
        <p style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 36px' }}>
          A complete freelancing marketplace — connect clients with skilled freelancers across Development, Design, Writing and Marketing.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/browse')} style={{ padding: '12px 28px', fontSize: 15 }}>
            🔍 Browse Gigs
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/register')} style={{ padding: '12px 28px', fontSize: 15, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            🚀 Get Started Free
          </button>
        </div>
      </div>

      <div className="page-wrap" style={{ padding: '48px 20px' }}>

        {/* ── Role Selector ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Choose Your Role</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28 }}>FreelanceHub has three distinct user types, each with their own portal</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <button
                key={r.key}
                onClick={() => setActiveRole(r.key)}
                style={{
                  padding: '14px 28px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  border: activeRole === r.key ? '2px solid transparent' : '2px solid var(--border)',
                  background: activeRole === r.key ? r.bg : 'var(--card)',
                  color: activeRole === r.key ? '#fff' : 'var(--text)',
                  transition: 'all 0.2s', boxShadow: activeRole === r.key ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Role Detail ── */}
        <div className="card" style={{ padding: 32, marginBottom: 48, border: `2px solid ${role.color}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
              {role.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{role.label}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{role.desc}</p>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
            {role.steps.map((step, i) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '16px 14px', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 800, color: role.color, background: `${role.color}20`, borderRadius: 20, padding: '2px 8px' }}>
                  Step {i + 1}
                </div>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{step.icon}</div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>{step.title}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Features list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {role.features.map(f => (
              <span key={f} style={{ background: `${role.color}15`, color: role.color, padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Platform Features ── */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: 8 }}>Platform Features</h2>
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>Everything built into FreelanceHub</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {PLATFORM_FEATURES.map(f => (
              <div key={f.title} className="card" style={{ padding: '20px', display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tech Stack ── */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: 8 }}>Tech Stack</h2>
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: 32 }}>Technologies used to build the platform</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {TECH_STACK.map(t => (
              <div key={t.layer} className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  {t.layer === 'Frontend' ? '⚛️' : t.layer === 'Backend' ? '🐍' : '☁️'} {t.layer}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {t.items.map(item => (
                    <span key={item} style={{ background: 'var(--brand-l)', color: 'var(--brand)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg,var(--brand-l),var(--bg2))', borderRadius: 16, border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Ready to explore?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Sign up today to see the platform in action</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ padding: '12px 32px' }}>Sign In</button>
            <button className="btn btn-outline" onClick={() => navigate('/browse')} style={{ padding: '12px 32px' }}>Browse Gigs</button>
          </div>
        </div>

      </div>
    </div>
  )
}
