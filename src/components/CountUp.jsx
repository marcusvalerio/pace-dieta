import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

export function CountUp({ value, duration = 1.1, format = (v) => Math.round(v) }) {
  const [display, setDisplay] = useState(0)
  const mv = useMotionValue(0)

  useEffect(() => {
    const controls = animate(mv, value, {
      duration, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v)
    })
    return controls.stop
  }, [value])

  return <>{format(display)}</>
}
