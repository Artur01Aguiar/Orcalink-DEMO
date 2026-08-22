"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PRODUCTS } from "@/lib/products";

/** Balas flutuando no fundo do herói, cada uma com seu próprio parallax. */
const FLOATERS = [
  { src: PRODUCTS[1].images.solo, top: "12%", left: "6%", size: 150, depth: 220, delay: 0.1 },
  { src: PRODUCTS[0].images.solo, top: "68%", left: "10%", size: 120, depth: 130, delay: 0.25 },
  { src: PRODUCTS[3].images.solo, top: "18%", left: "78%", size: 165, depth: 300, delay: 0.18 },
  { src: PRODUCTS[2].images.solo, top: "72%", left: "82%", size: 110, depth: 170, delay: 0.32 },
  { src: PRODUCTS[4].images.solo, top: "44%", left: "88%", size: 130, depth: 90, delay: 0.4 },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // O bloco de texto sobe e some enquanto a seção sai de cena.
  const textY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-fini-cream px-6 py-24"
    >
      {/* clarão quente atrás do wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,210,0,0.55) 0%, rgba(228,0,43,0.28) 45%, rgba(255,248,236,0) 70%)",
        }}
      />

      {FLOATERS.map((f, i) => (
        <Floater key={i} {...f} progress={scrollYProgress} />
      ))}

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6 text-sm font-extrabold uppercase tracking-[0.35em] text-fini-blue"
        >
          Mundo Fini
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.86, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: 0.08 }}
          className="wordmark wordmark-outlined text-[24vw] text-fini-red drop-shadow-[0_10px_0_rgba(0,87,184,0.22)] sm:text-[18vw] lg:text-[15rem]"
        >
          Fini
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="mx-auto mt-4 max-w-xl text-balance text-xl font-extrabold text-fini-ink sm:text-2xl"
        >
          Goma não é só doce. É recreio, cinema, viagem de carro e aquele saco
          que some antes de todo mundo pegar.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.42 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-fini-ink/70 sm:text-lg"
        >
          A Fini transformou formato em personalidade: minhoca, dentadura,
          beijo, ursinho. Cada bala tem uma textura, um sabor e um jeito
          próprio de ser comida. Role a página e conheça a linha inteira —
          uma de cada vez.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-fini-ink/50">
            Role para começar
          </span>
          <motion.span
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-11 w-7 items-start justify-center rounded-full border-[3px] border-fini-ink/25 pt-2"
          >
            <span className="h-2 w-2 rounded-full bg-fini-red" />
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Floater({
  src,
  top,
  left,
  size,
  depth,
  delay,
  progress,
}: {
  src: string;
  top: string;
  left: string;
  size: number;
  depth: number;
  delay: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(progress, [0, 1], [0, -depth]);

  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      style={{ top, left, width: size, y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay }}
      className="pointer-events-none absolute hidden select-none drop-shadow-2xl md:block"
    />
  );
}
