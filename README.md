# Fini — Landing Page (conceito)

Landing page de produto com narrativa guiada por scroll: apresentação da
marca, cada bala entrando e saindo de cena com o nome em tipografia grande,
uma chuva da bala respectiva cobrindo a virada entre um produto e o
seguinte, e uma seção institucional no fim.

> **Peça de demonstração.** Não é comunicação oficial da Fini. Textos,
> imagens e informações de produto são de rascunho — substitua por material
> aprovado antes de qualquer uso público.

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

Requer Node 20+.

## ⚠️ As imagens atuais são provisórias

Os PNGs em `public/products/` foram **recortados do print do briefing**, não
dos arquivos originais. São de baixa resolução (miniaturas de ~180px
ampliadas 3×) e servem só para a animação rodar. Dois arquivos nem existiam
no print e estão marcados como `FALTA PNG` na tela.

Para finalizar, substitua os arquivos abaixo mantendo **exatamente** os
mesmos nomes — nada no código precisa mudar:

| Arquivo | O que é | Situação |
|---|---|---|
| `ursinhos-pack.png` | embalagem | ❌ **falta** — placeholder na tela |
| `ursinhos-solo.png` | bala isolada | ⚠️ provisório |
| `ursinhos-pile.jpg` | textura com várias | ⚠️ provisório |
| `minhocas-pack.png` | embalagem | ⚠️ provisório |
| `minhocas-solo.png` | bala isolada | ⚠️ provisório |
| `minhocas-pile.jpg` | textura com várias | ⚠️ provisório |
| `beijos-pack.png` | embalagem | ⚠️ provisório |
| `beijos-solo.png` | bala isolada | ⚠️ provisório |
| `beijos-pile.jpg` | textura com várias | ⚠️ provisório |
| `dentaduras-pack.png` | embalagem | ⚠️ provisório |
| `dentaduras-solo.png` | bala isolada | ⚠️ provisório |
| `dentaduras-pile.jpg` | textura com várias | ⚠️ provisório |
| `azedinhas-pack.png` | embalagem | ⚠️ provisório |
| `azedinhas-solo.png` | bala isolada | ❌ **falta** — placeholder na tela |
| `azedinhas-pile.jpg` | textura com várias | ⚠️ provisório |

Requisitos dos arquivos definitivos:

- **`-pack.png`** e **`-solo.png`**: PNG com **fundo transparente**, recorte
  limpo, sem sombra embutida (a página aplica a própria). Lado maior a
  partir de 1000px.
- **`-solo.png`** é também o sprite da chuva — quanto mais limpo o recorte,
  melhor o efeito. Uma única bala funciona melhor que um grupo.
- **`-pile.jpg`**: foto de várias balas preenchendo o quadro, usada como
  textura de fundo. A partir de 1600px de largura.

## Estrutura

```
app/
  layout.tsx          fontes (Fredoka + Nunito) e metadata
  page.tsx            monta herói → 5 produtos → institucional
  globals.css         tokens de cor, classe .wordmark
components/
  Hero.tsx            apresentação da marca, com parallax
  ProductSection.tsx  seção de produto guiada por scroll
  CandyRain.tsx       chuva de balas em canvas
  Institutional.tsx   grade de produtos + pilares + fecho
  ScrollProgress.tsx  barra de progresso no topo
lib/
  products.ts         ⭐ todo o conteúdo editável
  rain.ts             estado compartilhado da chuva
```

### Editando conteúdo

Praticamente tudo — nomes, textos, cores, atributos e ajuste fino da chuva —
vive em **`lib/products.ts`**. Adicionar ou remover um produto é adicionar ou
remover um item do array; o resto da página se ajusta sozinho.

```ts
{
  id: "minhocas",
  name: "Minhocas",
  tagline: "Compridas, coloridas, impossíveis de resistir.",
  theme: { from: "#FFD200", to: "#E8452B", accent: "#FFF3A8", ink: "#3A1A00" },
  rain:  { size: 92, rate: 22, spin: 140 },  // px, balas/s, giro °/s
}
```

## Como a animação funciona

Cada produto ocupa uma seção de `300vh` com um palco `sticky` dentro. O
progresso do scroll dentro da seção é a linha do tempo do produto:

```
0.00 ─ 0.20   entrada    bala e nome chegam
0.20 ─ 0.58   leitura    informações à vista
0.58 ─ 1.00   saída      bala e nome vão embora + chuva
```

A emenda entre dois sabores é feita por **duas chuvas que se encaixam**: a
seção que sai despeja a própria bala de `0.58` a `1.00`, e a seção seguinte
continua despejando a bala **anterior** do seu `0.00` ao `0.30`. Assim a
chuva só cessa depois que o próximo produto já entrou em cena.

A chuva é um sistema de partículas em `<canvas>` que **nunca re-renderiza
pelo React**: as seções escrevem intensidade num store de módulo
(`lib/rain.ts`) e o loop de animação lê o vencedor a cada frame. É o que
mantém o scroll fluido com centenas de sprites na tela.

`prefers-reduced-motion: reduce` desliga a chuva por completo.

## Tipografia

A fonte do wordmark da Fini é proprietária. A página usa **Fredoka** (Google
Fonts, licença SIL Open Font) com peso 700, `letter-spacing` fechado e um
`skew` leve — a aproximação livre mais próxima do desenho arredondado do
original. O corpo de texto é **Nunito**.

Se o material aprovado incluir a fonte oficial, troque `--font-display` em
`app/globals.css`.

## Stack

Next.js 15 (App Router) · React 19 · Motion 12 · Tailwind CSS 4 ·
TypeScript
