
'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
export type CartItem = { id:string, name:string, price:number, qty:number }
type CtxType = { items:CartItem[], add:(i:CartItem)=>void, setQty:(id:string,qty:number)=>void, remove:(id:string)=>void, clear:()=>void, total:number }
const Ctx = createContext<CtxType|null>(null)
export function CartProvider({children}:{children:React.ReactNode}){
  const [items,setItems] = useState<CartItem[]>([])
  useEffect(()=>{ const s=localStorage.getItem('cart'); if(s) setItems(JSON.parse(s)) },[])
  useEffect(()=>{ localStorage.setItem('cart', JSON.stringify(items)) },[items])
  const add=(i:CartItem)=> setItems(prev=>{ const ex=prev.find(p=>p.id===i.id); if(ex) return prev.map(p=>p.id===i.id?{...p, qty:p.qty+i.qty}:p); return [...prev, i] })
  const setQty=(id:string, qty:number)=> setItems(prev=>prev.map(p=>p.id===id?{...p, qty}:p))
  const remove=(id:string)=> setItems(prev=>prev.filter(p=>p.id!==id))
  const clear=()=> setItems([])
  const total = useMemo(()=>items.reduce((s,i)=>s+i.price*i.qty,0),[items])
  return <Ctx.Provider value={{items, add, setQty, remove, clear, total}}>{children}</Ctx.Provider>
}
export const useCart = ()=> useContext(Ctx)!
