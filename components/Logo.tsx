
export default function Logo({small=false}:{small?:boolean}){
  return (
    <div className={(small ? 'text-2xl' : 'text-4xl md:text-5xl') + ' font-extrabold'}>
      🍺 Beer <span className="text-amber-500">Cầu Gẫy</span>
    </div>
  )
}
