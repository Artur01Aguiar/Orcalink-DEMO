# Clawd Studio

Gera Reels 9:16 (1080x1920) com o bonequinho 3D do Claude conversando, a partir de um roteiro JSON.
Tudo local: Three.js renderizado no Chromium headless, voz por TTS (espeak-ng + MBROLA pt-BR), montagem com ffmpeg.

## Requisitos

```bash
sudo apt-get install -y ffmpeg espeak-ng mbrola mbrola-br1 mbrola-br3 mbrola-br4
npm install
npx playwright install chromium   # se ainda não tiver o Chromium do Playwright
```

## Uso

```bash
node render.mjs episodes/ep01-prompts.json --preview   # PNGs rápidos de cada fala em out/
node render.mjs episodes/ep01-prompts.json             # vídeo final em out/ep01-prompts.mp4
```

## Roteiro (`episodes/*.json`)

| Campo | O que faz |
|---|---|
| `title` | Título fixo no topo do vídeo |
| `handle` | @ do perfil no rodapé |
| `characters` | Personagens: `color`, `x`, `z`, `scale` e `voice` (`voice`, `speed`, `pitch`, `shift`) |
| `lines[].who` | Quem fala |
| `lines[].say` | Texto falado |
| `lines[].caption` | Legenda, se diferente da fala (opcional) |
| `lines[].card` | Selo destacado, ex.: `"Dica #1 · Contexto"` |
| `lines[].emotion` | `neutral`, `happy`, `surprised`, `think`, `sad` |
| `lines[].action` | `wave`, `jump`, `point`, `nod`, `shake`, `shrug`, `celebrate` |
| `lines[].zoom` | `true` aproxima a câmera de quem fala |
| `music` | `false` desliga a trilha sintetizada |

Para trocar a voz depois, basta substituir a função `tts()` em `render.mjs` (por ElevenLabs, Piper etc.); o resto do pipeline (lip sync, legendas, timing) usa o áudio que ela devolver.
