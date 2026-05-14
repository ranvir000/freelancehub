import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth, useToast } from '../App.jsx'
import { LayoutDashboard, Briefcase, ShoppingBag, DollarSign, MessageCircle, Settings, LogOut, Plus, Menu, X, TrendingUp } from 'lucide-react'

const NAV = [
  { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/seller/gigs',      icon: Briefcase,       label: 'My Gigs'    },
  { to: '/seller/orders',    icon: ShoppingBag,     label: 'Orders'     },
  { to: '/seller/earnings',  icon: DollarSign,      label: 'Earnings'   },
  { to: '/seller/messages',  icon: MessageCircle,   label: 'Messages'   },
  { to: '/seller/settings',  icon: Settings,        label: 'Settings'   },
]

export default function SellerLayout() {
  const { user, logout } = useAuth()
  const toast   = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'buyer') return <Navigate to="/client/dashboard" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard"  replace />

  function handleLogout() {
    logout()
    toast('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="portal-root">
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#8b5cf6,var(--brand))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff' }}>F</div>
          <span>Seller Portal</span>
        </div>

        <div style={{ padding:'16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,var(--brand))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {user.name?.slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</p>
              <p style={{ fontSize:11, color:'#a78bfa', fontWeight:600 }}>Freelancer</p>
            </div>
          </div>
        </div>

        <div style={{ flex:1, paddingTop:8 }}>
          <p className="sidebar-section">Workspace</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </div>

        <div style={{ padding:'12px 20px' }}>
          <button onClick={() => navigate('/seller/gigs/new')} className="btn btn-primary" style={{ width:'100%', fontSize:13 }}>
            <Plus size={14}/> Post New Gig
          </button>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-item" style={{ width:'100%', border:'none', background:'none', color:'var(--danger)' }}>
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      <div className="portal-content">
        <div className="portal-header">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setOpen(!open)} style={{ display:'none', background:'none', border:'none', color:'var(--text)', padding:4 }} className="sidebar-toggle">
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <TrendingUp size={16} style={{color:'#a78bfa'}} />
            <span style={{ fontSize:13, color:'var(--muted)' }}>Seller Dashboard — <strong style={{color:'var(--text)'}}>{user.name?.split(' ')[0]}</strong></span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate('/seller/gigs/new')} className="btn btn-primary btn-sm"><Plus size={13}/> New Gig</button>
          </div>
        </div>
        <Outlet />
      </div>

      <style>{`@media(max-width:768px){.sidebar-toggle{display:flex !important;}}`}</style>
    </div>
  )
}
