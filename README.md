# 🎭 ArcVox Studio - Digital RPG Master

> Plataforma de criação de narrativas interativas com IA, geração de imagens e narração por voz.

![ArcVox Studio](https://img.shields.io/badge/ArcVox-Studio-00FFFF?style=for-the-badge&logo=react)
![Gemini API](https://img.shields.io/badge/Gemini-API-8A2BE2?style=for-the-badge&logo=google)
![Status](https://img.shields.io/badge/Status-Beta-F59E0B?style=for-the-badge)

## 🚀 Quick Start

### 1. Clone e Instale

```bash
# Clone o repositório
git clone https://github.com/parafoxStudio/arcvox_studio.git
cd arcvox_studio

# Instale as dependências
npm install
```

### 2. Configure a API Key

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e adicione sua API Key do Google
# GEMINI_API_KEY=sua_api_key_aqui
```

**Obter API Key:** [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Execute

```bash
# Inicia servidor backend + frontend em paralelo
npm run dev
```

Acesse: **http://localhost:5173**

---

## 📁 Estrutura do Projeto

```
arcvox-studio/
├── server.js           # Backend Express (API proxy)
├── src/
│   ├── main.jsx        # Entry point React
│   ├── App.jsx         # Componente principal
│   ├── index.css       # Estilos globais
│   └── hooks/
│       └── useArcVoxAPI.js  # Hook para API
├── index.html          # HTML principal
├── vite.config.js      # Config Vite + proxy
├── tailwind.config.js  # Config Tailwind
├── package.json        # Dependências
└── .env.example        # Exemplo de variáveis
```

---

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Gerar Imagem de Personagem
```http
POST /api/generate-image
Content-Type: application/json

{
  "characterData": {
    "name": "Elena",
    "age": "28",
    "gender": "feminino",
    "bodyType": "atletico",
    "skinTone": "morena",
    "hairColor": "castanho",
    "hairStyle": "longo ondulado",
    "eyeColor": "verde",
    "distinctiveMarks": "cicatriz no queixo"
  }
}
```

### Gerar Áudio (TTS)
```http
POST /api/generate-audio
Content-Type: application/json

{
  "text": "A noite estava escura e tempestuosa...",
  "voice": "Zephyr",
  "speakerName": "Narrador"
}
```

### Gerar Narrativa
```http
POST /api/generate-story
Content-Type: application/json

{
  "chronicleName": "A Sombra do Eclipse",
  "chapterName": "O Despertar",
  "theme": "Fantasia Sombria",
  "atmosphere": ["misterioso", "tenso"],
  "advancedContext": "Um mundo onde a magia foi proibida...",
  "personas": [...],
  "decisionMode": "hybrid",
  "previousContext": "",
  "userChoice": null
}
```

### Listar Modelos
```http
GET /api/models
```

---

## 🎨 Funcionalidades

### Casting (Biblioteca de Personagens)
- ✅ Criar personagens com dados completos
- ✅ Aparência física detalhada
- ✅ Personalidade (traços, motivações, medos)
- ✅ Geração de imagem com IA
- ✅ Upload de imagem de referência

### Chronicle (Criação de História)
- ✅ Configuração de tema e atmosfera
- ✅ Seleção de elenco do Casting
- ✅ Tipo de decisão (Auto/Híbrido/Manual)
- ✅ Sistema de narração com TTS
- ✅ Múltiplas vozes para personagens

### Player (Execução)
- 🔄 Narrativa em tempo real
- 🔄 Escolhas interativas
- 🔄 Áudio sincronizado
- 🔄 Histórico da sessão

---

## 🎤 Vozes Disponíveis (Gemini TTS)

| Voz | Estilo | Recomendado para |
|-----|--------|------------------|
| Zephyr | Neutro, Brilhante | Narradores, Guias |
| Puck | Masculino, Jovem | Heróis, Aventureiros |
| Charon | Masculino, Grave | Vilões, Sábios |
| Kore | Feminino, Firme | Líderes, Guerreiras |
| Fenrir | Masculino, Profundo | Monstros, Anciãos |
| Aoede | Feminino, Suave | Elfas, Fadas |

---

## 🛠️ Tecnologias

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Express, Node.js
- **AI:** Google Gemini API, Imagen 3
- **UI:** Lucide Icons, Custom Components

---

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (server + client)
npm run dev:server   # Apenas servidor backend
npm run dev:client   # Apenas frontend
npm run build        # Build para produção
npm run preview      # Preview do build
```

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | API Key do Google AI | ✅ Sim |
| `PORT` | Porta do servidor | ❌ Não (default: 3001) |
| `NODE_ENV` | Ambiente | ❌ Não (default: development) |

---

## 🐛 Troubleshooting

### "CORS Error"
O backend resolve CORS. Certifique-se de que o servidor está rodando na porta 3001.

### "API Key Invalid"
Verifique se a API Key no `.env` está correta e tem acesso aos modelos necessários.

### "Model not found"
Alguns modelos (Imagen, TTS) podem não estar disponíveis em todas as regiões. Verifique `/api/models`.

---

## 📄 Licença

MIT © Parafox Studio

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

<div align="center">

**Feito com 💜 pela Parafox Creative Studio**

[Website](https://parafox.studio) • [GitHub](https://github.com/parafoxStudio)

</div>
