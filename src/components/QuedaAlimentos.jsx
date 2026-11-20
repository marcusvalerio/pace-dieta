import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { TILES } from '../lib/tilesAlimentos'

// Quadrados de alimentos caem e enchem a tela. Dá pra arrastar e jogar.
export default function QuedaAlimentos() {
  const ref = useRef(null)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    const { Engine, Bodies, Composite, Mouse, MouseConstraint } = Matter
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches
    const w = box.clientWidth, h = box.clientHeight
    const base = w < 600 ? 84 : 112
    const engine = Engine.create({ gravity: { y: 1.1 } })
    const parede = 400
    Composite.add(engine.world, [
      Bodies.rectangle(w / 2, h + parede / 2, w * 3, parede, { isStatic: true }),
      Bodies.rectangle(-parede / 2, 0, parede, h * 6, { isStatic: true }),
      Bodies.rectangle(w + parede / 2, 0, parede, h * 6, { isStatic: true }),
    ])
    const n = Math.min(160, Math.ceil((w * h) / (base * base) * 1.15))
    const corpos = []
    for (let i = 0; i < n; i++) {
      const t = TILES[(i * 7) % TILES.length]
      const sz = base * (0.82 + Math.random() * 0.36)
      const el = document.createElement('div')
      el.style.cssText = `position:absolute;left:0;top:0;width:${sz}px;height:${sz}px;border-radius:24%;background:${t[0]};display:flex;align-items:center;justify-content:center;cursor:grab;will-change:transform;user-select:none`
      el.innerHTML = t[1].replace('<svg ', `<svg width="${sz * 0.52}" height="${sz * 0.52}" `)
      box.appendChild(el)
      const b = Bodies.rectangle(sz / 2 + Math.random() * (w - sz), -sz - i * (h / n) * 1.6, sz, sz,
        { chamfer: { radius: sz * 0.24 }, restitution: 0.25, friction: 0.5, angle: (Math.random() - 0.5) * 1.2 })
      Composite.add(engine.world, b)
      corpos.push([el, b, sz])
    }
    const mouse = Mouse.create(box)
    mouse.element.removeEventListener('wheel', mouse.mousewheel)
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel)
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)
    Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } }))

    const desenha = () => corpos.forEach(([el, b, sz]) => {
      el.style.transform = `translate(${b.position.x - sz / 2}px,${b.position.y - sz / 2}px) rotate(${b.angle}rad)`
    })
    let raf, ult = performance.now()
    if (reduz) { for (let k = 0; k < 900; k++) Engine.update(engine, 1000 / 60); desenha() }
    const passo = (agora) => { Engine.update(engine, Math.min(32, agora - ult)); ult = agora; desenha(); raf = requestAnimationFrame(passo) }
    raf = requestAnimationFrame(passo)

    return () => { cancelAnimationFrame(raf); Engine.clear(engine); box.innerHTML = '' }
  }, [])

  return <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'pan-y' }} />
}
