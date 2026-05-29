# VideoEditor IA

Editor de vídeo interno com IA. Transcreve automaticamente com OpenAI Whisper e renderiza legendas animadas sincronizadas usando Remotion.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** — dark mode, paleta cyan `#00c4f0`
- **OpenAI Whisper** — transcrição com timestamps por segmento
- **Remotion** — renderização client-side (preview) e server-side (export)
- **Shadcn/ui** — componentes acessíveis e estilizados

## Funcionalidades (Fase 1)

1. Upload drag & drop de vídeo (MP4, MOV, AVI, até 500MB)
2. Transcrição automática via Whisper com timestamps
3. Editor inline de segmentos de legendas
4. Preview em tempo real com `@remotion/player`
5. Exportação do MP4 final com legendas animadas

## Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd video-editor-ia

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local e adicione sua OPENAI_API_KEY

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `OPENAI_API_KEY` | Chave da API OpenAI (obrigatório para transcrição) |

## Estrutura

```
video-editor-ia/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts   # POST — envia vídeo para Whisper
│   │   └── render/route.ts       # POST — renderiza MP4 com Remotion
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Página principal (cliente)
├── components/
│   ├── ui/                       # Componentes base (Button, Card, Progress…)
│   ├── VideoUpload.tsx           # Área de drag & drop
│   ├── TranscriptionView.tsx     # Editor de segmentos
│   └── VideoPreview.tsx          # Player Remotion (client-only)
├── remotion/
│   ├── SubtitleComposition.tsx   # Composição com legendas animadas
│   └── index.tsx                 # Entry point Remotion
├── lib/
│   ├── whisper.ts                # Integração OpenAI Whisper
│   ├── render.ts                 # Wrapper @remotion/renderer
│   └── utils.ts                  # cn() helper
└── .env.local.example
```

## Uso

1. Acesse a interface em `http://localhost:3000`
2. Arraste um vídeo (MP4/MOV/AVI) para a área de upload
3. Aguarde a transcrição automática via Whisper
4. Revise e edite os segmentos de legenda se necessário
5. Clique em **Renderizar e Exportar MP4**
6. Baixe o arquivo final com as legendas animadas
