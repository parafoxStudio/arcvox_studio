import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Link2, Volume2, Play, Eye, Sparkles, 
  BookOpen, Users, Mic, Settings, ChevronRight, X,
  Check, AlertCircle, Zap, Palette, Type, Layout, Cpu,
  Home, Film, User, Edit3, ArrowLeft, Search, Star,
  Heart, Shield, Ghost, Smile, Crown, Camera, Pause, 
  SkipForward, RefreshCw
} from 'lucide-react';
import { useArcVoxAPI, useAudioPlayer, useStorySession } from './hooks/useArcVoxAPI';

// ═══════════════════════════════════════════════════════════════════════════
// AMBIENT BACKGROUND - Neural Particle Network (Parafox Signature)
// ═══════════════════════════════════════════════════════════════════════════
const AmbientBackground = ({ neuralConfig }) => {
  const canvasRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const configRef = useRef(neuralConfig);
  
  // Update config ref when props change
  useEffect(() => {
    configRef.current = neuralConfig;
  }, [neuralConfig]);
  
  // Recreate particles when particle config changes significantly
  useEffect(() => {
    if (particlesRef.current.length > 0) {
      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) return;
      
      const config = neuralConfig;
      const particleCount = Math.min(200, Math.floor((width * height) / (20000 - config.particles.quantity * 150)));
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const isCyan = Math.random() > 0.4;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.particles.speed,
          vy: (Math.random() - 0.5) * config.particles.speed,
          size: Math.random() * config.particles.size + 0.5,
          baseSize: Math.random() * config.particles.size + 0.5,
          color: isCyan ? '0, 255, 255' : '138, 43, 226',
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = particles;
    }
  }, [neuralConfig.particles.quantity, neuralConfig.particles.size, neuralConfig.particles.speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dimensions using window size directly
    const updateDimensions = () => {
      dimensionsRef.current.width = window.innerWidth;
      dimensionsRef.current.height = window.innerHeight;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize mouse position to center
      if (mouseRef.current.x === 0 && mouseRef.current.y === 0) {
        mouseRef.current.x = window.innerWidth / 2;
        mouseRef.current.y = window.innerHeight / 2;
        targetMouseRef.current.x = window.innerWidth / 2;
        targetMouseRef.current.y = window.innerHeight / 2;
      }
    };
    
    updateDimensions();

    // Create particles with config
    const createParticles = () => {
      const { width, height } = dimensionsRef.current;
      const config = configRef.current;
      const particleCount = Math.min(200, Math.floor((width * height) / (20000 - config.particles.quantity * 150)));
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const isCyan = Math.random() > 0.4;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.particles.speed,
          vy: (Math.random() - 0.5) * config.particles.speed,
          size: Math.random() * config.particles.size + 0.5,
          baseSize: Math.random() * config.particles.size + 0.5,
          color: isCyan ? '0, 255, 255' : '138, 43, 226',
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = particles;
    };
    
    createParticles();

    // Mouse move handler
    const handleMouseMove = (event) => {
      targetMouseRef.current.x = event.clientX;
      targetMouseRef.current.y = event.clientY;
    };

    // Animation loop
    const animate = () => {
      const { width, height } = dimensionsRef.current;
      const particles = particlesRef.current;
      const config = configRef.current;
      
      // Check if animation is disabled
      if (!config.enabled) {
        ctx.clearRect(0, 0, width, height);
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      timeRef.current += 0.01 * config.breathing.speed;
      
      // Smooth mouse interpolation
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08;

      // Animate blobs
      const nx = width > 0 ? (mouseRef.current.x / width) * 2 - 1 : 0;
      const ny = height > 0 ? (mouseRef.current.y / height) * 2 - 1 : 0;
      const breatheIntensity = config.breathing.intensity / 100;
      const breathe = 1 + Math.sin(timeRef.current) * 0.15 * breatheIntensity;
      const breatheOpacity = 0.5 + Math.sin(timeRef.current * 0.8) * 0.1 * breatheIntensity;

      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${nx * -40}px, ${ny * 20}px) scale(${breathe})`;
        blob1Ref.current.style.opacity = String(breatheOpacity);
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${nx * 40}px, ${ny * -40}px) scale(${1 + Math.cos(timeRef.current) * 0.1})`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(calc(-50% + ${nx * -15}px), calc(-50% + ${ny * -15}px)) rotate(${timeRef.current * 5}deg) scale(${0.8 + Math.sin(timeRef.current * 0.5) * 0.1})`;
      }

      // Clear and draw canvas
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        // Keep in bounds
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Mouse interaction
        const dxMouse = mouseRef.current.x - p.x;
        const dyMouse = mouseRef.current.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        let targetSize = p.baseSize;
        if (distMouse < 200) {
          targetSize = p.baseSize * 1.5;
          if (distMouse < 50 && distMouse > 0) {
            p.x -= dxMouse * 0.02;
            p.y -= dyMouse * 0.02;
          }
        }

        // Smooth size transition with twinkle
        p.size += (targetSize - p.size) * 0.1;
        const renderSize = p.size * (1 + Math.sin(timeRef.current * 2 + p.phase) * 0.2);

        // Draw particle - using config
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, renderSize), 0, Math.PI * 2);
        const particleOpacity = (config.particles.opacity / 100) * (0.6 + Math.sin(timeRef.current + p.phase) * 0.25);
        ctx.fillStyle = `rgba(${p.color}, ${particleOpacity})`;
        ctx.fill();

        // Connect to nearby particles - using config
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < config.connections.distance) {
            ctx.beginPath();
            const connectionOpacity = (1 - dist / config.connections.distance) * (config.connections.opacity / 100);
            ctx.strokeStyle = `rgba(${p.color}, ${connectionOpacity})`;
            ctx.lineWidth = config.connections.thickness;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect to mouse - using config
        if (distMouse < config.mouse.distance) {
          ctx.beginPath();
          const mouseOpacity = (1 - distMouse / config.mouse.distance) * (config.mouse.opacity / 100);
          ctx.strokeStyle = `rgba(0, 255, 255, ${mouseOpacity})`;
          ctx.lineWidth = config.connections.thickness * 1.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Handle resize
    const handleResize = () => {
      updateDimensions();
      createParticles();
    };

    // Start animation
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden select-none z-0" style={{ pointerEvents: 'none' }}>
      {/* Base Background Color */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#0D0F33', zIndex: 1 }}
      />
      
      {/* Layer 1: Outer ambient glow - slowest, largest */}
      <div
        className="absolute will-change-opacity"
        style={{
          inset: '-20%',
          background: `radial-gradient(ellipse 50% 50% at center, rgba(0, 54, 114, 0.4) 0%, rgba(0, 54, 114, 0.1) 40%, transparent 70%)`,
          filter: 'blur(60px)',
          animation: 'breatheOuter 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          zIndex: 2
        }}
      />
      
      {/* Layer 2: Mid-outer glow */}
      <div
        className="absolute will-change-opacity"
        style={{
          inset: '-10%',
          background: `radial-gradient(ellipse 45% 45% at center, rgba(0, 54, 114, 0.5) 0%, rgba(0, 40, 90, 0.2) 35%, transparent 65%)`,
          filter: 'blur(40px)',
          animation: 'breatheMidOuter 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '-1s',
          zIndex: 3
        }}
      />
      
      {/* Layer 3: Primary breathing gradient */}
      <div
        className="absolute inset-0 will-change-opacity"
        style={{
          background: `radial-gradient(ellipse 55% 55% at center, #003672 0%, rgba(0, 54, 114, 0.6) 25%, rgba(13, 15, 51, 0.8) 50%, #0D0F33 70%)`,
          filter: 'blur(20px)',
          animation: 'breathePrimary 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '-0.5s',
          zIndex: 4
        }}
      />
      
      {/* Layer 4: Inner core glow */}
      <div
        className="absolute will-change-opacity"
        style={{
          inset: '15%',
          background: `radial-gradient(ellipse 60% 60% at center, rgba(0, 80, 130, 0.6) 0%, rgba(0, 54, 114, 0.3) 40%, transparent 70%)`,
          filter: 'blur(30px)',
          animation: 'breatheInner 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '-2s',
          zIndex: 5
        }}
      />
      
      {/* Layer 5: Central bright core - fastest pulse */}
      <div
        className="absolute will-change-opacity"
        style={{
          inset: '25%',
          background: `radial-gradient(ellipse 50% 50% at center, rgba(0, 100, 160, 0.4) 0%, rgba(0, 70, 120, 0.2) 30%, transparent 60%)`,
          filter: 'blur(25px)',
          animation: 'breatheCore 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '-1.5s',
          zIndex: 6
        }}
      />
      
      {/* Layer 6: Soft highlight shimmer */}
      <div
        className="absolute will-change-opacity"
        style={{
          inset: '30%',
          background: `radial-gradient(ellipse 40% 40% at center, rgba(100, 180, 255, 0.08) 0%, transparent 50%)`,
          filter: 'blur(15px)',
          animation: 'breatheShimmer 7s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '-3s',
          zIndex: 7
        }}
      />
      
      {/* ═══ NEURAL PARTICLE NETWORK - TOPMOST ═══ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 30, opacity: 1 }}
      />
      
      {/* Blobs - Above gradients, below canvas */}
      <div style={{ zIndex: 10, position: 'absolute', inset: 0 }}>
        {/* Primary Cyan Glow */}
        <div
          ref={blob1Ref}
          className="absolute rounded-full will-change-transform"
          style={{
            top: '-10%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'rgba(0, 255, 255, 0.15)',
            filter: 'blur(120px)',
            opacity: 0.7
          }}
        />
        {/* Secondary Violet/Purple Glow */}
        <div
          ref={blob2Ref}
          className="absolute rounded-full will-change-transform"
          style={{
            bottom: '-10%',
            left: '-10%',
            width: '500px',
            height: '500px',
            background: 'rgba(138, 43, 226, 0.15)',
            filter: 'blur(100px)',
            opacity: 0.6
          }}
        />
        {/* Center Deep Blue/Ambient - Rotating Element */}
        <div
          ref={blob3Ref}
          className="absolute will-change-transform"
          style={{
            top: '50%',
            left: '50%',
            width: '800px',
            height: '800px',
            background: 'rgba(0, 54, 114, 0.2)',
            borderRadius: '40%',
            filter: 'blur(100px)',
            mixBlendMode: 'screen',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
      
      {/* Vignette Overlay - Below canvas */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(13,15,51,0.15) 100%)',
          zIndex: 8,
          pointerEvents: 'none'
        }}
      />
      
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const GlassCard = ({ children, className = '', hover = true }) => (
  <div 
    className={`relative rounded-2xl transition-all duration-300 ${hover ? 'hover:border-cyan-400/20' : ''} ${className}`}
    style={{
      backgroundColor: 'rgba(13, 15, 51, 0.35)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(0, 255, 255, 0.08)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
    }}
  >
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const GlassInput = ({ label, placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium flex items-center gap-2">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-white/90 placeholder-white/30
        focus:outline-none focus:ring-1 focus:ring-cyan-500/30
        transition-all duration-300"
      style={{ 
        fontFamily: "'Crimson Pro', serif",
        backgroundColor: 'rgba(13, 15, 51, 0.5)',
        border: '1px solid rgba(0, 255, 255, 0.1)'
      }}
    />
  </div>
);

const GlassTextarea = ({ label, placeholder, value, onChange, rows = 4 }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium">{label}</label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-xl px-4 py-3 text-white/90 placeholder-white/30
        focus:outline-none focus:ring-1 focus:ring-cyan-500/30
        transition-all duration-300 resize-none"
      style={{ 
        fontFamily: "'Crimson Pro', serif",
        backgroundColor: 'rgba(13, 15, 51, 0.5)',
        border: '1px solid rgba(0, 255, 255, 0.1)'
      }}
    />
  </div>
);

const GlassSelect = ({ label, value, onChange, options, icon: Icon }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium flex items-center gap-2">
      {Icon && <Icon size={12} />}
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-white/90
        focus:outline-none focus:ring-1 focus:ring-cyan-500/30
        transition-all duration-300 appearance-none cursor-pointer"
      style={{ 
        fontFamily: "'Inter', sans-serif",
        backgroundColor: 'rgba(13, 15, 51, 0.5)',
        border: '1px solid rgba(0, 255, 255, 0.1)'
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} style={{ backgroundColor: '#0D0F33' }}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{label}</span>
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div className={`w-12 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-gradient-to-r from-cyan-500 to-violet-600' : 'bg-[rgba(13,15,51,0.3)]'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  </label>
);

// ═══════════════════════════════════════════════════════════════════════════
// PERSONA CARD
// ═══════════════════════════════════════════════════════════════════════════
const PersonaCard = ({ persona, onUpdate, onDelete, allPersonas, voices }) => {
  const [expanded, setExpanded] = useState(false);
  
  const otherPersonas = allPersonas.filter(p => p.id !== persona.id);
  
  return (
    <GlassCard className="p-4 animate-fadeIn">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/10 flex items-center justify-center overflow-hidden">
            {persona.image ? (
              <img src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white/50" style={{ fontFamily: "'Crimson Pro', serif" }}>
                {persona.name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </button>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <input
              value={persona.name}
              onChange={(e) => onUpdate({ ...persona, name: e.target.value })}
              placeholder="Nome da Persona"
              className="bg-transparent border-none text-lg font-semibold text-white focus:outline-none w-full"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <input
              value={persona.age}
              onChange={(e) => onUpdate({ ...persona, age: e.target.value })}
              placeholder="Idade"
              className="bg-transparent border-none w-12 focus:outline-none"
            />
            <span>•</span>
            <select
              value={persona.gender}
              onChange={(e) => onUpdate({ ...persona, gender: e.target.value })}
              className="bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#0D0F33]">Gênero</option>
              <option value="masculino" className="bg-[#0D0F33]">Masculino</option>
              <option value="feminino" className="bg-[#0D0F33]">Feminino</option>
              <option value="nao-binario" className="bg-[#0D0F33]">Não-binário</option>
            </select>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg bg-[rgba(13,15,51,0.25)] hover:bg-[rgba(13,15,51,0.2)] transition-colors"
          >
            <ChevronRight size={16} className={`text-white/50 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-cyan-500/10 space-y-4 animate-slideDown">
          {/* Voice Selection */}
          <div className="grid grid-cols-2 gap-4">
            <GlassSelect
              label="Voz"
              value={persona.voice}
              onChange={(v) => onUpdate({ ...persona, voice: v })}
              options={voices}
              icon={Mic}
            />
            <GlassSelect
              label="Tom Vocal"
              value={persona.vocalTone}
              onChange={(v) => onUpdate({ ...persona, vocalTone: v })}
              options={[
                { value: 'neutro', label: 'Neutro' },
                { value: 'heroico', label: 'Heroico' },
                { value: 'sombrio', label: 'Sombrio' },
                { value: 'sussurrado', label: 'Sussurrado' },
                { value: 'sarcastico', label: 'Sarcástico' },
                { value: 'romantico', label: 'Romântico' },
              ]}
            />
          </div>
          
          {/* Physical & Psychological */}
          <GlassTextarea
            label="Detalhes Físicos"
            placeholder="Cabelos loiros, olhos azuis, cicatriz no rosto..."
            value={persona.physical}
            onChange={(v) => onUpdate({ ...persona, physical: v })}
            rows={2}
          />
          <GlassTextarea
            label="Detalhes Psicológicos"
            placeholder="Introvertido, determinado, trauma de abandono..."
            value={persona.psychological}
            onChange={(v) => onUpdate({ ...persona, psychological: v })}
            rows={2}
          />
          <GlassTextarea
            label="Background"
            placeholder="História e origem da persona..."
            value={persona.background}
            onChange={(v) => onUpdate({ ...persona, background: v })}
            rows={3}
          />
          
          {/* Relationships */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium flex items-center gap-2">
              <Link2 size={12} />
              Vínculos
            </label>
            {otherPersonas.length > 0 ? (
              <div className="space-y-2">
                {otherPersonas.map(other => (
                  <div key={other.id} className="flex items-center gap-3 bg-[rgba(13,15,51,0.2)] rounded-lg p-2">
                    <span className="text-sm text-white/70 min-w-[100px]">{other.name || 'Sem nome'}</span>
                    <select
                      value={persona.relationships?.[other.id] || ''}
                      onChange={(e) => onUpdate({
                        ...persona,
                        relationships: { ...persona.relationships, [other.id]: e.target.value }
                      })}
                      className="flex-1 bg-transparent border border-cyan-500/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="" className="bg-[#0D0F33]">Selecionar vínculo</option>
                      <option value="amigo" className="bg-[#0D0F33]">Amigo(a)</option>
                      <option value="inimigo" className="bg-[#0D0F33]">Inimigo(a)</option>
                      <option value="namorado" className="bg-[#0D0F33]">Namorado(a)</option>
                      <option value="familia" className="bg-[#0D0F33]">Família</option>
                      <option value="mentor" className="bg-[#0D0F33]">Mentor(a)</option>
                      <option value="rival" className="bg-[#0D0F33]">Rival</option>
                      <option value="aliado" className="bg-[#0D0F33]">Aliado(a)</option>
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30 italic">Adicione mais personas para criar vínculos</p>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL
// ═══════════════════════════════════════════════════════════════════════════
const PreviewModal = ({ project, atmospheresList = [], onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
    <GlassCard className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden" hover={false}>
      <div className="p-6 border-b border-cyan-500/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
            Prévia do Projeto
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(13,15,51,0.2)] transition-colors">
            <X size={20} className="text-white/50" />
          </button>
        </div>
      </div>
      
      <div className="p-6 overflow-y-auto max-h-[50vh] space-y-6">
        {/* Chronicle Info */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Crônica</h3>
          <p className="text-xl text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>{project.chronicleName || 'Sem nome'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Capítulo</h3>
            <p className="text-white/80">{project.chapterName || 'Sem nome'}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Tema</h3>
            <p className="text-white/80">{project.theme || 'Não definido'}</p>
          </div>
        </div>
        
        {/* Atmosferas */}
        {project.atmosphere && project.atmosphere.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Atmosferas</h3>
            <div className="flex flex-wrap gap-2">
              {project.atmosphere.map((atmValue, index) => {
                const atm = atmospheresList.find(a => a.value === atmValue);
                return (
                  <span 
                    key={atmValue}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                    style={{
                      backgroundColor: index === 0 
                        ? 'rgba(0, 255, 255, 0.15)' 
                        : 'rgba(138, 43, 226, 0.15)',
                      border: `1px solid ${index === 0 
                        ? 'rgba(0, 255, 255, 0.3)' 
                        : 'rgba(138, 43, 226, 0.3)'}`
                    }}
                  >
                    <span className="text-white/80">{atm?.label || atmValue}</span>
                    {index === 0 && (
                      <span className="text-[9px] text-cyan-400/60 uppercase ml-1">Principal</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Contexto Avançado</h3>
          <p className="text-white/60 text-sm">{project.advancedContext || 'Não definido'}</p>
        </div>
        
        {/* Elenco Summary */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">Elenco ({project.personas.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {project.personas.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-[rgba(13,15,51,0.25)] rounded-lg p-2">
                {p.referenceImage ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(0, 255, 255, 0.2)' }}>
                    <img src={p.referenceImage} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: p.color || 'rgba(0, 255, 255, 0.15)' }}
                  >
                    <span className="text-sm font-bold text-white/50">{p.name?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{p.name || 'Sem nome'}</p>
                  <p className="text-xs text-white/40">
                    {p.role || 'Suporte'}
                    {p.age && ` • ${p.age} anos`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Narrator Status */}
        <div 
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: 'linear-gradient(to right, rgba(0, 255, 255, 0.08), rgba(138, 43, 226, 0.08))',
            border: '1px solid rgba(0, 255, 255, 0.1)'
          }}
        >
          <div className={`w-3 h-3 rounded-full ${project.narratorEnabled ? 'bg-green-400' : 'bg-white/30'}`} />
          <span className="text-sm text-white/80">
            Narrador {project.narratorEnabled ? 'Ativado' : 'Desativado'}
          </span>
        </div>
        
        {/* Decision Mode */}
        <div 
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: project.decisionMode === 'auto' 
              ? 'linear-gradient(to right, rgba(0, 255, 255, 0.08), rgba(0, 255, 255, 0.04))'
              : project.decisionMode === 'hybrid'
              ? 'linear-gradient(to right, rgba(138, 43, 226, 0.08), rgba(138, 43, 226, 0.04))'
              : 'linear-gradient(to right, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.04))',
            border: `1px solid ${
              project.decisionMode === 'auto' 
                ? 'rgba(0, 255, 255, 0.1)'
                : project.decisionMode === 'hybrid'
                ? 'rgba(138, 43, 226, 0.1)'
                : 'rgba(245, 158, 11, 0.1)'
            }`
          }}
        >
          {project.decisionMode === 'auto' && <Cpu size={16} className="text-cyan-400" />}
          {project.decisionMode === 'hybrid' && <Sparkles size={16} className="text-violet-400" />}
          {project.decisionMode === 'manual' && <User size={16} className="text-amber-400" />}
          <span className="text-sm text-white/80">
            Decisão {project.decisionMode === 'auto' ? 'Automática (IA)' : project.decisionMode === 'hybrid' ? 'Híbrida' : 'Manual (Usuário)'}
          </span>
        </div>
      </div>
      
      <div className="p-6 border-t border-cyan-500/10 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-white/70 transition-colors"
          style={{
            backgroundColor: 'rgba(13, 15, 51, 0.3)',
            border: '1px solid rgba(0, 255, 255, 0.15)'
          }}
        >
          Voltar
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium
            hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300 flex items-center gap-2"
        >
          <Check size={18} />
          Confirmar e Gerar
        </button>
      </div>
    </GlassCard>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const Slider = ({ label, value, onChange, min, max, step = 1, unit = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/70">{label}</label>
        <span className="text-sm text-cyan-400 font-medium">{value}{unit}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(0, 255, 255, 0.7) 0%, rgba(0, 255, 255, 0.7) ${percentage}%, rgba(30, 35, 60, 0.8) ${percentage}%, rgba(30, 35, 60, 0.8) 100%)`,
          }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════
const SettingsModal = ({ onClose, neuralConfig, setNeuralConfig, googleApiKey, setGoogleApiKey, imageProvider, setImageProvider }) => {
  const [activeTab, setActiveTab] = useState('api');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const tabs = [
    { id: 'api', label: 'Geração de Imagem', icon: Zap, disabled: false },
    { id: 'neural', label: 'Animação Neural', icon: Cpu, disabled: false },
    { id: 'fonts', label: 'Fontes', icon: Type, disabled: true },
    { id: 'interface', label: 'Interface', icon: Layout, disabled: true },
  ];
  
  const presets = {
    subtle: {
      enabled: true,
      particles: { quantity: 30, size: 1.5, speed: 0.3, opacity: 50 },
      connections: { distance: 60, opacity: 15, thickness: 0.3 },
      mouse: { distance: 100, opacity: 30 },
      breathing: { intensity: 50, speed: 0.7 }
    },
    default: {
      enabled: true,
      particles: { quantity: 50, size: 2.5, speed: 0.6, opacity: 70 },
      connections: { distance: 100, opacity: 20, thickness: 0.4 },
      mouse: { distance: 150, opacity: 40 },
      breathing: { intensity: 100, speed: 1 }
    },
    intense: {
      enabled: true,
      particles: { quantity: 80, size: 3.5, speed: 0.9, opacity: 90 },
      connections: { distance: 150, opacity: 35, thickness: 0.6 },
      mouse: { distance: 200, opacity: 60 },
      breathing: { intensity: 150, speed: 1.3 }
    },
    disabled: {
      enabled: false,
      particles: { quantity: 0, size: 0, speed: 0, opacity: 0 },
      connections: { distance: 0, opacity: 0, thickness: 0 },
      mouse: { distance: 0, opacity: 0 },
      breathing: { intensity: 0, speed: 0 }
    }
  };
  
  const applyPreset = (presetName) => {
    setNeuralConfig(presets[presetName]);
  };
  
  const updateConfig = (section, key, value) => {
    setNeuralConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl rounded-2xl"
        style={{
          backgroundColor: 'rgba(13, 15, 51, 0.95)',
          border: '1px solid rgba(0, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header - Fixed */}
        <div 
          className="p-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center">
                <Palette size={20} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  Configurações da Interface
                </h2>
                <p className="text-xs text-white/40">Personalize sua experiência visual</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(13,15,51,0.4)] transition-colors">
              <X size={20} className="text-white/50" />
            </button>
          </div>
        </div>
        
        {/* Tabs - Fixed */}
        <div 
          className="flex flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all relative
                ${activeTab === tab.id 
                  ? 'text-cyan-400' 
                  : tab.disabled 
                    ? 'text-white/20 cursor-not-allowed' 
                    : 'text-white/50 hover:text-white/70'
                }`}
            >
              <tab.icon size={16} />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.disabled && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/30">Em breve</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-600" />
              )}
            </button>
          ))}
        </div>
        
        {/* Content - Scrollable */}
        <div 
          className="p-5 flex-1 min-h-0"
          style={{ overflowY: 'auto' }}
        >
          {activeTab === 'neural' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Presets */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium">Presets</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'subtle', label: 'Sutil', desc: 'Discreto' },
                    { id: 'default', label: 'Padrão', desc: 'Equilibrado' },
                    { id: 'intense', label: 'Intenso', desc: 'Vibrante' },
                    { id: 'disabled', label: 'Desativado', desc: 'Sem efeito' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className="p-3 rounded-xl text-center transition-all hover:border-cyan-400/30"
                      style={{
                        backgroundColor: 'rgba(13, 15, 51, 0.4)',
                        border: '1px solid rgba(0, 255, 255, 0.1)'
                      }}
                    >
                      <p className="text-sm font-medium text-white/90">{preset.label}</p>
                      <p className="text-[10px] text-white/40">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Particles Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center">
                    <Sparkles size={12} className="text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Partículas</h3>
                </div>
                <div 
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    backgroundColor: 'rgba(13, 15, 51, 0.3)',
                    border: '1px solid rgba(0, 255, 255, 0.08)'
                  }}
                >
                  <Slider 
                    label="Quantidade" 
                    value={neuralConfig.particles.quantity} 
                    onChange={(v) => updateConfig('particles', 'quantity', v)}
                    min={10} max={100} 
                  />
                  <Slider 
                    label="Tamanho" 
                    value={neuralConfig.particles.size} 
                    onChange={(v) => updateConfig('particles', 'size', v)}
                    min={0.5} max={5} step={0.1}
                    unit="px"
                  />
                  <Slider 
                    label="Velocidade" 
                    value={neuralConfig.particles.speed} 
                    onChange={(v) => updateConfig('particles', 'speed', v)}
                    min={0.1} max={1.5} step={0.1}
                  />
                  <Slider 
                    label="Opacidade" 
                    value={neuralConfig.particles.opacity} 
                    onChange={(v) => updateConfig('particles', 'opacity', v)}
                    min={10} max={100}
                    unit="%"
                  />
                </div>
              </div>
              
              {/* Connections Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center">
                    <Link2 size={12} className="text-violet-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Conexões</h3>
                </div>
                <div 
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    backgroundColor: 'rgba(13, 15, 51, 0.3)',
                    border: '1px solid rgba(138, 43, 226, 0.08)'
                  }}
                >
                  <Slider 
                    label="Distância Máxima" 
                    value={neuralConfig.connections.distance} 
                    onChange={(v) => updateConfig('connections', 'distance', v)}
                    min={30} max={200}
                    unit="px"
                  />
                  <Slider 
                    label="Opacidade" 
                    value={neuralConfig.connections.opacity} 
                    onChange={(v) => updateConfig('connections', 'opacity', v)}
                    min={5} max={50}
                    unit="%"
                  />
                  <Slider 
                    label="Espessura" 
                    value={neuralConfig.connections.thickness} 
                    onChange={(v) => updateConfig('connections', 'thickness', v)}
                    min={0.1} max={1} step={0.1}
                    unit="px"
                  />
                </div>
              </div>
              
              {/* Mouse Interaction Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center">
                    <Eye size={12} className="text-amber-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Interação com Mouse</h3>
                </div>
                <div 
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    backgroundColor: 'rgba(13, 15, 51, 0.3)',
                    border: '1px solid rgba(245, 158, 11, 0.08)'
                  }}
                >
                  <Slider 
                    label="Distância de Atração" 
                    value={neuralConfig.mouse.distance} 
                    onChange={(v) => updateConfig('mouse', 'distance', v)}
                    min={50} max={250}
                    unit="px"
                  />
                  <Slider 
                    label="Opacidade da Conexão" 
                    value={neuralConfig.mouse.opacity} 
                    onChange={(v) => updateConfig('mouse', 'opacity', v)}
                    min={10} max={80}
                    unit="%"
                  />
                </div>
              </div>
              
              {/* Breathing Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
                    <Cpu size={12} className="text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium text-white/90">Respiração (Breathing)</h3>
                </div>
                <div 
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    backgroundColor: 'rgba(13, 15, 51, 0.3)',
                    border: '1px solid rgba(34, 197, 94, 0.08)'
                  }}
                >
                  <Slider 
                    label="Intensidade" 
                    value={neuralConfig.breathing.intensity} 
                    onChange={(v) => updateConfig('breathing', 'intensity', v)}
                    min={0} max={200}
                    unit="%"
                  />
                  <Slider 
                    label="Velocidade" 
                    value={neuralConfig.breathing.speed} 
                    onChange={(v) => updateConfig('breathing', 'speed', v)}
                    min={0.3} max={2} step={0.1}
                    unit="x"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'api' && (
            <div className="space-y-6">
              {/* Provedor de Imagem */}
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-4">
                  Provedor de Imagem
                </h3>
                <p className="text-xs text-white/40 mb-4">
                  Escolha qual serviço usar para gerar imagens de personagens.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Pollinations */}
                  <button
                    onClick={() => setImageProvider('pollinations')}
                    className={`p-4 rounded-xl text-left transition-all ${
                      imageProvider === 'pollinations' 
                        ? 'ring-2 ring-cyan-500/50' 
                        : 'hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: imageProvider === 'pollinations' 
                        ? 'rgba(0, 255, 255, 0.1)' 
                        : 'rgba(13, 15, 51, 0.3)',
                      border: `1px solid ${imageProvider === 'pollinations' 
                        ? 'rgba(0, 255, 255, 0.3)' 
                        : 'rgba(255, 255, 255, 0.05)'}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-cyan-400" />
                      <span className="font-medium text-white">Pollinations.ai</span>
                    </div>
                    <p className="text-xs text-white/50">Gratuito, sem API key</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-400">
                      Recomendado
                    </span>
                  </button>
                  
                  {/* Gemini */}
                  <button
                    onClick={() => setImageProvider('gemini')}
                    className={`p-4 rounded-xl text-left transition-all ${
                      imageProvider === 'gemini' 
                        ? 'ring-2 ring-violet-500/50' 
                        : 'hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: imageProvider === 'gemini' 
                        ? 'rgba(138, 43, 226, 0.1)' 
                        : 'rgba(13, 15, 51, 0.3)',
                      border: `1px solid ${imageProvider === 'gemini' 
                        ? 'rgba(138, 43, 226, 0.3)' 
                        : 'rgba(255, 255, 255, 0.05)'}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-violet-400" />
                      <span className="font-medium text-white">Google Gemini</span>
                    </div>
                    <p className="text-xs text-white/50">Requer API Key + Proxy</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400">
                      Avançado
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Configuração do Gemini (só aparece se selecionado) */}
              {imageProvider === 'gemini' && (
                <div className="pt-4 border-t border-cyan-500/10">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-violet-400/80 font-medium mb-4">
                    Configuração Gemini
                  </h3>
                  
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <p className="text-xs text-amber-300">
                      ⚠️ A API do Google não permite chamadas diretas do navegador (CORS). 
                      Para usar o Gemini, você precisará configurar um proxy/backend.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
                      API Key do Google
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={googleApiKey || ''}
                        onChange={(e) => setGoogleApiKey(e.target.value)}
                        placeholder="AIza..."
                        className="w-full rounded-xl px-4 py-3 pr-20 text-white/90 placeholder-white/30
                          focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                        style={{ 
                          backgroundColor: 'rgba(13, 15, 51, 0.5)',
                          border: '1px solid rgba(138, 43, 226, 0.2)'
                        }}
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/70"
                      >
                        {showApiKey ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    
                    {googleApiKey && (
                      <div className="flex items-center gap-2 text-green-400/80">
                        <Check size={14} />
                        <span className="text-xs">API Key configurada</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)' }}>
                    <h4 className="text-sm font-medium text-violet-300 mb-2">Como obter sua API Key:</h4>
                    <ol className="text-xs text-white/50 space-y-1.5 list-decimal list-inside">
                      <li>Acesse <span className="text-cyan-400">aistudio.google.com</span></li>
                      <li>Clique em "Get API Key"</li>
                      <li>Crie ou selecione um projeto</li>
                      <li>Copie a chave gerada e cole acima</li>
                    </ol>
                  </div>
                </div>
              )}
              
              {/* Info sobre Pollinations */}
              {imageProvider === 'pollinations' && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 255, 255, 0.05)', border: '1px solid rgba(0, 255, 255, 0.1)' }}>
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">Sobre o Pollinations.ai</h4>
                  <ul className="text-xs text-white/50 space-y-1.5">
                    <li>✓ 100% gratuito, sem limites</li>
                    <li>✓ Não requer cadastro ou API key</li>
                    <li>✓ Funciona diretamente no navegador</li>
                    <li>✓ Boa qualidade para retratos de personagens</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'fonts' && (
            <div className="flex items-center justify-center h-40 text-white/30">
              <p>Configurações de fontes em breve...</p>
            </div>
          )}
          
          {activeTab === 'interface' && (
            <div className="flex items-center justify-center h-40 text-white/30">
              <p>Configurações de interface em breve...</p>
            </div>
          )}
        </div>
        
        {/* Footer - Fixed */}
        <div 
          className="p-5 flex justify-between items-center flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0, 255, 255, 0.1)' }}
        >
          <button
            onClick={() => applyPreset('default')}
            className="text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            Restaurar Padrões
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium
              hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300 flex items-center gap-2"
          >
            <Check size={18} />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HOME SCREEN - Menu Principal
// ═══════════════════════════════════════════════════════════════════════════
const HomeScreen = ({ onNavigate, onOpenSettings, castingCount, codexCount, hasApiKey }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 relative">
    {/* Settings Button - Floating */}
    <button
      onClick={onOpenSettings}
      className="absolute top-4 right-4 p-3 rounded-xl transition-all hover:scale-105"
      style={{
        backgroundColor: 'rgba(13, 15, 51, 0.4)',
        border: '1px solid rgba(0, 255, 255, 0.1)'
      }}
      title="Configurações"
    >
      <Settings size={20} className="text-cyan-400" />
    </button>
    
    {/* API Key Warning */}
    {!hasApiKey && (
      <button
        onClick={onOpenSettings}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
        style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}
      >
        <AlertCircle size={16} className="text-amber-400" />
        <span className="text-xs text-amber-300">Configurar API Key</span>
      </button>
    )}
    
    {/* Logo & Title */}
    <div className="text-center mb-12">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center border border-cyan-500/20">
        <Sparkles size={36} className="text-cyan-400" />
      </div>
      <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
        ArcVox Studio
      </h1>
      <p className="text-white/40">Digital RPG Master</p>
    </div>
    
    {/* Menu Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
      {/* Nova Crônica */}
      <button
        onClick={() => onNavigate('chronicle')}
        className="group p-8 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
        style={{
          backgroundColor: 'rgba(13, 15, 51, 0.4)',
          border: '1px solid rgba(0, 255, 255, 0.1)'
        }}
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <BookOpen size={24} className="text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Nova Crônica
        </h2>
        <p className="text-sm text-white/40">
          Crie uma nova história interativa com personagens e narração
        </p>
      </button>
      
      {/* Casting */}
      <button
        onClick={() => onNavigate('casting')}
        className="group p-8 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
        style={{
          backgroundColor: 'rgba(13, 15, 51, 0.4)',
          border: '1px solid rgba(138, 43, 226, 0.1)'
        }}
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 to-violet-600/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Users size={24} className="text-violet-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Casting
        </h2>
        <p className="text-sm text-white/40">
          Gerencie seu elenco de personagens reutilizáveis
        </p>
        {castingCount > 0 && (
          <span className="inline-block mt-3 px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300">
            {castingCount} personagens
          </span>
        )}
      </button>
      
      {/* Códice */}
      <button
        onClick={() => onNavigate('codex')}
        className="group p-8 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] opacity-50 cursor-not-allowed"
        style={{
          backgroundColor: 'rgba(13, 15, 51, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
        disabled
      >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-4">
          <Film size={24} className="text-amber-400/50" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-white/50" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Códice
        </h2>
        <p className="text-sm text-white/30">
          Biblioteca de crônicas salvas
        </p>
        <span className="inline-block mt-3 px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/30">
          Em breve
        </span>
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// CASTING LIBRARY - Biblioteca de Personagens
// ═══════════════════════════════════════════════════════════════════════════
const CastingLibrary = ({ characters, onEdit, onCreate, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const roleIcons = {
    protagonista: Crown,
    antagonista: Ghost,
    suporte: Shield,
    mentor: Star,
    interesse: Heart,
    comico: Smile
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
          >
            <ArrowLeft size={20} className="text-white/50" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
              Casting
            </h1>
            <p className="text-sm text-white/40">Sua biblioteca de personagens</p>
          </div>
        </div>
        
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium
            hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300"
        >
          <Plus size={18} />
          Novo Personagem
        </button>
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Buscar personagens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl text-white/90 placeholder-white/30
            focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
          style={{
            backgroundColor: 'rgba(13, 15, 51, 0.5)',
            border: '1px solid rgba(0, 255, 255, 0.1)'
          }}
        />
      </div>
      
      {/* Characters Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map(char => {
            const RoleIcon = roleIcons[char.role] || User;
            return (
              <div
                key={char.id}
                className="group p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(13, 15, 51, 0.4)',
                  border: '1px solid rgba(0, 255, 255, 0.08)'
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar ou Imagem de Referência */}
                  {char.referenceImage ? (
                    <div 
                      className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: '2px solid rgba(0, 255, 255, 0.2)' }}
                    >
                      <img 
                        src={char.referenceImage} 
                        alt={char.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: char.color || 'rgba(0, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <span className="text-xl font-bold text-white/70">
                        {char.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      {char.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <RoleIcon size={12} className="text-white/40" />
                      <span className="text-xs text-white/40 capitalize">{char.role || 'Indefinido'}</span>
                      {char.age && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-xs text-white/40">{char.age} anos</span>
                        </>
                      )}
                    </div>
                    {char.traits && char.traits.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {char.traits.slice(0, 3).map((trait, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/50">
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  {/* Indicators */}
                  <div className="flex items-center gap-2">
                    {char.referenceImage && (
                      <span className="text-[10px] text-cyan-400/50 flex items-center gap-1">
                        <Camera size={10} />
                        Ref. visual
                      </span>
                    )}
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(char)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyan-400/80 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Edit3 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(char.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{
            backgroundColor: 'rgba(13, 15, 51, 0.3)',
            border: '2px dashed rgba(0, 255, 255, 0.15)'
          }}
        >
          <Users size={48} className="text-white/10 mb-4" />
          <h3 className="text-lg font-medium text-white/50 mb-2" style={{ fontFamily: "'Crimson Pro', serif" }}>
            {searchTerm ? 'Nenhum personagem encontrado' : 'Seu elenco está vazio'}
          </h3>
          <p className="text-sm text-white/30 mb-6">
            {searchTerm ? 'Tente outro termo de busca' : 'Crie seu primeiro personagem para começar'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors"
              style={{
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.2)'
              }}
            >
              <Plus size={18} className="text-cyan-400" />
              <span className="text-cyan-400">Criar Personagem</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CHARACTER EDITOR - Tela de Criação/Edição de Personagem
// ═══════════════════════════════════════════════════════════════════════════
const CharacterEditor = ({ character, allCharacters, voices, googleApiKey, imageProvider, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: character?.id || `char-${Date.now()}`,
    name: character?.name || '',
    voice: character?.voice || 'Zephyr',
    role: character?.role || 'suporte',
    color: character?.color || 'rgba(0, 255, 255, 0.15)',
    // Aparência Física
    age: character?.age || '',
    gender: character?.gender || '',
    sexuality: character?.sexuality || '',
    bodyType: character?.bodyType || '',
    height: character?.height || '',
    skinTone: character?.skinTone || '',
    hairColor: character?.hairColor || '',
    hairStyle: character?.hairStyle || '',
    eyeColor: character?.eyeColor || '',
    distinctiveMarks: character?.distinctiveMarks || '',
    // Imagem de Referência
    referenceImage: character?.referenceImage || null,
    referenceImageName: character?.referenceImageName || '',
    // Personalidade
    traits: character?.traits || [],
    motivation: character?.motivation || '',
    fear: character?.fear || '',
    background: character?.background || '',
    secret: character?.secret || '',
    mannerisms: character?.mannerisms || '',
    relationships: character?.relationships || {}
  });
  
  const [newTrait, setNewTrait] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GERAÇÃO DE IMAGEM - Via Backend API (resolve CORS)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const generateCharacterImage = async () => {
    setIsGeneratingImage(true);
    setImageError('');
    
    try {
      // Preparar dados do personagem para a API
      const characterData = {
        name: formData.name,
        age: formData.age,
        gender: genders.find(g => g.value === formData.gender)?.label || '',
        bodyType: bodyTypes.find(b => b.value === formData.bodyType)?.label || '',
        height: heights.find(h => h.value === formData.height)?.label || '',
        skinTone: skinTones.find(s => s.value === formData.skinTone)?.label || '',
        hairColor: hairColors.find(h => h.value === formData.hairColor)?.label || '',
        hairStyle: formData.hairStyle,
        eyeColor: eyeColors.find(e => e.value === formData.eyeColor)?.label || '',
        distinctiveMarks: formData.distinctiveMarks
      };
      
      // Chamar API do backend
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterData })
      });
      
      const data = await response.json();
      
      if (data.success && data.image) {
        updateField('referenceImage', data.image);
        updateField('referenceImageName', data.fallback ? 'AI Generated (Gemini Fallback)' : 'AI Generated (Imagen 3)');
      } else {
        throw new Error(data.error || 'Erro ao gerar imagem');
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      
      // Fallback para Pollinations se backend falhar
      try {
        await generateWithPollinationsFallback();
      } catch (fallbackError) {
        setImageError(error.message || 'Erro ao gerar imagem. Verifique se o servidor está rodando.');
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Fallback para Pollinations.ai (caso backend não esteja disponível)
  const generateWithPollinationsFallback = async () => {
    const genderLabel = genders.find(g => g.value === formData.gender)?.label || '';
    const bodyTypeLabel = bodyTypes.find(b => b.value === formData.bodyType)?.label || '';
    const skinToneLabel = skinTones.find(s => s.value === formData.skinTone)?.label || '';
    const hairColorLabel = hairColors.find(h => h.value === formData.hairColor)?.label || '';
    const eyeColorLabel = eyeColors.find(e => e.value === formData.eyeColor)?.label || '';
    
    const characterDescription = [
      formData.age && `${formData.age} years old`,
      genderLabel && genderLabel.toLowerCase(),
      bodyTypeLabel && `${bodyTypeLabel.toLowerCase()} build`,
      skinToneLabel && `${skinToneLabel.toLowerCase()} skin`,
      hairColorLabel && hairColorLabel !== 'Careca' && `${hairColorLabel.toLowerCase()} hair`,
      hairColorLabel === 'Careca' && 'bald',
      formData.hairStyle,
      eyeColorLabel && `${eyeColorLabel.toLowerCase()} eyes`,
      formData.distinctiveMarks,
    ].filter(Boolean).join(', ');
    
    const prompt = `cinematic portrait photography of a ${characterDescription}, professional headshot, studio lighting, dark neutral background, high detail face, photorealistic, 8k`;
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true`;
    
    updateField('referenceImage', imageUrl);
    updateField('referenceImageName', 'AI Generated (Pollinations Fallback)');
  };
  
  const roles = [
    { value: 'protagonista', label: 'Protagonista', icon: Crown },
    { value: 'antagonista', label: 'Antagonista', icon: Ghost },
    { value: 'suporte', label: 'Suporte', icon: Shield },
    { value: 'mentor', label: 'Mentor', icon: Star },
    { value: 'interesse', label: 'Interesse Romântico', icon: Heart },
    { value: 'comico', label: 'Alívio Cômico', icon: Smile }
  ];
  
  const genders = [
    { value: '', label: 'Selecionar...' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'nao-binario', label: 'Não-binário' },
    { value: 'outro', label: 'Outro' }
  ];
  
  const sexualities = [
    { value: '', label: 'Selecionar...' },
    { value: 'heterossexual', label: 'Heterossexual' },
    { value: 'homossexual', label: 'Homossexual' },
    { value: 'bissexual', label: 'Bissexual' },
    { value: 'pansexual', label: 'Pansexual' },
    { value: 'assexual', label: 'Assexual' },
    { value: 'outro', label: 'Outro' },
    { value: 'nao-definido', label: 'Prefiro não definir' }
  ];
  
  const bodyTypes = [
    { value: '', label: 'Selecionar...' },
    { value: 'magro', label: 'Magro' },
    { value: 'esbelto', label: 'Esbelto' },
    { value: 'atletico', label: 'Atlético' },
    { value: 'mediano', label: 'Mediano' },
    { value: 'robusto', label: 'Robusto' },
    { value: 'corpulento', label: 'Corpulento' }
  ];
  
  const heights = [
    { value: '', label: 'Selecionar...' },
    { value: 'muito-baixo', label: 'Muito baixo' },
    { value: 'baixo', label: 'Baixo' },
    { value: 'mediano', label: 'Mediano' },
    { value: 'alto', label: 'Alto' },
    { value: 'muito-alto', label: 'Muito alto' }
  ];
  
  const skinTones = [
    { value: 'muito-clara', label: 'Muito clara', color: '#FFE4D4' },
    { value: 'clara', label: 'Clara', color: '#F5D0B5' },
    { value: 'media', label: 'Média', color: '#D4A574' },
    { value: 'morena', label: 'Morena', color: '#A67C52' },
    { value: 'escura', label: 'Escura', color: '#6B4423' },
    { value: 'muito-escura', label: 'Muito escura', color: '#3D2314' }
  ];
  
  const hairColors = [
    { value: '', label: 'Selecionar...' },
    { value: 'preto', label: 'Preto' },
    { value: 'castanho-escuro', label: 'Castanho escuro' },
    { value: 'castanho', label: 'Castanho' },
    { value: 'castanho-claro', label: 'Castanho claro' },
    { value: 'loiro', label: 'Loiro' },
    { value: 'ruivo', label: 'Ruivo' },
    { value: 'grisalho', label: 'Grisalho' },
    { value: 'branco', label: 'Branco' },
    { value: 'colorido', label: 'Colorido/Fantasia' },
    { value: 'careca', label: 'Careca' }
  ];
  
  const eyeColors = [
    { value: '', label: 'Selecionar...' },
    { value: 'castanho-escuro', label: 'Castanho escuro' },
    { value: 'castanho', label: 'Castanho' },
    { value: 'castanho-claro', label: 'Castanho claro / Mel' },
    { value: 'verde', label: 'Verde' },
    { value: 'azul', label: 'Azul' },
    { value: 'cinza', label: 'Cinza' },
    { value: 'heterocromia', label: 'Heterocromia' }
  ];
  
  const colors = [
    'rgba(0, 255, 255, 0.15)',
    'rgba(138, 43, 226, 0.15)',
    'rgba(239, 68, 68, 0.15)',
    'rgba(34, 197, 94, 0.15)',
    'rgba(245, 158, 11, 0.15)',
    'rgba(236, 72, 153, 0.15)',
    'rgba(99, 102, 241, 0.15)',
    'rgba(20, 184, 166, 0.15)'
  ];
  
  const relationshipTypes = [
    { value: '', label: 'Sem vínculo' },
    { value: 'amigo', label: 'Amigo(a)' },
    { value: 'inimigo', label: 'Inimigo(a)' },
    { value: 'namorado', label: 'Namorado(a)' },
    { value: 'familia', label: 'Família' },
    { value: 'mentor', label: 'Mentor(a)' },
    { value: 'rival', label: 'Rival' },
    { value: 'aliado', label: 'Aliado(a)' },
    { value: 'desconhecido', label: 'Desconhecido(a)' }
  ];
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      updateField('referenceImage', e.target.result);
      updateField('referenceImageName', file.name);
    };
    reader.readAsDataURL(file);
  };
  
  const removeImage = () => {
    updateField('referenceImage', null);
    updateField('referenceImageName', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const addTrait = () => {
    if (newTrait.trim() && formData.traits.length < 6) {
      updateField('traits', [...formData.traits, newTrait.trim()]);
      setNewTrait('');
    }
  };
  
  const removeTrait = (index) => {
    updateField('traits', formData.traits.filter((_, i) => i !== index));
  };
  
  const updateRelationship = (charId, type) => {
    updateField('relationships', { ...formData.relationships, [charId]: type });
  };
  
  const otherCharacters = allCharacters.filter(c => c.id !== formData.id);
  
  const isValid = formData.name.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
          >
            <ArrowLeft size={20} className="text-white/50" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
              {character ? 'Editar Personagem' : 'Novo Personagem'}
            </h1>
            <p className="text-sm text-white/40">Defina as características do seu personagem</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-4">
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Nome do Personagem"
                placeholder="Ex: Elena Vasquez"
                value={formData.name}
                onChange={(v) => updateField('name', v)}
              />
              
              <GlassSelect
                label="Voz (TTS)"
                value={formData.voice}
                onChange={(v) => updateField('voice', v)}
                options={voices}
              />
            </div>
            
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium block mb-3">
                Papel na Narrativa
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(role => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <button
                      key={role.value}
                      onClick={() => updateField('role', role.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-violet-600/20 text-white border border-cyan-500/30'
                          : 'bg-white/5 text-white/50 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Icon size={14} />
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium block mb-3">
                Cor do Avatar
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => updateField('color', color)}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      formData.color === color ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0D0F33]' : ''
                    }`}
                    style={{ backgroundColor: color, border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
          
          {/* Aparência Física */}
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-4">
              Aparência Física
            </h2>
            
            {/* Idade, Gênero, Sexualidade */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
                  Idade
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  placeholder="Ex: 25"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white/90 placeholder-white/30
                    focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  style={{ 
                    backgroundColor: 'rgba(13, 15, 51, 0.5)',
                    border: '1px solid rgba(0, 255, 255, 0.1)'
                  }}
                />
              </div>
              
              <GlassSelect
                label="Gênero"
                value={formData.gender}
                onChange={(v) => updateField('gender', v)}
                options={genders}
              />
              
              <GlassSelect
                label="Sexualidade"
                value={formData.sexuality}
                onChange={(v) => updateField('sexuality', v)}
                options={sexualities}
              />
            </div>
            
            {/* Tipo Físico, Altura */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <GlassSelect
                label="Tipo Físico"
                value={formData.bodyType}
                onChange={(v) => updateField('bodyType', v)}
                options={bodyTypes}
              />
              
              <GlassSelect
                label="Altura"
                value={formData.height}
                onChange={(v) => updateField('height', v)}
                options={heights}
              />
            </div>
            
            {/* Tom de Pele */}
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium block mb-3">
                Tom de Pele
              </label>
              <div className="flex gap-2">
                {skinTones.map(tone => (
                  <button
                    key={tone.value}
                    onClick={() => updateField('skinTone', tone.value)}
                    title={tone.label}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      formData.skinTone === tone.value ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0D0F33]' : ''
                    }`}
                    style={{ backgroundColor: tone.color, border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            </div>
            
            {/* Cabelo */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <GlassSelect
                label="Cor do Cabelo"
                value={formData.hairColor}
                onChange={(v) => updateField('hairColor', v)}
                options={hairColors}
              />
              
              <GlassInput
                label="Estilo do Cabelo"
                placeholder="Ex: Curto, ondulado"
                value={formData.hairStyle}
                onChange={(v) => updateField('hairStyle', v)}
              />
            </div>
            
            {/* Olhos */}
            <div className="mt-4">
              <GlassSelect
                label="Cor dos Olhos"
                value={formData.eyeColor}
                onChange={(v) => updateField('eyeColor', v)}
                options={eyeColors}
              />
            </div>
            
            {/* Marcas Distintivas */}
            <div className="mt-4">
              <GlassTextarea
                label="Marcas Distintivas"
                placeholder="Ex: Cicatriz no queixo, tatuagem tribal no braço, usa óculos redondos, barba por fazer..."
                value={formData.distinctiveMarks}
                onChange={(v) => updateField('distinctiveMarks', v)}
                rows={2}
              />
            </div>
          </GlassCard>
          
          {/* Imagem de Referência */}
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-2">
              Imagem de Referência
            </h2>
            <p className="text-xs text-white/40 mb-4">
              Faça upload de uma imagem ou gere uma com IA baseada na aparência descrita.
            </p>
            
            {formData.referenceImage ? (
              <div className="flex items-start gap-4">
                {/* Preview da imagem */}
                <div 
                  className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 relative"
                  style={{ border: '2px solid rgba(0, 255, 255, 0.2)' }}
                >
                  {/* Se for URL externa, mostrar placeholder clicável */}
                  {formData.referenceImage.startsWith('http') ? (
                    <a 
                      href={formData.referenceImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-600/20 to-cyan-500/20 hover:from-violet-600/30 hover:to-cyan-500/30 transition-all cursor-pointer"
                    >
                      <Sparkles size={24} className="text-cyan-400 mb-2" />
                      <span className="text-[10px] text-cyan-400">Clique para ver</span>
                    </a>
                  ) : (
                    <img 
                      src={formData.referenceImage} 
                      alt="Referência" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Check size={16} />
                    <span className="text-sm">Imagem gerada!</span>
                  </div>
                  <p className="text-xs text-white/40 mb-2">
                    {formData.referenceImageName}
                  </p>
                  
                  {/* Aviso para URLs externas */}
                  {formData.referenceImage.startsWith('http') && (
                    <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] text-amber-300">
                        ⚠️ Preview bloqueado pelo sandbox. Clique no botão abaixo para ver.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    {/* Botão para abrir imagem externa */}
                    {formData.referenceImage.startsWith('http') && (
                      <a
                        href={formData.referenceImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-1"
                        style={{ border: '1px solid rgba(34, 197, 94, 0.3)' }}
                      >
                        <Eye size={12} />
                        Ver Imagem
                      </a>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      style={{ border: '1px solid rgba(0, 255, 255, 0.2)' }}
                    >
                      Trocar
                    </button>
                    <button
                      onClick={generateCharacterImage}
                      disabled={isGeneratingImage}
                      className="px-3 py-1.5 rounded-lg text-xs text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                      style={{ border: '1px solid rgba(138, 43, 226, 0.2)' }}
                    >
                      {isGeneratingImage ? 'Gerando...' : '✨ Regenerar'}
                    </button>
                    <button
                      onClick={removeImage}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-400/70 hover:bg-red-500/10 transition-colors"
                      style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Opções de upload e geração */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-6 rounded-xl flex flex-col items-center gap-2 transition-all hover:bg-white/5"
                    style={{
                      border: '2px dashed rgba(0, 255, 255, 0.15)',
                      backgroundColor: 'rgba(13, 15, 51, 0.3)'
                    }}
                  >
                    <Camera size={20} className="text-cyan-400/50" />
                    <div className="text-center">
                      <p className="text-white/50 text-xs">Upload</p>
                      <p className="text-white/30 text-[10px]">PNG, JPG</p>
                    </div>
                  </button>
                  
                  {/* Gerar com IA */}
                  <button
                    onClick={generateCharacterImage}
                    disabled={isGeneratingImage || !formData.gender}
                    className="py-6 rounded-xl flex flex-col items-center gap-2 transition-all hover:bg-violet-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      border: '2px dashed rgba(138, 43, 226, 0.2)',
                      backgroundColor: 'rgba(138, 43, 226, 0.05)'
                    }}
                  >
                    {isGeneratingImage ? (
                      <>
                        <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                        <p className="text-violet-300 text-xs">Gerando...</p>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} className="text-violet-400/70" />
                        <div className="text-center">
                          <p className="text-violet-300 text-xs">Gerar com IA</p>
                          <p className="text-white/30 text-[10px]">
                            {imageProvider === 'pollinations' ? 'Pollinations' : 'Gemini'}
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                </div>
                
                {!formData.gender && (
                  <p className="text-xs text-amber-400/60 text-center">
                    💡 Preencha a Aparência Física (ao menos gênero) para gerar com IA
                  </p>
                )}
              </div>
            )}
            
            {/* Erro */}
            {imageError && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">{imageError}</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </GlassCard>
          
          {/* Personality */}
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-4">
              Personalidade
            </h2>
            
            {/* Traits */}
            <div className="mb-4">
              <label className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium block mb-2">
                Traços de Personalidade (máx. 6)
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {formData.traits.map((trait, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-violet-500/15 text-violet-300 border border-violet-500/20"
                  >
                    {trait}
                    <button onClick={() => removeTrait(i)} className="text-violet-300/50 hover:text-violet-300">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              {formData.traits.length < 6 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Corajosa, Impulsiva..."
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                    className="flex-1 px-4 py-2 rounded-xl text-sm text-white/90 placeholder-white/30
                      focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                    style={{
                      backgroundColor: 'rgba(13, 15, 51, 0.5)',
                      border: '1px solid rgba(0, 255, 255, 0.1)'
                    }}
                  />
                  <button
                    onClick={addTrait}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <GlassTextarea
                label="Motivação Principal"
                placeholder="O que move este personagem?"
                value={formData.motivation}
                onChange={(v) => updateField('motivation', v)}
                rows={2}
              />
              <GlassTextarea
                label="Medo / Fraqueza"
                placeholder="O que este personagem teme?"
                value={formData.fear}
                onChange={(v) => updateField('fear', v)}
                rows={2}
              />
            </div>
            
            <div className="mt-4">
              <GlassInput
                label="Maneirismos / Trejeitos"
                placeholder="Ex: Coça o queixo quando pensa, fala rápido quando nervosa..."
                value={formData.mannerisms}
                onChange={(v) => updateField('mannerisms', v)}
              />
            </div>
          </GlassCard>
          
          {/* Background */}
          <GlassCard className="p-6">
            <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-4">
              História
            </h2>
            
            <GlassTextarea
              label="Background"
              placeholder="Descreva a história de fundo do personagem, sua origem, experiências formativas..."
              value={formData.background}
              onChange={(v) => updateField('background', v)}
              rows={4}
            />
            
            <div className="mt-4">
              <GlassTextarea
                label="Segredo"
                placeholder="Algo que o personagem esconde ou que poucos sabem..."
                value={formData.secret}
                onChange={(v) => updateField('secret', v)}
                rows={2}
              />
            </div>
          </GlassCard>
          
          {/* Relationships */}
          {otherCharacters.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-cyan-400/80 font-medium mb-4">
                Relacionamentos
              </h2>
              <p className="text-xs text-white/40 mb-4">
                Defina como este personagem se relaciona com outros do seu elenco
              </p>
              
              <div className="space-y-3">
                {otherCharacters.map(char => (
                  <div 
                    key={char.id}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(13, 15, 51, 0.3)' }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: char.color }}
                    >
                      <span className="text-sm font-bold text-white/70">
                        {char.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 text-white/80">{char.name}</span>
                    <select
                      value={formData.relationships[char.id] || ''}
                      onChange={(e) => updateRelationship(char.id, e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm text-white/80 bg-[#0D0F33] border border-cyan-500/10"
                    >
                      {relationshipTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
        
        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Character Preview */}
          <GlassCard className="p-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-white/40 mb-4">Preview</h3>
            
            <div className="flex flex-col items-center text-center">
              {/* Avatar ou Imagem de Referência */}
              {formData.referenceImage ? (
                <div 
                  className="w-24 h-24 rounded-2xl overflow-hidden mb-4"
                  style={{ border: '2px solid rgba(0, 255, 255, 0.3)' }}
                >
                  <img 
                    src={formData.referenceImage} 
                    alt={formData.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: formData.color, border: '2px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="text-3xl font-bold text-white/70">
                    {formData.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                {formData.name || 'Nome do Personagem'}
              </h3>
              
              <span className="text-sm text-white/40 capitalize mb-2">
                {roles.find(r => r.value === formData.role)?.label || 'Papel'}
              </span>
              
              {/* Idade e Gênero */}
              {(formData.age || formData.gender) && (
                <p className="text-xs text-white/50 mb-2">
                  {formData.age && `${formData.age} anos`}
                  {formData.age && formData.gender && ' • '}
                  {formData.gender && genders.find(g => g.value === formData.gender)?.label}
                </p>
              )}
              
              {/* Aparência resumida */}
              {(formData.bodyType || formData.height) && (
                <p className="text-xs text-white/40 mb-2">
                  {bodyTypes.find(b => b.value === formData.bodyType)?.label}
                  {formData.bodyType && formData.height && ', '}
                  {heights.find(h => h.value === formData.height)?.label}
                </p>
              )}
              
              {formData.traits.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {formData.traits.map((trait, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/50">
                      {trait}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Volume2 size={14} />
                {formData.voice}
              </div>
              
              {/* Indicador de imagem */}
              {formData.referenceImage && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-cyan-400/60">
                  <Camera size={12} />
                  <span>Com referência visual</span>
                </div>
              )}
            </div>
          </GlassCard>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => onSave(formData)}
              disabled={!isValid}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium
                hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Check size={18} />
              Salvar no Casting
            </button>
            
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 rounded-xl text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
const ArcVoxStudio = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'chronicle', 'casting', 'character-editor'
  const [editingCharacter, setEditingCharacter] = useState(null);
  
  // API Configuration
  const [googleApiKey, setGoogleApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('arcvox_google_api_key') || '';
    }
    return '';
  });
  
  // Image Provider: 'pollinations' (default, free) or 'gemini' (requires backend/proxy)
  const [imageProvider, setImageProvider] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('arcvox_image_provider') || 'pollinations';
    }
    return 'pollinations';
  });
  
  // Salvar configurações no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (googleApiKey) localStorage.setItem('arcvox_google_api_key', googleApiKey);
      localStorage.setItem('arcvox_image_provider', imageProvider);
    }
  }, [googleApiKey, imageProvider]);
  
  // Casting (Persistent Character Library)
  const [castingCharacters, setCastingCharacters] = useState([]);
  
  // Project State (Chronicle)
  const [chronicleName, setChronicleName] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [theme, setTheme] = useState('');
  const [advancedContext, setAdvancedContext] = useState('');
  const [atmosphere, setAtmosphere] = useState([]); // Array para múltiplas atmosferas
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  const [narratorVoice, setNarratorVoice] = useState('Zephyr');
  const [decisionMode, setDecisionMode] = useState('hybrid'); // 'auto', 'manual', 'hybrid'
  const [selectedCastIds, setSelectedCastIds] = useState([]); // IDs dos personagens selecionados do Casting
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiType, setApiType] = useState('free');
  
  // Neural Animation Config
  const [neuralConfig, setNeuralConfig] = useState({
    enabled: true,
    particles: { quantity: 50, size: 2.5, speed: 0.6, opacity: 70 },
    connections: { distance: 100, opacity: 20, thickness: 0.4 },
    mouse: { distance: 150, opacity: 40 },
    breathing: { intensity: 100, speed: 1 }
  });
  
  // Available voices (Gemini 2.5 Flash TTS)
  const voices = [
    { value: 'Zephyr', label: 'Zephyr (Neutro, Brilhante)' },
    { value: 'Puck', label: 'Puck (Masculino, Jovem)' },
    { value: 'Charon', label: 'Charon (Masculino, Grave)' },
    { value: 'Kore', label: 'Kore (Feminino, Firme)' },
    { value: 'Fenrir', label: 'Fenrir (Masculino, Excitável)' },
    { value: 'Aoede', label: 'Aoede (Feminino, Brilhante)' },
    { value: 'Leda', label: 'Leda (Feminino, Jovem)' },
    { value: 'Orus', label: 'Orus (Masculino, Firme)' },
    { value: 'Proteus', label: '⭐ Proteus (Premium)', disabled: apiType === 'free' },
    { value: 'Nova', label: '⭐ Nova (Premium)', disabled: apiType === 'free' },
  ];
  
  const atmospheres = [
    { value: 'terror', label: '🌙 Terror' },
    { value: 'misterio', label: '🔍 Mistério' },
    { value: 'drama', label: '🎭 Drama' },
    { value: 'romance', label: '💕 Romance' },
    { value: 'acao', label: '⚔️ Ação' },
    { value: 'comedia', label: '😄 Comédia' },
    { value: 'ficcao', label: '🚀 Ficção Científica' },
    { value: 'fantasia', label: '🧙 Fantasia' },
  ];
  
  const themes = [
    { value: '', label: 'Selecionar tema...' },
    { value: 'distopia', label: 'Distopia Futurista' },
    { value: 'apocalipse', label: 'Apocalipse Zumbi' },
    { value: 'medieval', label: 'Medieval Fantástico' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'steampunk', label: 'Steampunk' },
    { value: 'contemporaneo', label: 'Contemporâneo' },
    { value: 'espacial', label: 'Exploração Espacial' },
    { value: 'noir', label: 'Noir Detetivesco' },
    { value: 'custom', label: '✨ Personalizado' },
  ];
  
  // Casting Functions
  const saveCharacterToCasting = (characterData) => {
    setCastingCharacters(prev => {
      const exists = prev.find(c => c.id === characterData.id);
      if (exists) {
        return prev.map(c => c.id === characterData.id ? characterData : c);
      }
      return [...prev, characterData];
    });
    setEditingCharacter(null);
    setCurrentScreen('casting');
  };
  
  const deleteCharacterFromCasting = (charId) => {
    setCastingCharacters(prev => prev.filter(c => c.id !== charId));
    setSelectedCastIds(prev => prev.filter(id => id !== charId));
  };
  
  // Get selected cast members for the chronicle
  const selectedCastMembers = castingCharacters.filter(c => selectedCastIds.includes(c.id));
  
  // Toggle cast member selection
  const toggleCastSelection = (charId) => {
    setSelectedCastIds(prev => 
      prev.includes(charId) 
        ? prev.filter(id => id !== charId)
        : [...prev, charId]
    );
  };
  
  const canGenerate = () => {
    if (!chronicleName || !chapterName) return false;
    if (!narratorEnabled && selectedCastMembers.length < 2) return false;
    return true;
  };
  
  const projectData = {
    chronicleName,
    chapterName,
    theme,
    advancedContext,
    atmosphere,
    narratorEnabled,
    narratorVoice,
    decisionMode,
    personas: selectedCastMembers // Usando personagens do Casting
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#0D0F33' }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.5); }
        }
        
        /* Breathing Animations - Layered for organic feel */
        @keyframes breatheOuter {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        
        @keyframes breatheMidOuter {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          40% { 
            opacity: 0.9;
            transform: scale(1.015);
          }
          60% {
            opacity: 0.85;
            transform: scale(1.01);
          }
        }
        
        @keyframes breathePrimary {
          0%, 100% { 
            opacity: 0.85;
          }
          30% { 
            opacity: 0.95;
          }
          50% { 
            opacity: 1;
          }
          70% {
            opacity: 0.92;
          }
        }
        
        @keyframes breatheInner {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          35% { 
            opacity: 0.75;
            transform: scale(1.01);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.02);
          }
          65% {
            opacity: 0.7;
            transform: scale(1.01);
          }
        }
        
        @keyframes breatheCore {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          25% { 
            opacity: 0.6;
            transform: scale(1.01);
          }
          50% { 
            opacity: 0.85;
            transform: scale(1.03);
          }
          75% {
            opacity: 0.55;
            transform: scale(1.015);
          }
        }
        
        @keyframes breatheShimmer {
          0%, 100% { 
            opacity: 0.3;
          }
          30% { 
            opacity: 0.5;
          }
          50% { 
            opacity: 0.7;
          }
          80% {
            opacity: 0.4;
          }
        }
        
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        
        /* Slider Styles */
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffff, #8a2be2);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.7);
        }
        .slider-input::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffff, #8a2be2);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
        }
        .slider-input::-moz-range-thumb:hover {
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.7);
        }
      `}</style>
      
      <AmbientBackground neuralConfig={neuralConfig} />
      
      {/* Header - Mostrar apenas quando não está na Home */}
      {currentScreen !== 'home' && (
        <header 
          className="relative z-10"
          style={{
            backgroundColor: 'rgba(13, 15, 51, 0.3)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(0, 255, 255, 0.08)'
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Home Button */}
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="p-2 rounded-xl transition-colors hover:bg-white/5"
                  title="Voltar ao Menu"
                >
                  <Home size={20} className="text-white/50" />
                </button>
                
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    ArcVox Studio
                  </h1>
                  <p className="text-xs text-white/40">Digital RPG Master</p>
                </div>
              </div>
              
              {/* API Status & Settings */}
              <div className="flex items-center gap-3">
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2.5 rounded-xl transition-all hover:scale-105"
                  style={{
                  backgroundColor: 'rgba(13, 15, 51, 0.4)',
                  border: '1px solid rgba(0, 255, 255, 0.1)'
                }}
                title="Configurações da Interface"
              >
                <Palette size={18} className="text-cyan-400" />
              </button>
              
              {/* Plan Status */}
              <GlassCard className="px-4 py-2 flex items-center gap-3" hover={false}>
                <div className={`w-2 h-2 rounded-full ${apiType === 'free' ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className="text-sm text-white/70">
                  {apiType === 'free' ? 'Plano Gratuito' : 'Plano Pago'}
                </span>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  <Settings size={14} />
                </button>
              </GlassCard>
            </div>
          </div>
        </div>
      </header>
      )}
      
      {/* Main Content - Conditional Rendering */}
      <main className="relative z-10">
        {/* Home Screen */}
        {currentScreen === 'home' && (
          <HomeScreen 
            onNavigate={setCurrentScreen}
            onOpenSettings={() => setShowSettings(true)}
            castingCount={castingCharacters.length}
            codexCount={0}
            hasApiKey={!!googleApiKey}
          />
        )}
        
        {/* Casting Library */}
        {currentScreen === 'casting' && (
          <CastingLibrary
            characters={castingCharacters}
            onEdit={(char) => {
              setEditingCharacter(char);
              setCurrentScreen('character-editor');
            }}
            onCreate={() => {
              setEditingCharacter(null);
              setCurrentScreen('character-editor');
            }}
            onDelete={deleteCharacterFromCasting}
            onBack={() => setCurrentScreen('home')}
          />
        )}
        
        {/* Character Editor */}
        {currentScreen === 'character-editor' && (
          <CharacterEditor
            character={editingCharacter}
            allCharacters={castingCharacters}
            voices={voices.filter(v => !v.disabled)}
            googleApiKey={googleApiKey}
            imageProvider={imageProvider}
            onSave={saveCharacterToCasting}
            onCancel={() => setCurrentScreen('casting')}
          />
        )}
        
        {/* Chronicle Screen */}
        {currentScreen === 'chronicle' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Chronicle Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chronicle Info */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center">
                  <BookOpen size={16} className="text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  Configuração da Crônica
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <GlassInput
                  label="Nome da Crônica"
                  placeholder="Ex: A Queda de Nova Arcádia"
                  value={chronicleName}
                  onChange={setChronicleName}
                />
                <GlassInput
                  label="Nome do Capítulo"
                  placeholder="Ex: O Despertar"
                  value={chapterName}
                  onChange={setChapterName}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <GlassSelect
                  label="Tema / Contexto"
                  value={theme}
                  onChange={setTheme}
                  options={themes}
                />
                
                {/* Atmosfera - Dropdown com seleção múltipla */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-medium flex items-center gap-2">
                    <span>Atmosferas (máx. 3)</span>
                    {atmosphere.length > 0 && (
                      <span className="flex items-center gap-1 text-sm normal-case tracking-normal">
                        {atmosphere.map(atmValue => {
                          const atm = atmospheres.find(a => a.value === atmValue);
                          return <span key={atmValue}>{atm?.label.split(' ')[0]}</span>;
                        })}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !atmosphere.includes(value) && atmosphere.length < 3) {
                          setAtmosphere([...atmosphere, value]);
                        } else if (atmosphere.includes(value)) {
                          setAtmosphere(atmosphere.filter(a => a !== value));
                        }
                      }}
                      className="w-full rounded-xl px-4 py-3 text-white/90
                        focus:outline-none focus:ring-1 focus:ring-cyan-500/30
                        transition-all duration-300 appearance-none cursor-pointer"
                      style={{ 
                        fontFamily: "'Inter', sans-serif",
                        backgroundColor: 'rgba(13, 15, 51, 0.5)',
                        border: '1px solid rgba(0, 255, 255, 0.1)'
                      }}
                    >
                      <option value="" disabled style={{ backgroundColor: '#0D0F33' }}>
                        {atmosphere.length === 0 
                          ? 'Selecionar atmosferas...' 
                          : atmosphere.length >= 3 
                            ? 'Limite atingido (3)' 
                            : 'Adicionar mais...'}
                      </option>
                      {atmospheres.map(atm => {
                        const isSelected = atmosphere.includes(atm.value);
                        return (
                          <option 
                            key={atm.value} 
                            value={atm.value} 
                            style={{ backgroundColor: '#0D0F33' }}
                          >
                            {isSelected ? '✓ ' : '  '}{atm.label}
                          </option>
                        );
                      })}
                    </select>
                    {/* Dropdown arrow */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronRight size={16} className="text-white/40 rotate-90" />
                    </div>
                  </div>
                  
                  {/* Tags das selecionadas */}
                  {atmosphere.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {atmosphere.map((atmValue, index) => {
                        const atm = atmospheres.find(a => a.value === atmValue);
                        return (
                          <span 
                            key={atmValue}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: index === 0 
                                ? 'rgba(0, 255, 255, 0.12)' 
                                : 'rgba(138, 43, 226, 0.12)',
                              border: `1px solid ${index === 0 
                                ? 'rgba(0, 255, 255, 0.25)' 
                                : 'rgba(138, 43, 226, 0.25)'}`
                            }}
                          >
                            <span className="text-white/70">{atm?.label}</span>
                            <button
                              onClick={() => setAtmosphere(atmosphere.filter(a => a !== atmValue))}
                              className="text-white/40 hover:text-white/70 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <GlassTextarea
                  label="Contexto Avançado (Background do Universo)"
                  placeholder="Descreva o mundo, a história, as regras do universo, eventos importantes que moldaram a realidade..."
                  value={advancedContext}
                  onChange={setAdvancedContext}
                  rows={4}
                />
              </div>
            </GlassCard>
            
            {/* Narrator Settings */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-violet-600/5 flex items-center justify-center">
                    <Mic size={16} className="text-violet-500" />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Sistema de Narração
                  </h2>
                </div>
                <Toggle
                  label=""
                  checked={narratorEnabled}
                  onChange={setNarratorEnabled}
                />
              </div>
              
              {narratorEnabled && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <GlassSelect
                    label="Voz do Narrador"
                    value={narratorVoice}
                    onChange={setNarratorVoice}
                    options={voices.filter(v => !v.disabled)}
                    icon={Volume2}
                  />
                  <div className="flex items-end">
                    <button 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all hover:border-cyan-400/30"
                      style={{
                        backgroundColor: 'rgba(13, 15, 51, 0.4)',
                        border: '1px solid rgba(0, 255, 255, 0.12)'
                      }}
                    >
                      <Play size={16} className="text-cyan-400" />
                      <span className="text-sm text-white/70">Teste de Voz</span>
                    </button>
                  </div>
                </div>
              )}
              
              {!narratorEnabled && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fadeIn">
                  <AlertCircle size={18} className="text-amber-400" />
                  <p className="text-sm text-amber-200/80">
                    Com o narrador desativado, é necessário criar pelo menos <strong>2 personas</strong>.
                  </p>
                </div>
              )}
            </GlassCard>
            
            {/* Tipo de Decisão */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                  <Zap size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Tipo de Decisão
                  </h2>
                  <p className="text-xs text-white/40">Como a narrativa será conduzida</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Automática */}
                <button
                  onClick={() => setDecisionMode('auto')}
                  className={`p-4 rounded-xl text-left transition-all ${
                    decisionMode === 'auto' ? 'ring-2 ring-cyan-400/50' : ''
                  }`}
                  style={{
                    backgroundColor: decisionMode === 'auto' 
                      ? 'rgba(0, 255, 255, 0.1)' 
                      : 'rgba(13, 15, 51, 0.4)',
                    border: `1px solid ${decisionMode === 'auto' 
                      ? 'rgba(0, 255, 255, 0.3)' 
                      : 'rgba(0, 255, 255, 0.1)'}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu size={18} className={decisionMode === 'auto' ? 'text-cyan-400' : 'text-white/40'} />
                    <span className={`text-sm font-medium ${decisionMode === 'auto' ? 'text-cyan-300' : 'text-white/70'}`}>
                      Automática
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    A IA conduz toda a narrativa. Assista a história se desenrolar.
                  </p>
                </button>
                
                {/* Híbrido */}
                <button
                  onClick={() => setDecisionMode('hybrid')}
                  className={`p-4 rounded-xl text-left transition-all ${
                    decisionMode === 'hybrid' ? 'ring-2 ring-violet-400/50' : ''
                  }`}
                  style={{
                    backgroundColor: decisionMode === 'hybrid' 
                      ? 'rgba(138, 43, 226, 0.1)' 
                      : 'rgba(13, 15, 51, 0.4)',
                    border: `1px solid ${decisionMode === 'hybrid' 
                      ? 'rgba(138, 43, 226, 0.3)' 
                      : 'rgba(138, 43, 226, 0.1)'}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className={decisionMode === 'hybrid' ? 'text-violet-400' : 'text-white/40'} />
                    <span className={`text-sm font-medium ${decisionMode === 'hybrid' ? 'text-violet-300' : 'text-white/70'}`}>
                      Híbrido
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    A IA narra, mas você decide em momentos cruciais.
                  </p>
                </button>
                
                {/* Manual */}
                <button
                  onClick={() => setDecisionMode('manual')}
                  className={`p-4 rounded-xl text-left transition-all ${
                    decisionMode === 'manual' ? 'ring-2 ring-amber-400/50' : ''
                  }`}
                  style={{
                    backgroundColor: decisionMode === 'manual' 
                      ? 'rgba(245, 158, 11, 0.1)' 
                      : 'rgba(13, 15, 51, 0.4)',
                    border: `1px solid ${decisionMode === 'manual' 
                      ? 'rgba(245, 158, 11, 0.3)' 
                      : 'rgba(245, 158, 11, 0.1)'}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className={decisionMode === 'manual' ? 'text-amber-400' : 'text-white/40'} />
                    <span className={`text-sm font-medium ${decisionMode === 'manual' ? 'text-amber-300' : 'text-white/70'}`}>
                      Manual
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    Você controla todas as decisões dos personagens.
                  </p>
                </button>
              </div>
              
              {/* Dica contextual */}
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(13, 15, 51, 0.3)' }}>
                <p className="text-xs text-white/50">
                  {decisionMode === 'auto' && '🎬 Modo Cinema — Relaxe e aprecie a história criada pela IA.'}
                  {decisionMode === 'hybrid' && '⚖️ Modo Interativo — A IA apresentará escolhas em momentos importantes da trama.'}
                  {decisionMode === 'manual' && '🎮 Modo RPG — Você tem controle total sobre as ações e diálogos.'}
                </p>
              </div>
            </GlassCard>
            
            {/* Elenco - Seleção do Casting */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-violet-600/5 flex items-center justify-center">
                    <Users size={16} className="text-violet-400" />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Elenco
                  </h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-[rgba(13,15,51,0.3)] text-white/50">
                    {selectedCastMembers.length} selecionado{selectedCastMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentScreen('casting')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm"
                  style={{
                    background: 'linear-gradient(to right, rgba(138, 43, 226, 0.15), rgba(0, 255, 255, 0.15))',
                    border: '1px solid rgba(138, 43, 226, 0.2)'
                  }}
                >
                  <Users size={16} className="text-violet-400" />
                  <span>Gerenciar Casting</span>
                </button>
              </div>
              
              {/* Seleção de personagens do Casting */}
              {castingCharacters.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-white/40">
                    Selecione os personagens que participarão desta crônica:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {castingCharacters.map(char => {
                      const isSelected = selectedCastIds.includes(char.id);
                      return (
                        <button
                          key={char.id}
                          onClick={() => toggleCastSelection(char.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            isSelected 
                              ? 'ring-2 ring-cyan-500/50' 
                              : 'hover:bg-white/5'
                          }`}
                          style={{
                            backgroundColor: isSelected 
                              ? 'rgba(0, 255, 255, 0.1)' 
                              : 'rgba(13, 15, 51, 0.3)',
                            border: `1px solid ${isSelected 
                              ? 'rgba(0, 255, 255, 0.3)' 
                              : 'rgba(255, 255, 255, 0.05)'}`
                          }}
                        >
                          {/* Avatar ou Imagem */}
                          {char.referenceImage ? (
                            <div 
                              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                              style={{ border: '1px solid rgba(0, 255, 255, 0.2)' }}
                            >
                              <img 
                                src={char.referenceImage} 
                                alt={char.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: char.color }}
                            >
                              <span className="text-sm font-bold text-white/70">
                                {char.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{char.name}</p>
                            <p className="text-xs text-white/40 capitalize">
                              {char.role || 'Suporte'}
                              {char.age && ` • ${char.age} anos`}
                            </p>
                          </div>
                          {isSelected && (
                            <Check size={16} className="text-cyan-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Selected Cast Summary */}
                  {selectedCastMembers.length > 0 && (
                    <div className="pt-4 border-t border-cyan-500/10">
                      <p className="text-xs text-white/40 mb-2">Elenco desta crônica:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCastMembers.map(char => (
                          <span 
                            key={char.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                            style={{
                              backgroundColor: 'rgba(138, 43, 226, 0.15)',
                              border: '1px solid rgba(138, 43, 226, 0.25)'
                            }}
                          >
                            <span className="text-white/80">{char.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCastSelection(char.id);
                              }}
                              className="text-white/40 hover:text-white/70"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="text-center py-12 rounded-xl"
                  style={{
                    border: '1px dashed rgba(138, 43, 226, 0.2)',
                    backgroundColor: 'rgba(13, 15, 51, 0.2)'
                  }}
                >
                  <Users size={40} className="mx-auto text-violet-500/30 mb-3" />
                  <p className="text-white/40 mb-2">Seu Casting está vazio</p>
                  <p className="text-white/30 text-sm mb-4">Crie personagens para adicionar ao elenco</p>
                  <button
                    onClick={() => setCurrentScreen('casting')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm text-violet-400/80 hover:text-violet-300"
                    style={{
                      backgroundColor: 'rgba(138, 43, 226, 0.1)',
                      border: '1px solid rgba(138, 43, 226, 0.2)'
                    }}
                  >
                    <Plus size={16} />
                    Criar Personagens
                  </button>
                </div>
              )}
            </GlassCard>
          </div>
          
          {/* Right Column - Actions & Preview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-white/40 mb-4">Ações</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!canGenerate()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(13, 15, 51, 0.4)',
                    border: '1px solid rgba(0, 255, 255, 0.12)'
                  }}
                >
                  <Eye size={18} className="text-white/60" />
                  <span>Prévia do Projeto</span>
                </button>
                
                <button
                  disabled={!canGenerate()}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all
                    ${canGenerate() 
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-600 hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] animate-pulse-glow' 
                      : 'bg-[rgba(13,15,51,0.25)] text-white/30 cursor-not-allowed'
                    }`}
                >
                  <Zap size={18} />
                  <span>Gerar Capítulo</span>
                </button>
              </div>
              
              {!canGenerate() && (
                <p className="text-xs text-white/30 mt-4 text-center">
                  Preencha o nome da crônica, capítulo e {!narratorEnabled ? 'adicione pelo menos 2 personas' : 'configure as opções'} para continuar.
                </p>
              )}
            </GlassCard>
            
            {/* Project Summary */}
            <GlassCard className="p-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-white/40 mb-4">Resumo</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-cyan-500/5">
                  <span className="text-white/50 text-sm">Crônica</span>
                  <span className="text-white/80 text-sm truncate max-w-[150px]">{chronicleName || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cyan-500/5">
                  <span className="text-white/50 text-sm">Capítulo</span>
                  <span className="text-white/80 text-sm truncate max-w-[150px]">{chapterName || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cyan-500/5">
                  <span className="text-white/50 text-sm">Atmosferas</span>
                  <span className="text-white/80 text-sm">
                    {atmosphere.length > 0 
                      ? atmosphere.map(a => atmospheres.find(atm => atm.value === a)?.label.split(' ')[0]).join(' • ')
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cyan-500/5">
                  <span className="text-white/50 text-sm">Narrador</span>
                  <span className={`text-sm ${narratorEnabled ? 'text-green-400' : 'text-white/30'}`}>
                    {narratorEnabled ? 'Ativado' : 'Desativado'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-cyan-500/5">
                  <span className="text-white/50 text-sm">Decisão</span>
                  <span className={`text-sm ${
                    decisionMode === 'auto' ? 'text-cyan-400' : 
                    decisionMode === 'hybrid' ? 'text-violet-400' : 
                    'text-amber-400'
                  }`}>
                    {decisionMode === 'auto' ? 'Automática' : decisionMode === 'hybrid' ? 'Híbrida' : 'Manual'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/50 text-sm">Elenco</span>
                  <span className="text-white/80 text-sm">{selectedCastMembers.length}</span>
                </div>
              </div>
            </GlassCard>
            
            {/* Codex Info */}
            <GlassCard className="p-6 bg-gradient-to-br from-violet-600/5 to-transparent">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-violet-500" />
                </div>
                <div>
                  <h3 className="font-medium text-white/90 mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                    Códice de Realidades
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Seus projetos são salvos automaticamente no Códice. Você pode retomar qualquer crônica anterior a qualquer momento.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        </div>
        )}
      </main>
      
      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          project={projectData}
          atmospheresList={atmospheres}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            // Trigger generation
            console.log('Generating chapter with:', projectData);
          }}
        />
      )}
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          neuralConfig={neuralConfig}
          setNeuralConfig={setNeuralConfig}
          googleApiKey={googleApiKey}
          setGoogleApiKey={setGoogleApiKey}
          imageProvider={imageProvider}
          setImageProvider={setImageProvider}
        />
      )}
    </div>
  );
};

export default ArcVoxStudio;
