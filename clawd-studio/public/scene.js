import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = 1080, H = 1920;
let FPS = 30;

// ---------- utilidades ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const damp = (cur, target, rate, dt) => lerp(cur, target, 1 - Math.exp(-rate * dt));
const easeOutBack = (x) => { x = clamp(x); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- renderer / cena ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').prepend(renderer.domElement);

const scene = new THREE.Scene();
const BG = new THREE.Color('#F1E6D6');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 10, 26);

const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);

scene.add(new THREE.HemisphereLight(0xfff4e6, 0xd9b99a, 1.1));
const key = new THREE.DirectionalLight(0xfff1de, 2.4);
key.position.set(3.5, 7, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -5; key.shadow.camera.right = 5;
key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
key.shadow.radius = 6;
key.shadow.bias = -0.0005;
scene.add(key);
const rim = new THREE.DirectionalLight(0xffd9b8, 1.4);
rim.position.set(-4, 3, -4);
scene.add(rim);
const fill = new THREE.PointLight(0xffe2c8, 6, 12);
fill.position.set(-3, 2, 4);
scene.add(fill);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#EBDDC9', roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// formas decorativas flutuando ao fundo
const decor = [];
{
  const rnd = mulberry32(7);
  const palette = ['#E8B79F', '#D9C3A5', '#C9D6C3', '#E3CDB4', '#D97757'];
  for (let i = 0; i < 9; i++) {
    const s = 0.25 + rnd() * 0.45;
    const geo = rnd() > 0.5 ? new RoundedBoxGeometry(s, s, s, 4, s * 0.25) : new THREE.SphereGeometry(s * 0.6, 32, 16);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: palette[i % palette.length], roughness: 0.7 }));
    m.position.set((rnd() - 0.5) * 9, 1.2 + rnd() * 4.5, -4 - rnd() * 6);
    m.userData = { base: m.position.clone(), ph: rnd() * 10, sp: 0.3 + rnd() * 0.4 };
    scene.add(m);
    decor.push(m);
  }
}

// ---------- personagem ----------
function makeClawd({ color = '#D97757', scale = 1 }) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const rig = new THREE.Group(); root.add(rig);

  const c = new THREE.Color(color);
  const mat = new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.35,
    sheen: 0.5, sheenColor: c.clone().offsetHSL(0, 0, 0.25),
  });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x18120e, roughness: 0.2, clearcoat: 1 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  const legH = 0.32, bw = 1.5, bh = 0.95, bd = 0.85;

  const legs = [-0.55, -0.2, 0.2, 0.55].map((x) => {
    const lg = new THREE.Group(); lg.position.set(x, legH + 0.05, 0);
    const m = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.17, legH + 0.1, 0.24, 3, 0.06), mat));
    m.position.y = -(legH + 0.1) / 2;
    lg.add(m); rig.add(lg); return lg;
  });

  const torso = new THREE.Group(); torso.position.y = legH; rig.add(torso);
  const body = shadowed(new THREE.Mesh(new RoundedBoxGeometry(bw, bh, bd, 8, 0.2), mat));
  body.position.y = bh / 2; torso.add(body);

  const face = new THREE.Group(); face.position.set(0, bh / 2, bd / 2); torso.add(face);
  const eyes = [-0.3, 0.3].map((x) => {
    const e = new THREE.Group(); e.position.set(x, 0.14, 0.0);
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.28, 0.08, 4, 0.06), dark);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 8), white);
    hl.position.set(0.025, 0.07, 0.045);
    e.add(m, hl); face.add(e); return e;
  });
  const mouth = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.14, 0.07, 4, 0.05), dark);
  mouth.position.set(0, -0.16, 0.0);
  face.add(mouth);

  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group(); pivot.position.set(side * bw / 2, bh * 0.5, 0);
    const m = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.24, 0.36, 4, 0.09), mat));
    m.position.x = side * 0.13;
    pivot.add(m); torso.add(pivot); return pivot;
  });

  const st = { look: 0, tilt: 0, eyeY: 1, eyeS: 1, eyeOX: 0, eyeOY: 0, mouthW: 1, mouthH: 0.3, armL: 0, armR: 0, nod: 0, x: 0 };
  return { root, rig, torso, face, eyes, mouth, arms, legs, st, scale };
}

