// =============================================================================
// ArcVox Studio - Backend Server
// =============================================================================
// Este servidor atua como proxy para as APIs do Google, resolvendo CORS
// e mantendo a API Key segura no servidor.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Verificar API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não encontrada! Configure no arquivo .env');
  process.exit(1);
}

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// =============================================================================
// HEALTH CHECK
// =============================================================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!GEMINI_API_KEY
  });
});

// =============================================================================
// GERAÇÃO DE IMAGEM - Character Portrait
// =============================================================================
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, characterData } = req.body;
    
    console.log('📸 Gerando imagem para:', characterData?.name || 'Personagem');
    
    // Construir prompt detalhado
    const imagePrompt = prompt || buildImagePrompt(characterData);
    
    // Usar Imagen 3 para geração de imagem
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            personGeneration: 'allow_adult'
          }
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Imagen API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      res.json({
        success: true,
        image: `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`,
        prompt: imagePrompt
      });
    } else {
      throw new Error('Nenhuma imagem gerada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.message);
    
    // Fallback: tentar com Gemini 2.0 Flash
    try {
      const { prompt, characterData } = req.body;
      const imagePrompt = prompt || buildImagePrompt(characterData);
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      });
      
      const result = await model.generateContent(imagePrompt);
      const response = await result.response;
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          return res.json({
            success: true,
            image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            prompt: imagePrompt,
            fallback: true
          });
        }
      }
      
      throw new Error('Nenhuma imagem no fallback');
    } catch (fallbackError) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        fallbackError: fallbackError.message
      });
    }
  }
});

// =============================================================================
// GERAÇÃO DE ÁUDIO - Text-to-Speech com Gemini
// =============================================================================
app.post('/api/generate-audio', async (req, res) => {
  try {
    const { text, voice = 'Zephyr', speakerName } = req.body;
    
    console.log(`🔊 Gerando áudio para ${speakerName || 'Narrador'} com voz ${voice}`);
    
    // Usar a API de TTS do Gemini 2.5 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice
                }
              }
            }
          }
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `TTS API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extrair áudio da resposta
    for (const part of data.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('audio/')) {
        return res.json({
          success: true,
          audio: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          voice,
          speaker: speakerName
        });
      }
    }
    
    throw new Error('Nenhum áudio gerado');
    
  } catch (error) {
    console.error('❌ Erro ao gerar áudio:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// GERAÇÃO DE HISTÓRIA - Narrative Generation
// =============================================================================
app.post('/api/generate-story', async (req, res) => {
  try {
    const { 
      chronicleName,
      chapterName,
      theme,
      atmosphere,
      advancedContext,
      personas,
      decisionMode,
      previousContext,
      userChoice
    } = req.body;
    
    console.log(`📖 Gerando história: ${chronicleName} - ${chapterName}`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Construir prompt do sistema
    const systemPrompt = buildStorySystemPrompt({
      chronicleName,
      chapterName,
      theme,
      atmosphere,
      advancedContext,
      personas,
      decisionMode
    });
    
    // Construir prompt do usuário
    let userPrompt = previousContext 
      ? `Contexto anterior:\n${previousContext}\n\n`
      : '';
    
    if (userChoice) {
      userPrompt += `O usuário escolheu: ${userChoice}\n\n`;
    }
    
    userPrompt += 'Continue a narrativa de forma envolvente e cinematográfica.';
    
    if (decisionMode === 'hybrid' || decisionMode === 'manual') {
      userPrompt += '\n\nAo final, apresente 2-3 opções de escolha para o usuário.';
    }
    
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);
    
    const response = await result.response;
    const narrative = response.text();
    
    // Parsear a resposta para extrair diálogos e narração
    const parsed = parseNarrative(narrative, personas);
    
    res.json({
      success: true,
      narrative,
      parsed,
      decisionMode
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar história:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// LISTA DE MODELOS DISPONÍVEIS
// =============================================================================
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filtrar modelos relevantes
    const relevantModels = data.models?.filter(m => 
      m.name.includes('gemini') || 
      m.name.includes('imagen') ||
      m.name.includes('tts')
    ).map(m => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      supportedGenerationMethods: m.supportedGenerationMethods
    }));
    
    res.json({ success: true, models: relevantModels });
    
  } catch (error) {
    console.error('❌ Erro ao listar modelos:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildImagePrompt(characterData) {
  if (!characterData) {
    return 'Professional character portrait, cinematic lighting, detailed face, neutral background';
  }
  
  const parts = [
    'Professional character portrait',
    'cinematic lighting',
    'detailed face',
    'high quality',
    characterData.age && `${characterData.age} years old`,
    characterData.gender,
    characterData.bodyType && `${characterData.bodyType} body type`,
    characterData.height && `${characterData.height} height`,
    characterData.skinTone && `${characterData.skinTone} skin`,
    characterData.hairColor && characterData.hairColor !== 'careca' && `${characterData.hairColor} hair`,
    characterData.hairColor === 'careca' && 'bald',
    characterData.hairStyle,
    characterData.eyeColor && `${characterData.eyeColor} eyes`,
    characterData.distinctiveMarks,
    'neutral dark background',
    'portrait photography style',
    'upper body shot',
    'looking at camera'
  ].filter(Boolean);
  
  return parts.join(', ');
}

function buildStorySystemPrompt({ chronicleName, chapterName, theme, atmosphere, advancedContext, personas, decisionMode }) {
  const personaDescriptions = personas?.map(p => {
    return `- ${p.name} (${p.role}): ${p.traits?.join(', ')}. Motivação: ${p.motivation}. Medo: ${p.fear}. Voz: ${p.voice}`;
  }).join('\n') || '';
  
  const atmosphereText = Array.isArray(atmosphere) ? atmosphere.join(', ') : atmosphere || '';
  
  return `Você é um Mestre de RPG digital criando uma narrativa interativa.

