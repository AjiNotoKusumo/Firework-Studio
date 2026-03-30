'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState } from 'react';

// ─── PURPOSE COLORS ──────────────────────────────────────────────────────────
const PURPOSE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  hook: { label: 'Hook', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  build: { label: 'Build', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  payoff: { label: 'Payoff', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  cta: { label: 'CTA', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Scene = {
  id: number;
  purpose: string;
  description: string;
  startTime: number;
  endTime: number;
  camera: string;
  motion: string;
  emotion: string;
  soundEffect: { name: string };
};

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────
export default function StoryboardPreviewModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeScene, setActiveScene] = useState<number>(0);

  const initialScenes: Scene[] = [
    {
      id: 1,
      purpose: 'hook',
      description: 'Person gulping sugary drink looking tired',
      startTime: 0,
      endTime: 3,
      camera: 'Close-up',
      motion: 'Fast zoom-in',
      emotion: 'Urgency',
      soundEffect: { name: 'AUUGHHH' },
    },
    {
      id: 2,
      purpose: 'build',
      description: 'Pouring lemon water. MISTAKE #1 text overlay',
      startTime: 3,
      endTime: 6,
      camera: 'Overhead',
      motion: 'Fast cut',
      emotion: 'Instructional',
      soundEffect: { name: 'Core Sound' },
    },
    {
      id: 3,
      purpose: 'build',
      description: 'Adding electrolytes. MISTAKE #2 text',
      startTime: 6,
      endTime: 9,
      camera: 'Macro',
      motion: 'Handheld',
      emotion: 'Informative',
      soundEffect: { name: 'Error sound' },
    },
    {
      id: 4,
      purpose: 'payoff',
      description: 'Drinks water, looks refreshed and energised',
      startTime: 9,
      endTime: 12,
      camera: 'Eye-level',
      motion: 'Slow tilt',
      emotion: 'Satisfied',
      soundEffect: { name: 'Correct ding' },
    },
    {
      id: 5,
      purpose: 'cta',
      description: 'READ CAPTION text on screen, talent smiling to camera',
      startTime: 12,
      endTime: 15,
      camera: 'Medium shot',
      motion: 'Static',
      emotion: 'Empowering',
      soundEffect: { name: 'Champions' },
    },
    {
      id: 6,
      purpose: 'cta',
      description: 'READ CAPTION text on screen, talent smiling to camera',
      startTime: 12,
      endTime: 15,
      camera: 'Medium shot',
      motion: 'Static',
      emotion: 'Empowering',
      soundEffect: { name: 'Champions' },
    },
    {
      id: 7,
      purpose: 'cta',
      description: 'READ CAPTION text on screen, talent smiling to camera',
      startTime: 12,
      endTime: 15,
      camera: 'Medium shot',
      motion: 'Static',
      emotion: 'Empowering',
      soundEffect: { name: 'Champions' },
    },
    {
      id: 8,
      purpose: 'build',
      description: 'Adding electrolytes. MISTAKE #2 text',
      startTime: 6,
      endTime: 9,
      camera: 'Macro',
      motion: 'Handheld',
      emotion: 'Informative',
      soundEffect: { name: 'Error sound' },
    },
  ];

  const [scenes, setScenes] = useState<Scene[]>(initialScenes);

  // ── helper: update a field on the active scene ──────────────────────────
  const updateScene = (field: keyof Scene, value: string) => {
    setScenes((prev) =>
      prev.map((s, i) => {
        if (i !== activeScene) return s;
        if (field === 'soundEffect') return { ...s, soundEffect: { name: value } };
        return { ...s, [field]: value };
      }),
    );
  };

  const data = {
    concept: {
      title: 'Stop Ruining Your Morning Hydration',
      hook: 'Stop drinking water like this in the morning.',
    },
    globalStyle: {
      visualStyle: 'Modern, clean, high-contrast fitness aesthetic',
      colorPalette: 'Electric blue, white, dark charcoal',
    },
    structure: { type: 'video' },
    scenes,
  };

  const totalDuration = data.scenes[data.scenes.length - 1].endTime;
  const scene = data.scenes[activeScene];
  const purposeCfg = PURPOSE_CONFIG[scene.purpose] ?? {
    label: scene.purpose,
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.15)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-auto border-0"
        style={{
          width: '92vw',
          maxWidth: '1200px',
          height: '88vh',
          maxHeight: '860px',
          background: '#F0FDF4', // was #0F1117 — light green base
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(34,197,94,0.18)', // was rgba(0,0,0,0.6) — green-tinted shadow
        }}>
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <VisuallyHidden>
          <DialogTitle>Storyboard Preview</DialogTitle>
        </VisuallyHidden>
        <div
          style={{
            padding: '20px 28px 16px',
            borderBottom: '1px solid rgba(34,197,94,0.2)', // was rgba(255,255,255,0.07) — soft green border
            flexShrink: 0,
          }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#4D8A63', // was #6B7280 — muted green
                  }}>
                  Storyboard Preview
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: 'rgba(56,189,248,0.12)', // was rgba(255,255,255,0.06) — sky blue tint
                    color: '#0369A1', // was #9CA3AF — sky blue text
                    border: '1px solid rgba(56,189,248,0.3)', // was rgba(255,255,255,0.08)
                  }}>
                  {data.structure.type} · {totalDuration}s
                </span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0C2A1A', lineHeight: 1.3, margin: 0 }}>
                {/* was #F9FAFB — deep dark green for contrast on light bg */}
                {data.concept.title}
              </h2>
              <p style={{ fontSize: 13, color: '#4D8A63', marginTop: 4 }}>{data.concept.hook}</p>
              {/* was #6B7280 — muted green */}
            </div>

            {/* Style tags */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {[data.globalStyle.visualStyle, data.globalStyle.colorPalette].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(250,204,21,0.15)', // was rgba(255,255,255,0.05) — sunny yellow tint
                    border: '1px solid rgba(250,204,21,0.4)', // was rgba(255,255,255,0.08) — yellow border
                    color: '#854D0E', // was #9CA3AF — warm amber-brown text
                    whiteSpace: 'nowrap',
                  }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── TIMELINE BAR ─────────────────────────────────────────────── */}
          <div style={{ marginTop: 16, display: 'flex', gap: 3, height: 6, borderRadius: 6, overflow: 'hidden' }}>
            {data.scenes.map((s, i) => {
              const cfg = PURPOSE_CONFIG[s.purpose] ?? { color: '#6B7280', bg: '', label: '' };
              const widthPct = ((s.endTime - s.startTime) / totalDuration) * 100;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScene(i)}
                  style={{
                    width: `${widthPct}%`,
                    background: i === activeScene ? cfg.color : 'rgba(0,0,0,0.1)', // was rgba(255,255,255,0.12) — light gray on light bg
                    borderRadius: 3,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    padding: 0,
                  }}
                  title={`Scene ${i + 1}: ${s.purpose}`}
                />
              );
            })}
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 28px 24px',
            gap: 20,
          }}>
          {/* ── SCENE STRIP ────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
            {data.scenes.map((s, i) => {
              const cfg = PURPOSE_CONFIG[s.purpose] ?? {
                color: '#6B7280',
                bg: 'rgba(107,114,128,0.15)',
                label: s.purpose,
              };
              const isActive = i === activeScene;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScene(i)}
                  style={{
                    flex: 1,
                    background: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)', // was 0.06/0.02 — bright white cards
                    border: `1.5px solid ${isActive ? cfg.color : 'rgba(34,197,94,0.2)'}`, // was rgba(255,255,255,0.07) — green border
                    borderRadius: 14,
                    padding: '12px 10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                  {/* accent top bar */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: cfg.color,
                        borderRadius: '14px 14px 0 0',
                      }}
                    />
                  )}

                  {/* scene number */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: isActive ? cfg.color : '#86BFAA', // was #4B5563 — soft muted green
                      marginBottom: 6,
                    }}>
                    SCENE {i + 1}
                  </div>

                  {/* preview box — aspect ratio 16:9 */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: isActive ? cfg.bg : 'rgba(56,189,248,0.07)', // was rgba(255,255,255,0.03) — sky blue tint
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                    <span style={{ fontSize: 20 }}>
                      {s.purpose === 'hook' ?
                        '🎣'
                      : s.purpose === 'build' ?
                        '🔨'
                      : s.purpose === 'payoff' ?
                        '✅'
                      : '📣'}
                    </span>
                    {/* timecode */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 6,
                        fontSize: 9,
                        color: 'rgba(0,0,0,0.3)', // was rgba(255,255,255,0.4) — dark on light bg
                        fontFamily: 'monospace',
                      }}>
                      {s.startTime}s–{s.endTime}s
                    </div>
                  </div>

                  {/* purpose badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 20,
                      background: cfg.bg,
                      color: cfg.color,
                      textTransform: 'capitalize',
                      letterSpacing: '0.04em',
                    }}>
                    {cfg.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── DETAIL PANEL ───────────────────────────────────────────── */}
          <div
            style={{
              minHeight: 380,
              background: '#FFFFFF', // was rgba(255,255,255,0.03) — clean white panel
              border: '1px solid rgba(34,197,94,0.18)', // was rgba(255,255,255,0.07) — green border
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
            }}>
            {/* Left — scene description */}
            <div
              style={{
                flex: 1,
                padding: '20px 24px',
                borderRight: '1px solid rgba(34,197,94,0.12)', // was rgba(255,255,255,0.06)
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: '#4D8A63', // was #4B5563 — muted green label
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                  Scene {activeScene + 1} Description
                </p>
                <textarea
                  value={scene.description}
                  onChange={(e) => updateScene('description', e.target.value)}
                  rows={3}
                  style={{
                    fontSize: 15,
                    color: '#1A3828',
                    lineHeight: 1.6,
                    margin: 0,
                    width: '100%',
                    resize: 'vertical',
                    background: 'rgba(34,197,94,0.05)',
                    border: '1.5px solid rgba(34,197,94,0.25)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(34,197,94,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(34,197,94,0.25)')}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <div className="flex-1">
                  <Tag icon="⏱" label={`${scene.startTime}s → ${scene.endTime}s`} />
                  <Tag icon="🎭" label={scene.emotion} color={purposeCfg.color} />
                </div>
                <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-800 bg-gradient-to-r from-green-100 to-green-200 border border-sky-300 shadow-sm hover:from-green-200 hover:to-green-300 hover:border-sky-400 active:scale-95 transition-all duration-200">
                  Save
                </button>
              </div>
            </div>

            {/* Right — production details */}
            <div
              style={{
                width: 260,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                flexShrink: 0,
                background: '#F0F9FF', // sky blue tint for right panel
              }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#0369A1', // was #4B5563 — sky blue label
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                Production Notes
              </p>

              <DetailRow icon="🎥" label="Camera" value={scene.camera} onChange={(v) => updateScene('camera', v)} />
              <DetailRow icon="🎬" label="Motion" value={scene.motion} onChange={(v) => updateScene('motion', v)} />
              <DetailRow icon="💭" label="Emotion" value={scene.emotion} onChange={(v) => updateScene('emotion', v)} />
              <DetailRow
                icon="🔊"
                label="Sound"
                value={scene.soundEffect.name}
                onChange={(v) => updateScene('soundEffect', v)}
              />

              {/* purpose chip */}
              <div style={{ marginTop: 'auto' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 24,
                    background: purposeCfg.bg,
                    border: `1px solid ${purposeCfg.color}40`,
                    fontSize: 12,
                    fontWeight: 600,
                    color: purposeCfg.color,
                    textTransform: 'capitalize',
                  }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: purposeCfg.color }} />
                  {purposeCfg.label} Scene
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function Tag({ icon, label, color }: { icon: string; label: string; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 8,
        background: 'rgba(250,204,21,0.12)', // was rgba(255,255,255,0.05) — sunny yellow tint
        border: '1px solid rgba(250,204,21,0.35)', // was rgba(255,255,255,0.08) — yellow border
        color: color ?? '#4D8A63', // was #9CA3AF — muted green default
      }}>
      {icon} {label}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 10,
          color: '#0369A1',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          fontWeight: 600,
        }}>
        {icon} {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontSize: 13,
          color: '#0C2A1A',
          fontWeight: 500,
          background: 'rgba(56,189,248,0.08)',
          border: '1.5px solid rgba(56,189,248,0.3)',
          borderRadius: 8,
          padding: '5px 10px',
          outline: 'none',
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(56,189,248,0.7)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(56,189,248,0.3)')}
      />
    </div>
  );
}
