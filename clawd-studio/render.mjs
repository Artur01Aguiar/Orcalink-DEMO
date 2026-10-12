// Clawd Studio — gera um Reel (1080x1920) a partir de um roteiro JSON.
// Uso: node render.mjs episodes/ep01-prompts.json [--preview] [--out out/arquivo.mp4]
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const epPath = args.find((a) => a.endsWith('.json')) || 'episodes/ep01-prompts.json';
const preview = args.includes('--preview');
const outArg = args.indexOf('--out');
const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, epPath), 'utf8'));
const name = path.basename(epPath, '.json');
const FPS = ep.fps || 30;
const SR = 44100;
const OUT = path.join(ROOT, 'out');
const CACHE = path.join(ROOT, '.cache', name);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(CACHE, { recursive: true });
const outFile = outArg >= 0 ? path.resolve(args[outArg + 1]) : path.join(OUT, `${name}.mp4`);

// ---------- voz (espeak-ng + MBROLA) ----------
function tts(text, voice, i) {
  const v = { voice: 'mb-br1', speed: 160, pitch: 55, shift: 1.12, ...voice };
  const raw = path.join(CACHE, `line${i}.raw.wav`);
  const pcm = path.join(CACHE, `line${i}.pcm`);
  execFileSync('espeak-ng', ['-v', v.voice, '-s', String(v.speed), '-p', String(v.pitch), '-w', raw, text], { stdio: ['ignore', 'ignore', 'ignore'] });
  // sobe o tom sem mudar a velocidade (voz de "bonequinho") + EQ leve
  const filt = `asetrate=16000*${v.shift},aresample=${SR},atempo=${(1 / v.shift).toFixed(4)},highpass=f=90,equalizer=f=3000:t=q:w=1:g=3,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', filt, '-ac', '1', '-ar', String(SR), '-f', 's16le', pcm]);
  const buf = fs.readFileSync(pcm);
  const s = new Float32Array(buf.length / 2);
  for (let k = 0; k < s.length; k++) s[k] = buf.readInt16LE(k * 2) / 32768;
  return s;
}

function envelope(samples) {
  const hop = SR / FPS;
  const n = Math.ceil(samples.length / hop);
  const env = new Array(n).fill(0);
  let max = 1e-6;
  for (let f = 0; f < n; f++) {
    let sum = 0, c = 0;
    for (let k = Math.floor(f * hop); k < Math.min(samples.length, (f + 1) * hop); k++) { sum += samples[k] ** 2; c++; }
    env[f] = Math.sqrt(sum / Math.max(1, c));
    max = Math.max(max, env[f]);
  }
  return env.map((v, f) => {
    const x = Math.min(1, v / (max * 0.7));
    return +(f % 2 ? x * 0.9 : x).toFixed(3); // leve variação para a boca "bater"
  });
}

function wordTimings(text, start, end) {
  const words = text.split(/\s+/).filter(Boolean);
  const weight = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 2);
  const total = weight.reduce((a, b) => a + b, 0);
  let t = start;
  const out = words.map((w, i) => { const d = (end - start) * weight[i] / total; const r = { text: w, start: +t.toFixed(3), end: +(t + d).toFixed(3) }; t += d; return r; });
  const chunks = [];
  for (let i = 0; i < out.length;) {
    let j = i, len = out[i].text.length;
    while (j + 1 < out.length && j - i < 2 && len + out[j + 1].text.length < 16 && !/[.,!?:]$/.test(out[j].text)) { j++; len += out[j].text.length; }
    chunks.push([i, j]); i = j + 1;
  }
  return { words: out, chunks };
}

// ---------- monta a linha do tempo + áudio ----------
console.log(`▶ ${ep.title || name}: gerando vozes...`);
let t = ep.intro ?? 0.5;
const tracks = [];
const lines = ep.lines.map((l, i) => {
  const voice = ep.characters[l.who]?.voice || {};
  const samples = tts(l.say, voice, i);
  const dur = samples.length / SR;
  const start = t + (l.pause ?? 0);
  const end = start + dur;
  t = end + (ep.gap ?? 0.3);
  tracks.push({ samples, start });
  const cap = wordTimings(l.caption || l.say, start, end);
  return { ...l, start: +start.toFixed(3), end: +end.toFixed(3), env: envelope(samples), ...cap };
});
const duration = t + (ep.outro ?? 1.2);
const nFrames = Math.ceil(duration * FPS);

const mix = new Float32Array(Math.ceil(duration * SR));
for (const { samples, start } of tracks) { const o = Math.floor(start * SR); for (let k = 0; k < samples.length && o + k < mix.length; k++) mix[o + k] += samples[k] * 0.9; }
// "pop" quando aparece um card
for (const l of lines) if (l.card) {
  const o = Math.floor(Math.max(0, l.start - 0.1) * SR);
  for (let k = 0; k < SR * 0.12 && o + k < mix.length; k++) { const x = k / SR; mix[o + k] += Math.sin(2 * Math.PI * (500 + 900 * x / 0.12) * x) * Math.exp(-x * 35) * 0.35; }
}
// trilha simples sintetizada (pad + pluck), bem baixinha
if (ep.music !== false) {
  const bpm = 100, beat = 60 / bpm;
  const chords = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]];
  for (let k = 0; k < mix.length; k++) {
    const x = k / SR, bar = Math.floor(x / (beat * 4)) % 4, ch = chords[bar];
    const fade = Math.min(1, x / 1.0, (duration - x) / 1.0);
    let v = 0;
    for (const f of ch) v += Math.sin(2 * Math.PI * f / 2 * x) * 0.012;
    const b8 = x / (beat / 2), idx = Math.floor(b8), ph = (b8 - idx) * beat / 2;
    const f = ch[idx % 3] * 2;
    v += Math.sin(2 * Math.PI * f * ph) * Math.exp(-ph * 9) * 0.03;
    mix[k] += v * fade;
  }
}
const wav = Buffer.alloc(44 + mix.length * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + mix.length * 2, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(mix.length * 2, 40);
for (let k = 0; k < mix.length; k++) wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[k])) * 32767), 44 + k * 2);
const audioPath = path.join(CACHE, 'audio.wav');
fs.writeFileSync(audioPath, wav);
console.log(`  ${lines.length} falas, ${duration.toFixed(1)}s, ${nFrames} frames`);

// ---------- servidor estático + navegador ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0] === '/' ? '/public/index.html' : req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.setup && window.frame);
await page.evaluate(() => window.ready);
await page.evaluate((d) => window.setup(d), { ...ep, lines, duration, fps: FPS });
const stage = page.locator('#stage');

if (preview) {
  const picks = [0.4, ...lines.map((l) => (l.start + l.end) / 2)];
  for (const [i, s] of picks.entries()) {
    await page.evaluate((n) => window.frame(n), Math.floor(s * FPS));
    await stage.screenshot({ path: path.join(OUT, `${name}-preview-${String(i).padStart(2, '0')}.png`) });
  }
  console.log(`✔ ${picks.length} previews em out/`);
} else {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', audioPath,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < nFrames; f++) {
    await page.evaluate((n) => window.frame(n), f);
    const jpg = await stage.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`\r  frame ${f}/${nFrames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`\n✔ vídeo: ${path.relative(process.cwd(), outFile)}`);
}
await browser.close();
server.close();
