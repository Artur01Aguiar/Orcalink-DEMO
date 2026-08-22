"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barra fina no topo mostrando o quanto da história já passou. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-1.5 origin-left bg-fini-yellow"
    />
  );
}
