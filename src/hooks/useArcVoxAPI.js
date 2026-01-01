// =============================================================================
// useArcVoxAPI - Custom hook for API interactions
// =============================================================================

import { useState, useCallback } from 'react';

const API_BASE = '/api';

export function useArcVoxAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call handler
  const apiCall = useCallback(async (endpoint, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || `API Error: ${response.status}`);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Health check
  const checkHealth = useCallback(async () => {
    return apiCall('/health');
  }, [apiCall]);

  // Generate character image
  const generateImage = useCallback(async (characterData) => {
    return apiCall('/generate-image', {
      method: 'POST',
      body: JSON.stringify({ characterData })
    });
  }, [apiCall]);

  // Generate audio (TTS)
  const generateAudio = useCallback(async (text, voice = 'Zephyr', speakerName = 'Narrador') => {
    return apiCall('/generate-audio', {
      method: 'POST',
      body: JSON.stringify({ text, voice, speakerName })
    });
  }, [apiCall]);

  // Generate story segment
  const generateStory = useCallback(async (projectData, previousContext = '', userChoice = null) => {
    return apiCall('/generate-story', {
      method: 'POST',
      body: JSON.stringify({
        ...projectData,
        previousContext,
        userChoice
      })
    });
  }, [apiCall]);

  // List available models
  const listModels = useCallback(async () => {
    return apiCall('/models');
  }, [apiCall]);

  return {
    isLoading,
    error,
    checkHealth,
    generateImage,
    generateAudio,
    generateStory,
    listModels,
    clearError: () => setError(null)
  };
}

// =============================================================================
// Audio Player Hook
// =============================================================================

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);

  const playAudio = useCallback((audioData) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioData);
      setCurrentAudio(audio);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        resolve();
      };
      audio.onerror = (err) => {
        setIsPlaying(false);
        setCurrentAudio(null);
        reject(err);
      };
      
      audio.play().catch(reject);
    });
  }, []);

  const playQueue = useCallback(async (audioItems) => {
    setAudioQueue(audioItems);
    
    for (const item of audioItems) {
      try {
        await playAudio(item.audio);
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    }
    
    setAudioQueue([]);
  }, [playAudio]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  return {
    isPlaying,
    currentAudio,
    audioQueue,
    playAudio,
    playQueue,
    stopAudio
  };
}

// =============================================================================
// Story Session Hook
// =============================================================================

export function useStorySession() {
  const [segments, setSegments] = useState([]);
  const [choices, setChoices] = useState([]);
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { generateStory, generateAudio, error } = useArcVoxAPI();
  const { playQueue } = useAudioPlayer();

  const startSession = useCallback(async (projectData) => {
    setIsGenerating(true);
    setSegments([]);
    setChoices([]);
    setContext('');
    
    try {
      const result = await generateStory(projectData);
      
      if (result.success) {
        setSegments(result.parsed.segments);
        setContext(result.narrative);
        
        // Extrair escolhas se houver
        if (result.parsed.hasChoices) {
          const choiceMatch = result.narrative.match(/(?:Escolha|Opção)\s*\d?[:.]\s*(.+)/gi);
          if (choiceMatch) {
            setChoices(choiceMatch.map((c, i) => ({
              id: i,
              text: c.replace(/(?:Escolha|Opção)\s*\d?[:.]\s*/i, '')
            })));
          }
        }
        
        // Gerar áudio para cada segmento
        if (projectData.narratorEnabled) {
          const audioPromises = result.parsed.segments.map(async (segment) => {
            try {
              const audioResult = await generateAudio(
                segment.text,
                segment.voice,
                segment.speaker
              );
              return { ...segment, audio: audioResult.audio };
            } catch (err) {
              console.error('Error generating audio for segment:', err);
              return segment;
            }
          });
          
          const segmentsWithAudio = await Promise.all(audioPromises);
          setSegments(segmentsWithAudio);
          
          // Auto-play se modo automático
          if (projectData.decisionMode === 'auto') {
            await playQueue(segmentsWithAudio.filter(s => s.audio));
          }
        }
      }
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [generateStory, generateAudio, playQueue]);

  const continueSession = useCallback(async (projectData, userChoice) => {
    setIsGenerating(true);
    
    try {
      const result = await generateStory(projectData, context, userChoice);
      
      if (result.success) {
        const newSegments = result.parsed.segments;
        setSegments(prev => [...prev, ...newSegments]);
        setContext(prev => prev + '\n\n' + result.narrative);
        
        // Gerar áudio
        if (projectData.narratorEnabled) {
          const audioPromises = newSegments.map(async (segment) => {
            try {
              const audioResult = await generateAudio(
                segment.text,
                segment.voice,
                segment.speaker
              );
              return { ...segment, audio: audioResult.audio };
            } catch (err) {
              return segment;
            }
          });
          
          const segmentsWithAudio = await Promise.all(audioPromises);
          setSegments(prev => {
            const newPrev = [...prev];
            const startIndex = newPrev.length - newSegments.length;
            segmentsWithAudio.forEach((seg, i) => {
              newPrev[startIndex + i] = seg;
            });
            return newPrev;
          });
        }
        
        // Atualizar escolhas
        setChoices([]);
        if (result.parsed.hasChoices) {
          const choiceMatch = result.narrative.match(/(?:Escolha|Opção)\s*\d?[:.]\s*(.+)/gi);
          if (choiceMatch) {
            setChoices(choiceMatch.map((c, i) => ({
              id: i,
              text: c.replace(/(?:Escolha|Opção)\s*\d?[:.]\s*/i, '')
            })));
          }
        }
      }
    } catch (err) {
      console.error('Error continuing session:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [context, generateStory, generateAudio]);

  const resetSession = useCallback(() => {
    setSegments([]);
    setChoices([]);
    setContext('');
  }, []);

  return {
    segments,
    choices,
    context,
    isGenerating,
    error,
    startSession,
    continueSession,
    resetSession
  };
}

export default useArcVoxAPI;
