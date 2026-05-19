import React, { useState, useEffect } from 'react'
import { api, useAuth } from '../../App.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function SellerEarnings() {
  const { user }  = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const localUser  = JSON.parse(localStorage.getItem('fh_user') || 'null') || user
  const userId     = localUser?.id

  useEffect(() => {
    if (!userId) return
    api.get('/api/orders/').then(r=>setOrders(r.data.filter(o=>o.seller===userId))).catch(()=>{}).finally(()=>setLoading(false))
  }, [userId])

  const completed = orders.filter(o=>o.status==='completed')
  const pending   = orders.filter(o=>o.status==='delivered')
  const total     = completed.reduce((s,o)=>s+Number(o.amount),0)
  const pendingAmt= pending.reduce((s,o)=>s+Number(o.amount),0)
  const thisMonth = completed.filter(o=>{ const d=new Date(o.created_at); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear() })
  const thisMonthAmt = thisMonth.reduce((s,o)=>s+Number(o.amount),0)

  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now=new Date()
  const chartData=Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-(5-i),1)
    const mo=completed.filter(o=>{const od=new Date(o.created_at);return od.getFullYear()===d.getFullYear()&&od.getMonth()===d.getMonth()})
    return {name:months[d.getMonth()],earnings:mo.reduce((s,o)=>s+Number(o.amount),0), orders:mo.length}
  })

  return (
    <div className="portal-page">
      <h1 className="portal-page-title">Earnings</h1>
      <p className="portal-page-sub">Your revenue breakdown</p>

      <div className="stats-grid" style={{ marginBottom:24 }}>
        {[
          {icon:<DollarSign size={20}/>, label:'Total Earned',    value:`₹${total.toLocaleString()}`,     color:'var(--success)'},
          {icon:<TrendingUp size={20}/>, label:'This Month',      value:`₹${thisMonthAmt.toLocaleString()}`, color:'var(--brand)'},
          {icon:<Clock size={20}/>,      label:'Pending Release', value:`₹${pendingAmt.toLocaleString()}`, color:'var(--warning)'},
          {icon:<CheckCircle size={20}/>,label:'Paid Orders',     value:completed.length},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{color:s.color}}>{loading?'—':s.value}</p>
            <div style={{color:s.color,opacity:.6,marginTop:4}}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>Monthly Earnings</h3>
          <p style={{fontSize:12,color:'var(--muted)',marginBottom:20}}>Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:11}} tickFormatter={v=>`₹${v}`}/>
              <Tooltip contentStyle={{background:'var(--card)',border:'none',borderRadius:8}} itemStyle={{color:'var(--brand)',fontWeight:700}}/>
              <Bar dataKey="earnings" fill="var(--brand)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:20}}>Order History</h3>
          <table className="data-table">
            <thead><tr><th>Gig</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {completed.slice(0,8).map(o=>(
                <tr key={o.id}>
                  <td style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.gig_title}</td>
                  <td style={{color:'var(--success)',fontWeight:700}}>₹{Number(o.amount).toLocaleString()}</td>
                  <td style={{color:'var(--muted)'}}>{o.created_at?.slice(0,10)}</td>
                </tr>
              ))}
              {completed.length===0 && <tr><td colSpan={3} style={{textAlign:'center',color:'var(--muted)',padding:24}}>No earnings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
