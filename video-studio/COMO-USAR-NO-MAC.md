# Estúdio de vídeo (Remotion) — como usar no seu Mac

Abra o app **Terminal** e cole um bloco por vez.

## 1. Instalar as ferramentas (só na primeira vez)

```bash
# Homebrew (vai pedir a senha do Mac — ao digitar, nada aparece na tela, é normal)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js LTS, ffmpeg e whisper.cpp
brew install node@22 ffmpeg whisper-cpp
brew link --overwrite node@22

# Modelo "small" do Whisper (bom em português, ~466 MB)
mkdir -p ~/whisper-models
curl -L -o ~/whisper-models/ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin
```

## 2. Abrir o estúdio

```bash
cd caminho/para/Orcalink-DEMO/video-studio
npm install
npm run dev
```

O Remotion Studio abre no navegador em http://localhost:3000.

## 3. Renderizar o vídeo de teste

```bash
npx remotion render Teste out/teste.mp4
```

## Padrão do estúdio

Vertical 1080x1920, 30 fps — definido em `src/config.ts`.