// ---------- estado do episódio ----------
let EP = null;
const chars = {};
let blinkTimes = {};
const ui = {
  title: document.getElementById('title'),
  card: document.querySelector('#card div'),
  cardWrap: document.getElementById('card'),
  caption: document.getElementById('caption'),
  handle: document.getElementById('handle'),
};
const cam = { z: 11, tx: 0.32 };
let simFrame = -1;

window.setup = (data) => {
  EP = data;
  FPS = data.fps || 30;
  const ids = Object.keys(data.characters);
  ids.forEach((id, i) => {
    const cfg = data.characters[id];
    const c = makeClawd({ color: cfg.color, scale: cfg.scale || 1 });
    c.root.position.set(cfg.x ?? 0, 0, cfg.z ?? 0);
    c.home = c.root.position.clone();
    c.cfg = cfg;
    scene.add(c.root);
    chars[id] = c;
    const rnd = mulberry32(31 + i * 101);
    const bt = []; let t = 0.8 + rnd() * 1.5;
    while (t < data.duration + 5) { bt.push(t); t += 2.2 + rnd() * 2.6; }
    blinkTimes[id] = bt;
  });
  ui.title.innerHTML = data.title ? `<span>${data.title}</span>` : '';
  ui.handle.textContent = data.handle || '';
  simFrame = -1;
  return true;
};

function activeLine(t) {
  for (const l of EP.lines) if (t >= l.start - 0.05 && t < l.end + 0.15) return l;
  return null;
}
function lastLineFor(id, t) {
  let r = null;
  for (const l of EP.lines) if (l.who === id && l.start <= t) r = l;
  return r;
}

const EMO = {
  neutral: { eyeY: 1, eyeS: 1, eyeOX: 0, eyeOY: 0, tilt: 0, mouthW: 1 },
  happy: { eyeY: 0.42, eyeS: 1.05, eyeOX: 0, eyeOY: 0.03, tilt: 0.05, mouthW: 1.25 },
  surprised: { eyeY: 1.25, eyeS: 1.25, eyeOX: 0, eyeOY: 0.02, tilt: -0.04, mouthW: 0.7 },
  think: { eyeY: 0.9, eyeS: 0.95, eyeOX: 0.05, eyeOY: 0.07, tilt: 0.12, mouthW: 0.6 },
  sad: { eyeY: 0.7, eyeS: 0.9, eyeOX: 0, eyeOY: -0.04, tilt: -0.08, mouthW: 0.8 },
};

