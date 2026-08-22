"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { PRODUCTS } from "@/lib/products";

const PILLARS = [
  {
    title: "Formato é personalidade",
    body: "Minhoca, dentadura, beijo, ursinho. Antes de ser sabor, a bala Fini é um formato reconhecível a metros de distância — e é isso que faz a criança apontar a embalagem na prateleira.",
  },
  {
    title: "Textura acima de tudo",
    body: "Goma elástica, marshmallow macio, cobertura de açúcar cristal ou ácido. Cada linha tem uma mordida diferente, e a escolha da textura vem antes da escolha do sabor.",
  },
  {
    title: "Feita para dividir",
    body: "Pacote aberto no meio da roda, no recreio, no cinema, no banco de trás do carro. O produto é individual, mas o consumo quase nunca é.",
  },
  {
    title: "Do clássico ao desafio",
    body: "A linha vai do ursinho que agrada todo mundo até a minhoca azedinha que separa a mesa entre quem aguenta e quem passa o pacote adiante.",
  },
];

/** Sobe e aparece quando entra no viewport. */
const rise = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0 },
};

export default function Institutional() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // O wordmark de fecho cresce devagar durante toda a seção.
  const closingScale = useTransform(scrollYProgress, [0.6, 1], [0.86, 1]);

  return (
    <section ref={ref} id="institucional" className="relative bg-fini-cream">
      {/* ---------------- abertura ---------------- */}
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-10 md:pt-40">
        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-5 text-sm font-extrabold uppercase tracking-[0.35em] text-fini-blue"
        >
          A linha completa
        </motion.p>

        <motion.h2
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="wordmark max-w-4xl text-[13vw] text-fini-red sm:text-[9vw] lg:text-[6.5rem]"
        >
          Todo mundo tem a sua
        </motion.h2>

        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.16 }}
          className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-fini-ink/70"
        >
          Cinco produtos, cinco texturas, cinco jeitos de abrir o pacote.
          Passe pela linha inteira e escolha o seu lado.
        </motion.p>
      </div>

      {/* ---------------- grade de produtos ---------------- */}
      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <motion.a
              key={product.id}
              href={`#${product.id}`}
              variants={rise}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: (i % 3) * 0.09 }}
              whileHover={{ y: -10, rotate: i % 2 ? 1.2 : -1.2 }}
              className="group relative overflow-hidden rounded-[2rem] border-4 border-white p-7 shadow-[0_18px_40px_rgba(0,0,0,0.14)] transition-shadow hover:shadow-[0_28px_60px_rgba(0,0,0,0.22)]"
              style={{
                background: `linear-gradient(160deg, ${product.theme.from} 0%, ${product.theme.to} 100%)`,
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${product.images.pile})` }}
              />

              <div className="relative flex h-full flex-col">
                <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/75">
                  {product.eyebrow}
                </span>

                <h3
                  style={{ color: product.theme.ink }}
                  className="wordmark wordmark-outlined mt-2 text-5xl sm:text-6xl"
                >
                  {product.name}
                </h3>

                <p className="mt-3 text-pretty text-base font-bold leading-snug text-white drop-shadow">
                  {product.tagline}
                </p>

                <div className="mt-6 flex flex-1 items-end justify-center pt-4">
                  <motion.img
                    src={product.images.pack}
                    alt={`Embalagem de ${product.name} da Fini`}
                    className="h-48 w-auto select-none object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {product.notes.map((note) => (
                    <li
                      key={note.label}
                      className="rounded-full border-2 border-white/30 bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm"
                    >
                      {note.value}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* ---------------- pilares ---------------- */}
      <div className="bg-fini-ink py-28 text-fini-cream">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <motion.h2
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="wordmark max-w-3xl text-[11vw] text-fini-yellow sm:text-[7vw] lg:text-[5rem]"
          >
            O que faz uma bala virar Fini
          </motion.h2>

          <div className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                variants={rise}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.65, ease: "easeOut", delay: (i % 2) * 0.1 }}
                className="border-t-4 border-fini-red pt-6"
              >
                <h3 className="wordmark text-3xl text-fini-cream sm:text-4xl">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-pretty text-base leading-relaxed text-fini-cream/65">
                  {pillar.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- fecho ---------------- */}
      <div className="relative overflow-hidden bg-fini-red py-36">
        <motion.div
          style={{ scale: closingScale }}
          className="mx-auto max-w-7xl px-6 text-center md:px-10"
        >
          <motion.p
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-sm font-extrabold uppercase tracking-[0.35em] text-white/70"
          >
            Abre, divide, acaba
          </motion.p>

          <motion.p
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="wordmark wordmark-outlined mt-6 text-[26vw] text-transparent sm:text-[20vw] lg:text-[16rem]"
          >
            Fini
          </motion.p>
        </motion.div>
      </div>

      <footer className="bg-fini-ink px-6 py-12 text-center text-sm text-fini-cream/50 md:px-10">
        <p className="mx-auto max-w-2xl text-pretty leading-relaxed">
          Peça conceitual criada para demonstração de layout e animação. Não é
          uma comunicação oficial da Fini, e os textos e imagens são de
          rascunho — substitua por material aprovado antes de qualquer uso
          público.
        </p>
      </footer>
    </section>
  );
}
