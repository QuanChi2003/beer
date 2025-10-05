
'use client'
import { createContext, useContext, useState } from 'react'
type Toast = { id:string, text:string }
const Ctx = createContext<{push:(s:string)=>void}|null>(null)
export function ToastProvider({children}:{children:React.ReactNode}){
  const [list,setList] = useState<Toast[]>([])
  const push=(text:string)=>{ const id=Math.random().toString(36).slice(2); setList(s=>[...s,{id,text}]); setTimeout(()=>setList(s=>s.filter(x=>x.id!==id)),2200) }
  return <Ctx.Provider value={{push}}>
    {children}
    <div className="toast-wrap">{list.map(t=><div className="toast" key={t.id}>{t.text}</div>)}</div>
  </Ctx.Provider>
}
export const useToast = ()=> useContext(Ctx)!