function updateChar(id, c, t, dt) {
  const st = c.st;
  const line = activeLine(t);
  const speaking = line && line.who === id && t >= line.start && t < line.end;
  let amp = 0;
  if (speaking && line.env) {
    const i = Math.floor((t - line.start) * FPS);
    amp = line.env[clamp(i, 0, line.env.length - 1)] || 0;
  }
  const mine = lastLineFor(id, t);
  const emoName = (mine && t < mine.end + 1.2) ? (mine.emotion || 'neutral') : 'neutral';
  const emo = EMO[emoName] || EMO.neutral;

  // olhar: para a câmera quando fala, para quem fala quando escuta
  let lookTarget = 0;
  if (line && line.who !== id && chars[line.who]) {
    const other = chars[line.who].root.position.x;
    lookTarget = clamp((other - c.root.position.x) * 0.45, -0.6, 0.6);
  }
  st.look = damp(st.look, lookTarget, 5, dt);
  st.tilt = damp(st.tilt, emo.tilt + (speaking ? Math.sin(t * 2.3) * 0.03 : 0), 4, dt);
  for (const k of ['eyeY', 'eyeS', 'eyeOX', 'eyeOY', 'mouthW']) st[k] = damp(st[k], emo[k], 10, dt);

  // piscar
  let blink = 1;
  for (const b of blinkTimes[id]) { const d = t - b; if (d >= 0 && d < 0.16) blink = Math.min(blink, Math.abs(d - 0.08) / 0.08); }
  blink = Math.max(blink, 0.08);

  // boca
  const mouthTarget = speaking ? 0.45 + amp * 1.4 : (emoName === 'happy' ? 0.5 : 0.3);
  st.mouthH = damp(st.mouthH, mouthTarget, 22, dt);

  // respiração / fala
  const breathe = Math.sin(t * 2.1 + c.root.position.x) * 0.012;
  let squash = 1 + breathe + amp * 0.05;
  let hop = speaking ? amp * 0.06 : 0;
  let spin = 0, armL = Math.sin(t * 1.7) * 0.06, armR = Math.sin(t * 1.7 + 1) * 0.06, nod = 0, shake = 0;
  let lean = 0;

  // ações (durante a fala do personagem)
  if (mine && mine.action && t >= mine.start && t < mine.end + 0.6) {
    const p = t - mine.start;
    const dur = mine.end - mine.start;
    switch (mine.action) {
      case 'wave':
        armR = (1.7 + Math.sin(p * 11) * 0.45) * smooth(p * 3) * smooth((dur + 0.4 - p) * 3);
        break;
      case 'jump': {
        const k = p / 0.6;
        if (k < 1) { hop += Math.sin(Math.PI * k) * 0.55; squash *= 1 + Math.sin(Math.PI * k) * 0.08; armL = armR = 1.2 * Math.sin(Math.PI * k); }
        else if (k < 1.35) squash *= 1 - Math.sin(Math.PI * (k - 1) / 0.35) * 0.12;
        break;
      }
      case 'celebrate': {
        const k = (p % 0.75) / 0.75;
        const on = p < 1.5 ? 1 : smooth((dur + 0.4 - p) * 2);
        hop += Math.abs(Math.sin(Math.PI * k)) * 0.45 * on;
        spin = p < 0.75 ? smooth(p / 0.75) * Math.PI * 2 : 0;
        armL = armR = 1.5 * on + Math.sin(p * 14) * 0.2 * on;
        break;
      }
      case 'point': {
        const on = smooth(p * 4) * smooth((dur + 0.4 - p) * 3);
        armR = 0.8 * on; lean = 0.12 * on;
        break;
      }
      case 'nod': nod = Math.sin(p * 9) * 0.1 * smooth(p * 4) * smooth((1.6 - p) * 2); break;
      case 'shake': shake = Math.sin(p * 10) * 0.22 * smooth(p * 4) * smooth((1.6 - p) * 2); break;
      case 'shrug': { const on = smooth(p * 4) * smooth((dur + 0.4 - p) * 3); armL = armR = 0.7 * on; hop += 0.04 * on; break; }
    }
  }
  if (emoName === 'think' && !(mine && mine.action)) { armR = 1.0; }
  st.armL = damp(st.armL, armL, 14, dt);
  st.armR = damp(st.armR, armR, 14, dt);

  // aplicar
  c.rig.position.y = hop;
  c.rig.rotation.y = st.look + shake + spin;
  c.rig.rotation.z = st.tilt;
  c.torso.rotation.x = nod + lean;
  c.torso.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  c.arms[0].rotation.z = -st.armL;
  c.arms[1].rotation.z = st.armR;
  c.legs.forEach((lg, i) => { lg.rotation.x = hop > 0.1 ? (i % 2 ? 0.25 : -0.25) * smooth(hop * 3) : Math.sin(t * 6 + i) * 0.03 * (speaking ? 1 : 0); });
  c.eyes.forEach((e, i) => {
    e.scale.set(st.eyeS, st.eyeS * st.eyeY * blink, 1);
    e.position.x = (i ? 0.3 : -0.3) + st.eyeOX;
    e.position.y = 0.14 + st.eyeOY;
  });
  c.mouth.scale.set(st.mouthW * (speaking ? 1 - amp * 0.25 : 1), st.mouthH, 1);
}

