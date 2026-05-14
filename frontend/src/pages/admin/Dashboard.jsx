import React, { useState, useEffect } from 'react'
import { api } from '../../App.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [data, setData]     = useState({ users:[], gigs:[], orders:[] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/users/').catch(()=>({data:[]})),
      api.get('/api/admin/gigs/').catch(()=>({data:[]})),
      api.get('/api/admin/orders/').catch(()=>({data:[]})),
    ]).then(([u,g,o]) => setData({users:u.data,gigs:g.data,orders:o.data})).finally(()=>setLoading(false))
  }, [])

  const revenue = data.orders.filter(o=>o.status==='completed').reduce((s,o)=>s+Number(o.amount),0)
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now=new Date()
  const chartData=Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-(5-i),1)
    const mo=data.orders.filter(o=>{
      if(!o.created_at)return false
      const od=new Date(o.created_at)
      return od.getFullYear()===d.getFullYear()&&od.getMonth()===d.getMonth()&&o.status==='completed'
    })
    return {name:months[d.getMonth()], revenue:mo.reduce((s,o)=>s+Number(o.amount),0), orders:mo.length}
  })

  const STATS = [
    {icon:'👥', label:'Total Users',    value:data.users.length,                                     color:'var(--brand)'},
    {icon:'🎯', label:'Active Gigs',    value:data.gigs.filter(g=>g.is_active).length,               color:'#a78bfa'},
    {icon:'📋', label:'Total Orders',   value:data.orders.length,                                    color:'var(--warning)'},
    {icon:'💰', label:'Platform Revenue',value:`₹${revenue.toLocaleString()}`,                      color:'var(--success)'},
    {icon:'🛒', label:'Completed Orders',value:data.orders.filter(o=>o.status==='completed').length},
    {icon:'🌟', label:'Sellers',        value:data.users.filter(u=>u.role==='seller').length,        color:'#f59e0b'},
  ]

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Platform Overview</h1>
      <p className="portal-page-sub">FreelanceHub administration panel</p>

      <div className="stats-grid" style={{marginBottom:24}}>
        {STATS.map(s=>(
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{color:s.color}}>{loading?'—':s.value}</p>
            <p className="stat-icon">{s.icon}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:20,marginBottom:20}}>
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>Revenue & Orders</h3>
          <p style={{fontSize:12,color:'var(--muted)',marginBottom:20}}>Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip contentStyle={{background:'var(--card)',border:'none',borderRadius:8}} itemStyle={{fontWeight:700}}/>
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} name="Revenue (₹)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>User Distribution</h3>
          {['buyer','seller'].map(role=>{
            const count=data.users.filter(u=>u.role===role).length
            const pct=data.users.length?Math.round(count/data.users.length*100):0
            return (
              <div key={role} style={{marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13,fontWeight:600}}>
                  <span style={{textTransform:'capitalize'}}>{role}s</span><span>{count} ({pct}%)</span>
                </div>
                <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:role==='seller'?'#a78bfa':'var(--brand)',borderRadius:4,transition:'width 1s'}}/>
                </div>
              </div>
            )
          })}
          <div style={{marginTop:24}}>
            <h3 style={{fontSize:13,fontWeight:700,marginBottom:12}}>Order Status Breakdown</h3>
            {['pending','in_progress','completed','cancelled'].map(s=>{
              const count=data.orders.filter(o=>o.status===s).length
              const pct=data.orders.length?Math.round(count/data.orders.length*100):0
              const colors={pending:'#fbbf24',in_progress:'#818cf8',completed:'#4ade80',cancelled:'#f87171'}
              return (
                <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,textTransform:'capitalize',color:'var(--text2)'}}>{s.replace('_',' ')}</span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:80,height:6,background:'var(--border)',borderRadius:3}}>
                      <div style={{height:'100%',width:`${pct}%`,background:colors[s],borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:11,color:'var(--muted)',width:24,textAlign:'right'}}>{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card" style={{padding:24}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Recent Orders</h3>
        <div style={{overflow:'auto'}}>
          <table className="data-table">
            <thead><tr><th>Gig</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {data.orders.slice(0,8).map(o=>(
                <tr key={o.id}>
                  <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.gig_title}</td>
                  <td>{o.buyer_name}</td>
                  <td>{o.seller_name}</td>
                  <td style={{color:'var(--brand)',fontWeight:700}}>₹{Number(o.amount).toLocaleString()}</td>
                  <td><span className={`badge badge-${{pending:'yellow',accepted:'blue',in_progress:'purple',delivered:'green',completed:'green',cancelled:'red'}[o.status]||'gray'}`}>{o.status}</span></td>
                  <td style={{color:'var(--muted)'}}>{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
