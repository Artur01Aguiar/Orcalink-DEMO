"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
} from "motion/react";
import type { Product } from "@/lib/products";
import { setRain, clearRain } from "@/lib/rain";

/**
 * Uma seção por produto, com 300vh de altura e um palco `sticky` dentro.
 *
 * O progresso do scroll dentro da seção vira a linha do tempo do produto:
 *
 *   0.00 ─ 0.20  entrada (bala e nome chegam)
 *   0.20 ─ 0.58  leitura (informações à vista, parallax leve)
 *   0.58 ─ 1.00  saída (bala e nome vão embora) + chuva de balas
 *
 * A emenda entre dois sabores é feita por duas chuvas que se encaixam: a
 * seção que está saindo despeja a própria bala de 0.58 até 1.00, e a seção
 * seguinte continua despejando a bala ANTERIOR (a "cauda") do seu 0.00 até
 * 0.30 — ou seja, a chuva só cessa depois que o próximo produto já entrou
 * em cena, que é o efeito pedido.
 *
 * As duas chuvas só são registradas enquanto a seção está visível: sem isso,
 * toda seção abaixo da dobra ficaria com progresso 0 no carregamento e a
 * cauda dispararia na página inteira de uma vez.
 */
export default function ProductSection({
  product,
  previous,
  index,
}: {
  product: Product;
  previous?: Product;
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // ---- palco -------------------------------------------------------------
  const packX = useTransform(scrollYProgress, [0, 0.2, 0.58, 1], ["55%", "0%", "0%", "-45%"]);
  const packY = useTransform(scrollYProgress, [0, 0.2, 0.58, 1], ["18%", "0%", "-4%", "-26%"]);
  const packRotate = useTransform(scrollYProgress, [0, 0.2, 0.58, 1], [16, 0, -2, -18]);
  const packOpacity = useTransform(scrollYProgress, [0, 0.14, 0.82, 0.98], [0, 1, 1, 0]);
  const packScale = useTransform(scrollYProgress, [0, 0.2, 1], [0.78, 1, 0.88]);

  // a bala solta flutua em contraponto à embalagem
  const soloY = useTransform(scrollYProgress, [0, 1], ["30%", "-70%"]);
  const soloRotate = useTransform(scrollYProgress, [0, 1], [-22, 26]);
  const soloOpacity = useTransform(scrollYProgress, [0, 0.16, 0.78, 0.94], [0, 1, 1, 0]);

  // ---- texto -------------------------------------------------------------
  const textX = useTransform(scrollYProgress, [0, 0.2, 0.58, 1], ["-12%", "0%", "0%", "-16%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.16, 0.76, 0.95], [0, 1, 1, 0]);
  const nameScale = useTransform(scrollYProgress, [0, 0.2, 1], [0.82, 1, 1.08]);

  // fundo de textura respira devagar
  const pileScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.35]);
  const pileOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.1, 0.22, 0.22, 0.1]);

  // ---- chuva -------------------------------------------------------------
  const ownKey = `${product.id}:own`;
  const tailKey = `${product.id}:tail`;

  /** a própria bala, enquanto este produto sai de cena */
  const ownIntensity = useTransform(
    scrollYProgress,
    [0.58, 0.74, 0.98, 1],
    [0, 1, 1, 0],
  );

  /** a bala do produto anterior, ainda caindo enquanto este entra */
  const tailIntensity = useTransform(scrollYProgress, [0, 0.18, 0.3], [1, 1, 0]);

  /**
   * Reescreve as duas entradas de chuva a partir do estado atual.
   *
   * Precisa ser chamado tanto quando o scroll muda quanto quando `inView`
   * muda: o IntersectionObserver resolve um tick depois do evento de scroll,
   * então numa página aberta já rolada (link com âncora, F5 no meio, restauro
   * de posição) o evento de scroll chegaria com `inView` ainda falso, limparia
   * a chuva e nunca mais seria disparado — o scroll está parado.
   */
  const sync = useCallback(() => {
    const write = (
      key: string,
      source: Product | undefined,
      intensity: number,
    ) => {
      if (!source || !inView || intensity <= 0.01) {
        clearRain(key);
        return;
      }
      setRain(key, {
        src: source.images.solo,
        intensity,
        size: source.rain.size,
        rate: source.rain.rate,
        spin: source.rain.spin,
      });
    };

    write(ownKey, product, ownIntensity.get());
    write(tailKey, previous, tailIntensity.get());
  }, [inView, ownKey, tailKey, product, previous, ownIntensity, tailIntensity]);

  useMotionValueEvent(ownIntensity, "change", sync);
  useMotionValueEvent(tailIntensity, "change", sync);
  useEffect(sync, [sync]);

  useEffect(
    () => () => {
      clearRain(ownKey);
      clearRain(tailKey);
    },
    [ownKey, tailKey],
  );

  return (
    <section
      ref={ref}
      id={product.id}
      className="relative h-[300vh]"
      style={{
        background: `linear-gradient(160deg, ${product.theme.from} 0%, ${product.theme.to} 100%)`,
      }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* textura de balas ao fundo */}
        <motion.div
          aria-hidden="true"
          style={{
            scale: pileScale,
            opacity: pileOpacity,
            backgroundImage: `url(${product.images.pile})`,
          }}
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-6 md:grid-cols-2 md:gap-4 md:px-10">
          {/* ---------------- texto ---------------- */}
          <motion.div
            style={{ x: textX, opacity: textOpacity }}
            className="order-2 text-white md:order-1"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="wordmark text-2xl text-white/55">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-10 bg-white/40" />
              <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-white/80">
                {product.eyebrow}
              </span>
            </div>

            <motion.h2
              style={{
                scale: nameScale,
                transformOrigin: "left center",
                // miolo escuro + contorno branco: é assim que o nome
                // sobrevive tanto ao laranja quanto ao magenta
                color: product.theme.ink,
              }}
              className="wordmark wordmark-outlined text-[19vw] drop-shadow-[0_8px_0_rgba(0,0,0,0.18)] sm:text-[14vw] md:text-[8.5vw] lg:text-[7.5rem]"
            >
              {product.name}
            </motion.h2>

            <p className="mt-5 max-w-md text-pretty text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3xl">
              {product.tagline}
            </p>

            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-white/85 drop-shadow sm:text-lg">
              {product.description}
            </p>

            <dl className="mt-8 flex flex-wrap gap-2.5">
              {product.notes.map((note) => (
                <div
                  key={note.label}
                  className="rounded-2xl border-2 border-white/30 bg-white/15 px-4 py-2.5 backdrop-blur-sm"
                >
                  <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-white/70">
                    {note.label}
                  </dt>
                  <dd className="text-sm font-extrabold text-white">
                    {note.value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* ---------------- produto ---------------- */}
          <div className="relative order-1 flex h-[42vh] items-center justify-center md:order-2 md:h-[78vh]">
            <motion.img
              src={product.images.solo}
              alt=""
              aria-hidden="true"
              style={{ y: soloY, rotate: soloRotate, opacity: soloOpacity }}
              className="absolute left-0 top-1/4 w-28 select-none drop-shadow-2xl sm:w-40 md:w-52"
            />

            <motion.img
              src={product.images.pack}
              alt={`Embalagem de ${product.name} da Fini`}
              style={{
                x: packX,
                y: packY,
                rotate: packRotate,
                opacity: packOpacity,
                scale: packScale,
              }}
              className="relative z-10 max-h-full w-auto max-w-[70%] select-none object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