function updateCamera(t, dt) {
  const line = activeLine(t);
  let tx = EP.camera?.x ?? 0.32, dist = EP.camera?.distance ?? 11;
  if (line && chars[line.who]) {
    const sx = chars[line.who].root.position.x;
    tx = lerp(tx, sx, 0.35);
    const p = clamp((t - line.start) / Math.max(0.5, line.end - line.start));
    dist -= (line.zoom ? 2.2 : 0.6) * smooth(p);
  }
  cam.tx = damp(cam.tx, tx, 2.2, dt);
  cam.z = damp(cam.z, dist, 1.8, dt);
  const shakeX = Math.sin(t * 0.9) * 0.04 + Math.sin(t * 2.3) * 0.015;
  const shakeY = Math.sin(t * 1.3) * 0.03;
  camera.position.set(cam.tx + shakeX, 1.6 + shakeY, cam.z);
  camera.lookAt(cam.tx, 0.62, 0);
}

function updateUI(t) {
  // título: entra no começo
  const tIn = easeOutBack((t - 0.1) / 0.45);
  ui.title.style.transform = `scale(${0.6 + 0.4 * clamp(tIn, 0, 1.2)})`;
  ui.title.style.opacity = clamp((t - 0.1) / 0.2);

  // card (ex.: "DICA #1")
  let cur = null;
  for (const l of EP.lines) if (t >= l.start - 0.1) cur = l;
  const card = cur && cur.card ? cur : null;
  if (card) {
    const k = easeOutBack((t - card.start + 0.1) / 0.4);
    ui.card.textContent = card.card;
    ui.cardWrap.style.opacity = clamp((t - card.start + 0.1) / 0.15);
    ui.cardWrap.style.transform = `scale(${clamp(k, 0, 1.3)}) rotate(${(1 - clamp(k)) * -8}deg)`;
  } else ui.cardWrap.style.opacity = 0;

  // legendas palavra por palavra (blocos de até 3 palavras)
  const line = activeLine(t);
  if (!line || t < line.start || t > line.end + 0.1) { ui.caption.innerHTML = ''; return; }
  const words = line.words;
  let wi = words.findIndex((w) => t < w.end);
  if (wi < 0) wi = words.length - 1;
  const chunk = line.chunks.find((ch) => wi >= ch[0] && wi <= ch[1]);
  const html = [];
  for (let i = chunk[0]; i <= chunk[1]; i++) {
    const w = words[i];
    const pop = i === wi ? 1 + 0.12 * (1 - clamp((t - w.start) / 0.15)) : 1;
    html.push(`<span class="w ${i === wi ? 'on' : ''}" style="transform:scale(${pop.toFixed(3)})">${w.text}</span>`);
  }
  ui.caption.innerHTML = html.join(' ');
}

function step(frame) {
  const dt = 1 / FPS;
  const t = frame / FPS;
  for (const [id, c] of Object.entries(chars)) updateChar(id, c, t, dt);
  for (const m of decor) {
    const u = m.userData;
    m.position.y = u.base.y + Math.sin(t * u.sp + u.ph) * 0.25;
    m.rotation.set(t * 0.2 + u.ph, t * 0.15 * u.sp, 0);
  }
  updateCamera(t, dt);
  updateUI(t);
}

// renderiza o frame N (simula os anteriores para manter o estado determinístico)
window.frame = (n) => {
  if (n < simFrame) { simFrame = -1; for (const c of Object.values(chars)) Object.assign(c.st, { look: 0, tilt: 0, armL: 0, armR: 0, mouthH: 0.3 }); }
  while (simFrame < n) step(++simFrame);
  renderer.render(scene, camera);
  return true;
};

window.ready = document.fonts.ready.then(() => true);
