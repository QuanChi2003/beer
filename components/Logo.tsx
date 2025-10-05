
export default function Logo({small=false}:{small?:boolean}){
  return (
    <div className={(small ? 'text-2xl' : 'text-4xl md:text-5xl') + ' font-display tracking-wide'}>
      <span className="inline-block -mt-1">🍺</span>
      <span className="ml-2 font-extrabold text-beer-dark">Beer</span>
      <span className="ml-1 font-extrabold text-brand">Cầu Gẫy</span>
    </div>
  )
}
