"use client";

import { useEffect, useRef } from "react";
import { activeRain } from "@/lib/rain";
import { PRODUCTS } from "@/lib/products";

type Particle = {
  img: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  sway: number;
  swaySpeed: number;
  alpha: number;
};

const MAX_PARTICLES = 220;

/**
 * Chuva de balas em canvas, fixa sobre a página inteira.
 *
 * Fica montada o tempo todo e nunca re-renderiza: o loop lê `activeRain()`
 * a cada frame e as seções de produto empurram a intensidade conforme o
 * scroll. Quando a intensidade cai a zero, para de gerar partículas e deixa
 * as que estão no ar terminarem a queda.
 */
export default function CandyRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pré-carrega todos os sprites uma vez para não engasgar na transição.
    const images = new Map<string, HTMLImageElement>();
    for (const product of PRODUCTS) {
      const img = new Image();
      img.src = product.images.solo;
      images.set(product.images.solo, img);
    }

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    let pending = 0;
    let last = performance.now();
    let frame = 0;
    /** 0 enquanto há chuva ativa, sobe até 1 quando ela para */
    let fade = 0;
    const FADE_SECONDS = 0.55;

    const spawn = (entry: NonNullable<ReturnType<typeof activeRain>>) => {
      const img = images.get(entry.src);
      if (!img?.complete || img.naturalWidth === 0) return;
      if (particles.length >= MAX_PARTICLES) return;

      const scale = 0.65 + Math.random() * 0.55;
      const size = entry.size * scale;
      particles.push({
        img,
        x: Math.random() * (width + size) - size / 2,
        // nasce logo acima da dobra: uma bala que nasce muito alto demora
        // segundos para cair e acaba invadindo a seção seguinte
        y: -size - Math.random() * height * 0.1,
        vx: (Math.random() - 0.5) * 40,
        // as balas menores caem um pouco mais devagar: dá profundidade
        vy: (320 + Math.random() * 240) * (0.75 + scale * 0.35),
        rot: Math.random() * Math.PI * 2,
        vrot: ((Math.random() - 0.5) * entry.spin * Math.PI) / 180,
        size,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.8 + Math.random() * 1.4,
        alpha: 0.72 + scale * 0.28,
      });
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);

      // Trava o passo: se a aba ficou em background, não despeja mil balas de uma vez.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const entry = activeRain();

      if (entry) {
        fade = 0;
        pending += entry.rate * entry.intensity * dt;
        while (pending >= 1) {
          pending -= 1;
          spawn(entry);
        }
      } else {
        pending = 0;
        // Sem chuva ativa: as balas que sobraram somem depressa em vez de
        // continuarem caindo por segundos e invadirem a seção seguinte.
        fade = Math.min(fade + dt / FADE_SECONDS, 1);
        if (fade >= 1 && particles.length) particles.length = 0;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.sway += p.swaySpeed * dt;
        p.x += (p.vx + Math.sin(p.sway) * 26) * dt;
        // caindo mais rápido enquanto some, para limpar a tela mais cedo
        p.y += p.vy * (1 + fade * 1.6) * dt;
        p.rot += p.vrot * dt;

        if (p.y - p.size > height) {
          particles.splice(i, 1);
          continue;
        }

        const ratio = p.img.naturalHeight / p.img.naturalWidth;
        const w = p.size;
        const h = p.size * ratio;

        ctx.save();
        ctx.globalAlpha = p.alpha * (1 - fade);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(p.img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