# CRÔNICA: ${chronicleName}
# CAPÍTULO: ${chapterName}
# TEMA: ${theme}
# ATMOSFERA: ${atmosphereText}

## CONTEXTO ADICIONAL:
${advancedContext || 'Nenhum contexto adicional.'}

## PERSONAGENS:
${personaDescriptions || 'Nenhum personagem definido.'}

## MODO DE DECISÃO: ${decisionMode}
${decisionMode === 'auto' ? '- Você controla todas as decisões e ações dos personagens.' : ''}
${decisionMode === 'hybrid' ? '- Você narra a história mas apresenta escolhas importantes ao usuário.' : ''}
${decisionMode === 'manual' ? '- Apresente situações e aguarde as decisões do usuário para cada ação.' : ''}

## INSTRUÇÕES DE FORMATO:
- Escreva em português brasileiro
- Use formato de script com indicações claras de quem fala
- Formato: [NARRADOR] para narração, [NOME_PERSONAGEM] para diálogos
- Seja cinematográfico e envolvente
- Mantenha consistência com as personalidades dos personagens
- Cada resposta deve ter 2-4 parágrafos de narração/diálogo`;
}

function parseNarrative(narrative, personas) {
  const segments = [];
  const lines = narrative.split('\n').filter(l => l.trim());
  
  let currentSpeaker = 'NARRADOR';
  let currentText = [];
  
  for (const line of lines) {
    // Detectar mudança de speaker
    const speakerMatch = line.match(/^\[([^\]]+)\]/);
    
    if (speakerMatch) {
      // Salvar segmento anterior
      if (currentText.length > 0) {
        const persona = personas?.find(p => 
          p.name.toUpperCase() === currentSpeaker.toUpperCase()
        );
        
        segments.push({
          speaker: currentSpeaker,
          text: currentText.join(' ').trim(),
          voice: persona?.voice || 'Zephyr',
          isNarrator: currentSpeaker === 'NARRADOR'
        });
        currentText = [];
      }
      
      currentSpeaker = speakerMatch[1];
      const restOfLine = line.replace(/^\[[^\]]+\]\s*/, '').trim();
      if (restOfLine) currentText.push(restOfLine);
    } else {
      currentText.push(line.trim());
    }
  }
  
  // Salvar último segmento
  if (currentText.length > 0) {
    const persona = personas?.find(p => 
      p.name.toUpperCase() === currentSpeaker.toUpperCase()
    );
    
    segments.push({
      speaker: currentSpeaker,
      text: currentText.join(' ').trim(),
      voice: persona?.voice || 'Zephyr',
      isNarrator: currentSpeaker === 'NARRADOR'
    });
  }
  
  return {
    segments,
    hasChoices: narrative.includes('Escolha') || narrative.includes('Opção')
  };
}

// =============================================================================
// START SERVER
// =============================================================================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     █████╗ ██████╗  ██████╗██╗   ██╗ ██████╗ ██╗  ██╗         ║
║    ██╔══██╗██╔══██╗██╔════╝██║   ██║██╔═══██╗╚██╗██╔╝         ║
║    ███████║██████╔╝██║     ██║   ██║██║   ██║ ╚███╔╝          ║
║    ██╔══██║██╔══██╗██║     ╚██╗ ██╔╝██║   ██║ ██╔██╗          ║
║    ██║  ██║██║  ██║╚██████╗ ╚████╔╝ ╚██████╔╝██╔╝ ██╗         ║
║    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝         ║
║                                                                ║
║    🎭 ArcVox Studio - Digital RPG Master                       ║
║    📡 API Server running on http://localhost:${PORT}              ║
║    ✅ Gemini API Key: Configured                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
