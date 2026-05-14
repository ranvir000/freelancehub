import React, { useState, useEffect, useRef } from 'react'
import { api, useAuth } from '../../App.jsx'
import { Send, MessageCircle } from 'lucide-react'

export default function ClientMessages() {
  const { user }   = useAuth()
  const [convs,    setConvs]    = useState([])
  const [active,   setActive]   = useState(null)
  const [msgs,     setMsgs]     = useState([])
  const [text,     setText]     = useState('')
  const [loading,  setLoading]  = useState(true)
  const msgEnd = useRef(null)

  useEffect(() => {
    api.get('/api/messages/').then(r => setConvs(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  useEffect(() => {
    if (!active) return
    api.get('/api/messages/', { params: { with: active.partner_id } }).then(r => setMsgs(r.data)).catch(()=>{})
  }, [active])

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  async function send() {
    if (!text.trim() || !active) return
    const content = text
    setText('')
    try {
      const res = await api.post('/api/messages/', { receiver: active.partner_id, content })
      setMsgs(p => [...p, res.data])
    } catch {
      setMsgs(p => [...p, { id: Date.now(), sender: user.id, content, created_at: new Date().toISOString() }])
    }
  }

  return (
    <div className="portal-page" style={{ padding:0, height:'calc(100vh - 120px)' }}>
      <div className="chat-root">
        <div className="chat-list">
          <div style={{ padding:'16px 14px', borderBottom:'1px solid var(--border)' }}>
            <h2 style={{ fontSize:15, fontWeight:700 }}>Messages</h2>
          </div>
          {loading ? [1,2,3].map(i=><div key={i} className="skeleton" style={{ height:64, margin:8 }}/>) :
            convs.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:'var(--muted)' }}>
                <MessageCircle size={28} style={{ margin:'0 auto 8px', opacity:.3 }}/>
                <p style={{ fontSize:12 }}>No messages yet</p>
              </div>
            ) : convs.map(c => (
              <div key={c.partner_id} className={`chat-list-item ${active?.partner_id===c.partner_id?'active':''}`} onClick={() => setActive(c)}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {c.partner_name?.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <p className="chat-partner-name" style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.partner_name}</p>
                      {c.unread_count>0 && <span style={{ background:'var(--brand)', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:700 }}>{c.unread_count}</span>}
                    </div>
                    <p className="chat-preview" style={{ fontSize:11, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.last_message}</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        <div className="chat-window">
          {!active ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, color:'var(--muted)' }}>
              <MessageCircle size={48} style={{ opacity:.2 }}/>
              <p style={{ fontSize:14 }}>Select a conversation</p>
            </div>
          ) : (
            <>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
                  {active.partner_name?.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700 }}>{active.partner_name}</p>
                  <p style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{active.partner_role}</p>
                </div>
              </div>
              <div className="chat-messages">
                {msgs.map((m,i) => {
                  const mine = m.sender===user.id
                  return (
                    <div key={i} style={{ display:'flex', flexDirection:mine?'row-reverse':'row', gap:8, alignItems:'flex-end' }}>
                      <div>
                        <div className={`chat-bubble ${mine?'mine':'theirs'}`}>{m.content}</div>
                        <p style={{ fontSize:10, color:'var(--muted)', marginTop:4, textAlign:mine?'right':'left' }}>
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={msgEnd}/>
              </div>
              <div className="chat-input-row">
                <input className="chat-input" placeholder="Type a message..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}/>
                <button onClick={send} disabled={!text.trim()} className="btn btn-primary" style={{ borderRadius:20, paddingInline:20 }}><Send size={15}/></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
