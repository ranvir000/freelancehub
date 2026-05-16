import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, useAuth } from '../../App.jsx'
import { Send, MessageCircle, Plus, Search, X, ArrowLeft } from 'lucide-react'

export default function ClientMessages() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [searchParams] = useSearchParams()

  const [convs,    setConvs]    = useState([])
  const [active,   setActive]   = useState(null)
  const [msgs,     setMsgs]     = useState([])
  const [text,     setText]     = useState('')
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)

  // New conversation picker state
  const [showPicker,  setShowPicker]  = useState(false)
  const [sellers,     setSellers]     = useState([])
  const [sellerQ,     setSellerQ]     = useState('')
  const [loadSellers, setLoadSellers] = useState(false)

  const msgEnd = useRef(null)

  // ── Load conversations ───────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/api/messages/')
      .then(r => setConvs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Handle ?with=<id>&name=<name> URL param (from "Contact Seller" button) ──
  useEffect(() => {
    const withId   = searchParams.get('with')
    const withName = searchParams.get('name')
    const withRole = searchParams.get('role') || 'seller'
    if (withId) {
      // Inject into convs if not already present, then open
      setConvs(prev => {
        const exists = prev.find(c => String(c.partner_id) === String(withId))
        if (!exists) {
          return [{ partner_id: withId, partner_name: withName || 'User', partner_role: withRole, last_message: '', unread_count: 0 }, ...prev]
        }
        return prev
      })
      setActive({ partner_id: withId, partner_name: withName || 'User', partner_role: withRole })
    }
  }, [searchParams])

  // ── Load messages for active conversation ────────────────────────────────────
  useEffect(() => {
    if (!active) return
    setMsgs([])
    api.get('/api/messages/', { params: { with: active.partner_id } })
      .then(r => setMsgs(r.data))
      .catch(() => {})
  }, [active?.partner_id])

  // ── Auto-scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  // ── Send message ─────────────────────────────────────────────────────────────
  async function send() {
    if (!text.trim() || !active || sending) return
    // Prevent self-messaging
    if (String(active.partner_id) === String(user.id)) return
    const content = text.trim()
    setText('')
    setSending(true)
    const optimistic = { id: `opt-${Date.now()}`, sender: user.id, receiver: active.partner_id, content, created_at: new Date().toISOString() }
    setMsgs(p => [...p, optimistic])
    try {
      const res = await api.post('/api/messages/', { receiver: active.partner_id, content })
      setMsgs(p => p.map(m => m.id === optimistic.id ? res.data : m))
      // Update conversation list preview
      setConvs(p => {
        const existing = p.find(c => String(c.partner_id) === String(active.partner_id))
        if (existing) {
          return [{ ...existing, last_message: content }, ...p.filter(c => String(c.partner_id) !== String(active.partner_id))]
        }
        return [{ partner_id: active.partner_id, partner_name: active.partner_name, partner_role: active.partner_role, last_message: content, unread_count: 0 }, ...p]
      })
    } catch {
      // Message stays as optimistic (offline fallback)
    } finally {
      setSending(false)
    }
  }

  // ── Load ALL messageable users (sellers list + order partners, excluding self) ─
  function openPicker() {
    setShowPicker(true)
    setSellerQ('')
    setLoadSellers(true)
    Promise.all([
      api.get('/api/sellers/').catch(() => ({ data: [] })),
      api.get('/api/orders/').catch(() => ({ data: [] })),
    ]).then(([sellersRes, ordersRes]) => {
      // Start with all sellers
      const sellerList = sellersRes.data.filter(s => String(s.id) !== String(user.id))
      // Also extract buyers from orders (for sellers wanting to message their buyers)
      const orderPartners = (ordersRes.data || []).map(o => {
        if (String(o.buyer) === String(user.id) || o.buyer_name === user.name) {
          // Current user is buyer — seller is the partner
          return o.seller ? { id: o.seller, name: o.seller_name, role: 'seller' } : null
        } else {
          // Current user is seller — buyer is the partner
          return o.buyer ? { id: o.buyer, name: o.buyer_name, role: 'buyer' } : null
        }
      }).filter(Boolean)

      // Merge, deduplicate by id, exclude self
      const seen = new Set()
      const merged = [...sellerList, ...orderPartners].filter(u => {
        const sid = String(u.id)
        if (sid === String(user.id) || seen.has(sid)) return false
        seen.add(sid)
        return true
      })
      setSellers(merged)
    }).catch(() => setSellers([])).finally(() => setLoadSellers(false))
  }

  function startConvoWith(person) {
    setShowPicker(false)
    // Prevent messaging yourself
    if (String(person.id) === String(user.id)) return
    const partnerRole = person.role || (person.hourly_rate !== undefined ? 'seller' : 'buyer')
    const conv = { partner_id: person.id, partner_name: person.name, partner_role: partnerRole, last_message: '', unread_count: 0 }
    setConvs(p => {
      const exists = p.find(c => String(c.partner_id) === String(person.id))
      return exists ? p : [conv, ...p]
    })
    setActive(conv)
    setMsgs([])
  }

  const filteredSellers = sellers.filter(s =>
    s.name?.toLowerCase().includes(sellerQ.toLowerCase()) ||
    s.bio?.toLowerCase().includes(sellerQ.toLowerCase()) ||
    s.email?.toLowerCase().includes(sellerQ.toLowerCase())
  )

  return (
    <div className="portal-page" style={{ padding: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── New Conversation Picker Modal ─────────────────────────────────── */}
      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Start a Conversation</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  autoFocus
                  value={sellerQ}
                  onChange={e => setSellerQ(e.target.value)}
                  placeholder="Search sellers..."
                  style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadSellers ? (
                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, margin: 12, borderRadius: 8 }} />)
              ) : filteredSellers.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No users found</div>
              ) : filteredSellers.map(s => (
                <div key={s.id} onClick={() => startConvoWith(s)}
                  style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background 0.1s', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-l)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand),#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {s.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.role ? s.role.charAt(0).toUpperCase() + s.role.slice(1) : (s.bio || 'User')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Layout ───────────────────────────────────────────────────── */}
      <div className="chat-root" style={{ height: '100%', flex: 1 }}>

        {/* Conversation List */}
        <div className="chat-list">
          <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Messages</h2>
            <button
              onClick={openPicker}
              title="New conversation"
              style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Plus size={16} />
            </button>
          </div>

          {loading ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64, margin: 8 }} />) :
            convs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                <MessageCircle size={28} style={{ margin: '0 auto 8px', opacity: .3 }} />
                <p style={{ fontSize: 12, marginBottom: 12 }}>No messages yet</p>
                <button onClick={openPicker} className="btn btn-primary btn-sm">Start a Conversation</button>
              </div>
            ) : convs.map(c => (
              <div key={c.partner_id} className={`chat-list-item ${active?.partner_id === c.partner_id ? 'active' : ''}`} onClick={() => setActive(c)}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand),#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {c.partner_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="chat-partner-name" style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.partner_name}</p>
                      {c.unread_count > 0 && <span style={{ background: 'var(--brand)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{c.unread_count}</span>}
                    </div>
                    <p className="chat-preview" style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message || 'Say hello 👋'}</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--muted)', height: '100%' }}>
              <MessageCircle size={56} style={{ opacity: .15 }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Your Messages</p>
                <p style={{ fontSize: 13, marginBottom: 16 }}>Select a conversation or start a new one</p>
                <button onClick={openPicker} className="btn btn-primary btn-sm"><Plus size={14} /> New Message</button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)' }}>
                <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'none' }} className="chat-back-btn">
                  <ArrowLeft size={18} />
                </button>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand),#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {active.partner_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{active.partner_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{active.partner_role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {msgs.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '40px 20px' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                    <p>Start the conversation with <strong>{active.partner_name}</strong></p>
                  </div>
                )}
                {msgs.map((m, i) => {
                  const mine = String(m.sender) === String(user.id)
                  return (
                    <div key={m.id || i} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end', minWidth: 0 }}>
                      {!mine && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand),#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {active.partner_name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0, maxWidth: '70%' }}>
                        <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`} style={{ maxWidth: '100%' }}>{m.content}</div>
                        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: mine ? 'right' : 'left' }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={msgEnd} />
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder={`Message ${active.partner_name}...`}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="btn btn-primary"
                  style={{ borderRadius: 20, paddingInline: 20, flexShrink: 0 }}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width: 640px) {
          .chat-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
