'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useState, useEffect, use } from 'react';
import Toastify from 'toastify-js';

// ─── PURPOSE COLORS ──────────────────────────────────────────────────────────
const PURPOSE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  hook: { label: 'Hook', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  build: { label: 'Build', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  payoff: { label: 'Payoff', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  call_to_action: { label: 'CTA', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
type StoryboardData = {
  concept: {
    title: string;
    hook: string;
  };
  globalStyle: {
    visualStyle: string;
    colorPalette: string;
  };
  structure: {
    type: 'video' | 'carousel';
  };
  scenes: {
    id: number;
    purpose: string;
    description: string;
    startTime: number;
    endTime: number;
    camera: string;
    motion: string;
    emotion: string;
    soundEffect: { name: string };
  }[];
};

type Scene = {
  id: number;
  sceneNumber?: number;
  purpose: string;
  description: string;
  startTime?: number;
  endTime?: number;
  camera?: string;
  motion?: string;
  emotion: string;
  soundEffect?: { name: string; url?: string };
  headline?: string;
  textOverlay?: string;
  visualFocus?: string;
  filter?: string;
};

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────
export default function StoryboardPreviewModal({
  open,
  onOpenChange,
  storyboardData,
  postId,
  planId,
  fetchIdeas
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyboardData: any | null;
  postId?: string;
  planId?: string;
  fetchIdeas?: () => void;
}) {
  const [activeScene, setActiveScene] = useState<number>(0);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({});
  const [loadingScenes, setLoadingScenes] = useState<Set<number>>(new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: storyboardData }), // Sending the object your API expects
      });

      if (!response.ok) throw new Error("Export failed");

      // 1. Convert the response to a Blob (Binary Large Object)
      const blob = await response.blob();

      // 2. Create a temporary local URL for that blob
      const url = window.URL.createObjectURL(blob);

      // 3. Create a "ghost" anchor link and click it programmatically
      const link = document.createElement("a");
      link.href = url;
      link.download = `storyboard.pdf`; // The filename
      document.body.appendChild(link);
      link.click();

      // 4. Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      Toastify({
        text: `Export complete!`,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#A7D7A0",
          color: "#2E2E2E",
          borderRadius: "12px", 
          border: "1px solid rgba(46, 111, 64, 0.1)"
        },
      }).showToast();
    } catch (error) {
      console.log("Download error:", error);
      Toastify({
        text: `Export failed!`,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#FF8A8A",
          color: "#2E2E2E",
          borderRadius: "12px", 
          border: "1px solid rgba(46, 111, 64, 0.1)"
        },
      }).showToast();
    } finally {
      setIsExporting(false);
    }
  };

  const fetchSceneImage = async () => {
    if (!planId) return;
    console.log(`Fetching scene image for planId: ${planId}`);
    try {
      const response = await fetch(`/api/ai/scene/${planId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();

      console.log('Scene image data:', data);
      const tempObj: any = {};

      data.forEach((scene: any, index: number) => {
        tempObj[index] = scene.scene.image;
      });

      setSceneImages(tempObj);
    } catch (err) {
      console.error('Failed to fetch scene image:', err);
    }
  };

  const toggleTag = (key: string) =>
    setExpandedTags((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // ── IMAGE GENERATION ────────────────────────────────────────────────────────
  const generateSingle = async (sceneIndex: number) => {
    if (!storyboardData) return;

    const s = data.scenes[sceneIndex];
    setLoadingScenes((prev) => new Set(prev).add(sceneIndex));

    try {
      const res = await fetch('/api/ai/images/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: storyboardData.concept,
          globalStyle: storyboardData.globalStyle,
          structure: storyboardData.structure.type,
          scene: s,
        }),
      });

      const result = (await res.json()) as { image: string };

      if (result.image) {
        // 🔥 upload immediately
        const blob = await fetch(`data:image/png;base64,${result.image}`).then((r) => r.blob());

        const file = new File([blob], `scene-${sceneIndex}.png`, {
          type: 'image/png',
        });

        const body = new FormData();
        body.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body,
        });

        if (!uploadRes.ok) {
          console.error('Upload failed');

          // fallback: keep base64 so UI still shows something
          setSceneImages((prev) => ({
            ...prev,
            [sceneIndex]: result.image,
          }));

          return;
        }

        const uploadData = await uploadRes.json();

        // ✅ store URL directly (NOT base64 anymore)
        setSceneImages((prev) => ({
          ...prev,
          [sceneIndex]: uploadData.url,
        }));
      }
    } catch (err) {
      console.error('generate-single failed', err);
    } finally {
      setLoadingScenes((prev) => {
        const next = new Set(prev);
        next.delete(sceneIndex);
        return next;
      });
    }
  };

  const generateAll = async () => {
    if (!storyboardData) return;
    setIsGeneratingAll(true);
    setLoadingScenes(new Set(data.scenes.map((_, i) => i)));
    try {
      const res = await fetch('/api/ai/images/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyboardData),
      });
      // response is a flat array: { ...scene, image: string }[]
      const results = (await res.json()) as { sceneNumber: number; image: string }[];
      const newImages: Record<number, string> = {};
      results.forEach(({ sceneNumber, image }) => {
        newImages[sceneNumber - 1] = image; // sceneNumber is 1-based → 0-based index
      });
      setSceneImages(newImages);
    } catch (err) {
      console.error('generate-all failed', err);
    } finally {
      setIsGeneratingAll(false);
      setLoadingScenes(new Set());
    }
  };

  useEffect(() => {
    if (storyboardData?.scenes) {
      setScenes(storyboardData.scenes);
      setActiveScene(0);
    }
  }, [storyboardData]);

  useEffect(() => {
    if (planId) {
      fetchSceneImage();
    }
  }, [planId]);

  const updateScene = (field: keyof Scene, value: string) => {
    setScenes((prev) =>
      prev.map((s, i) => {
        if (i !== activeScene) return s;
        if (field === 'soundEffect') return { ...s, soundEffect: { name: value } };
        return { ...s, [field]: value };
      }),
    );
  };

  if (!storyboardData || scenes.length === 0) return null;

  const data = {
    concept: storyboardData?.concept,
    globalStyle: storyboardData?.globalStyle,
    structure: storyboardData?.structure.type,
    scenes,
  };

  const totalDuration = data.structure === 'video' ? data.scenes[data.scenes.length - 1].endTime : data.scenes.length;
  const scene = data.scenes[activeScene];
  const purposeCfg = PURPOSE_CONFIG[scene.purpose] ?? {
    label: scene.purpose,
    color: '#6B7280',
    bg: 'rgba(107,114,128,0.15)',
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const uploadedImages: Record<number, string> = {};

      // upload only base64 ones
      for (const [indexStr, value] of Object.entries(sceneImages)) {
        const index = Number(indexStr);

        if (!value) continue;

        // already uploaded → keep
        if (value.startsWith('http')) {
          uploadedImages[index] = value;
          continue;
        }

        // convert base64 → file
        const blob = await fetch(`data:image/png;base64,${value}`).then((r) => r.blob());

        const file = new File([blob], `scene-${index}.png`, {
          type: 'image/png',
        });

        const body = new FormData();
        body.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body,
        });

        if (!res.ok) throw new Error(`Upload failed for scene ${index}`);

        const data = await res.json();
        uploadedImages[index] = data.url;
      }

      // 🔥 FINAL OBJECT
      const finalPayload = {
        postId,
        concept: data.concept,
        globalStyle: data.globalStyle,
        structure: data.structure,
        scenes: scenes.map((s, i) => ({
          ...s,
          image: uploadedImages[i] || null,
        })),
      };

      if(!planId) {
        const res = await fetch('/api/ai/planning', {
          method: 'POST',
          body: JSON.stringify(finalPayload)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to save planning');
        }
      } else {
        const res = await fetch('/api/ai/planning', {
          method: 'PATCH',
          body: JSON.stringify({ finalPayload, planId })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to save planning');
        }
      }

      Toastify({
        text: `Storyboard saved successfully!`,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#A7D7A0",
          color: "#2E2E2E",
          borderRadius: "12px", 
          border: "1px solid rgba(46, 111, 64, 0.1)"
        },
      }).showToast();

      fetchIdeas?.();
    } catch (err) {
      console.log('Save all failed:', err);
      Toastify({
        text: `Failed to save storyboard!`,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#FF8A8A",
          color: "#2E2E2E",
          borderRadius: "12px", 
          border: "1px solid rgba(46, 111, 64, 0.1)"
        },
      }).showToast();
    } finally {
      setIsSaving(false);
    }
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
          background: '#F0FDF4',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(34,197,94,0.18)',
        }}>
        <VisuallyHidden>
          <DialogTitle>Storyboard Preview</DialogTitle>
        </VisuallyHidden>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '16px 28px 14px',
            borderBottom: '1px solid rgba(34,197,94,0.2)',
            flexShrink: 0,
          }}>
          {/* ── ROW 1: all badges in one line, wrapping gracefully ───────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px 8px',
              marginBottom: 10,
            }}>
            {/* Label */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4D8A63',
                whiteSpace: 'nowrap',
              }}>
              Storyboard Preview
            </span>

            <span key="dot-1" style={{ color: 'rgba(34,197,94,0.4)', fontSize: 10, lineHeight: 1 }}>
              •
            </span>

            {/* Type + duration */}
            <span
              key="type-duration"
              style={{
                fontSize: 11,
                padding: '2px 9px',
                borderRadius: 20,
                background: 'rgba(56,189,248,0.12)',
                color: '#0369A1',
                border: '1px solid rgba(56,189,248,0.3)',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}>
              {data.structure} · {data.structure === 'video' ? `${totalDuration}s` : `${data.scenes.length} scenes`}
            </span>

            <span key="dot-2" style={{ color: 'rgba(34,197,94,0.4)', fontSize: 10, lineHeight: 1 }}>
              •
            </span>

            {/* Style tags — click to expand/collapse if truncated */}
            {[
              { tag: data?.globalStyle?.visualStyle, key: 'style-visual' },
              { tag: data?.globalStyle?.colorPalette, key: 'style-palette' },
            ].map(({ tag, key }) => {
              const isExpanded = expandedTags.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleTag(key)}
                  title={isExpanded ? 'Click to collapse' : tag}
                  style={{
                    all: 'unset',
                    fontSize: 11,
                    padding: '2px 9px',
                    borderRadius: 20,
                    background: 'rgba(250,204,21,0.15)',
                    border: `1px solid ${isExpanded ? 'rgba(250,204,21,0.75)' : 'rgba(250,204,21,0.4)'}`,
                    color: '#854D0E',
                    fontWeight: 500,
                    cursor: 'pointer',
                    maxWidth: isExpanded ? 'none' : 180,
                    overflow: 'hidden',
                    whiteSpace: isExpanded ? 'normal' : 'nowrap',
                    textOverflow: isExpanded ? 'unset' : 'ellipsis',
                    display: 'inline-block',
                    wordBreak: isExpanded ? 'break-word' : 'normal',
                    transition: 'border-color 0.15s, max-width 0.2s',
                  }}>
                  {tag}
                </button>
              );
            })}
          </div>

          {/* ── ROW 2: Title + Hook (click to expand/collapse) ───────────── */}
          <button
            onClick={() => setHeaderExpanded((prev) => !prev)}
            style={{
              all: 'unset',
              display: 'block',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
            title={headerExpanded ? 'Click to collapse' : 'Click to expand'}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#0C2A1A',
                lineHeight: 1.35,
                margin: 0,
                display: headerExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: headerExpanded ? 'none' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: headerExpanded ? 'visible' : 'hidden',
              }}>
              {data?.concept?.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
              <p
                style={{
                  fontSize: 12,
                  color: '#4D8A63',
                  margin: 0,
                  lineHeight: 1.5,
                  flex: 1,
                  display: headerExpanded ? 'block' : '-webkit-box',
                  WebkitLineClamp: headerExpanded ? 'none' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: headerExpanded ? 'visible' : 'hidden',
                }}>
                {data?.concept?.hook}
              </p>
              {/* subtle expand/collapse indicator */}
              <span
                style={{
                  fontSize: 10,
                  color: '#86BFAA',
                  whiteSpace: 'nowrap',
                  marginTop: 2,
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }}>
                {headerExpanded ? '▲ less' : '▼ more'}
              </span>
            </div>
          </button>

          {/* ── TIMELINE BAR ─────────────────────────────────────────────── */}
          <div style={{ marginTop: 14, display: 'flex', gap: 3, height: 5, borderRadius: 6, overflow: 'hidden' }}>
            {data.scenes.map((s, i) => {
              const cfg = PURPOSE_CONFIG[s.purpose] ?? { color: '#6B7280', bg: '', label: '' };
              const widthPct = s.endTime && totalDuration ? ((s.endTime - (s.startTime || 0)) / totalDuration) * 100 : 0;
              return (
                <button
                  key={`${s.sceneNumber}-${i}`} // <--- make sure key is unique
                  onClick={() => setActiveScene(i)}
                  style={{
                    width: `${widthPct}%`,
                    background: i === activeScene ? cfg.color : 'rgba(0,0,0,0.1)',
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
          {/* Generate All row */}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#4D8A63',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                Scenes
              </span>
              <button
                onClick={generateAll}
                disabled={isGeneratingAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: 20,
                  background: isGeneratingAll ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.12)',
                  border: '1.5px solid rgba(34,197,94,0.35)',
                  color: isGeneratingAll ? '#86BFAA' : '#166534',
                  cursor: isGeneratingAll ? 'not-allowed' : 'pointer',
                  transition: 'all 0.18s',
                }}>
                {isGeneratingAll ?
                  <>
                    <Spinner size={12} color="#86BFAA" /> Generating...
                  </>
                : <>✦ Generate All Images</>}
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 14px',
                borderRadius: 20,
                background: isSaving ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.12)',
                border: '1.5px solid rgba(34,197,94,0.35)',
                color: isSaving ? '#86BFAA' : '#166534',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s',
              }}>
              {isSaving ?
                <>
                  <Spinner size={12} color="#86BFAA" /> Saving...
                </>
              : <>Save</>}
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 14px',
                borderRadius: 20,
                background: isExporting ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.12)',
                border: '1.5px solid rgba(34,197,94,0.35)',
                color: isExporting ? '#86BFAA' : '#166534',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s',
              }}>
              {isExporting ?
                <>
                  <Spinner size={12} color="#86BFAA" /> Exporting...
                </>
              : <>Export</>}
            </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
            {data.scenes.map((s, i) => {
              const cfg = PURPOSE_CONFIG[s.purpose] ?? {
                color: '#6B7280',
                bg: 'rgba(107,114,128,0.15)',
                label: s.purpose,
              };
              const isActive = i === activeScene;
              return (
                <div
                  key={s.sceneNumber || i}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveScene(i)}
                  style={{
                    flex: 1,
                    background: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                    border: `1.5px solid ${isActive ? cfg.color : 'rgba(34,197,94,0.2)'}`,
                    borderRadius: 14,
                    padding: '12px 10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
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

                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: isActive ? cfg.color : '#86BFAA',
                      marginBottom: 6,
                    }}>
                    SCENE {i + 1}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: isActive ? cfg.bg : 'rgba(56,189,248,0.07)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                    {/* Generated image */}
                    {sceneImages[i] ?
                      <img
                        src={
                          sceneImages[i].startsWith('http') ? sceneImages[i] : `data:image/png;base64,${sceneImages[i]}`
                        }
                        alt={`Scene ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                      />
                    : loadingScenes.has(i) ?
                      <Spinner size={20} color={cfg.color} />
                    : <span style={{ fontSize: 20 }}>
                        {s.purpose === 'hook' ?
                          '🎣'
                        : s.purpose === 'build' ?
                          '🔨'
                        : s.purpose === 'payoff' ?
                          '✅'
                        : '📣'}
                      </span>
                    }

                    {/* Timecode */}
                    {s.headline ?
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 6,
                          fontSize: 9,
                          color: sceneImages[i] ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)',
                          fontFamily: 'monospace',
                          zIndex: 1,
                        }}>
                        {s.sceneNumber}
                      </div>
                    : <div
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 6,
                          fontSize: 9,
                          color: sceneImages[i] ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)',
                          fontFamily: 'monospace',
                          zIndex: 1,
                        }}>
                        {s.startTime}s–{s.endTime}s
                      </div>
                    }

                    {/* Generate Single button — bottom-left of preview box */}
                    {!loadingScenes.has(i) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateSingle(i);
                        }}
                        title="Generate image for this scene"
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 5,
                          zIndex: 2,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: sceneImages[i] ? 'rgba(0,0,0,0.55)' : cfg.bg,
                          border: `1px solid ${sceneImages[i] ? 'rgba(255,255,255,0.2)' : cfg.color + '60'}`,
                          color: sceneImages[i] ? 'rgba(255,255,255,0.9)' : cfg.color,
                          cursor: 'pointer',
                          letterSpacing: '0.03em',
                          transition: 'opacity 0.15s',
                        }}>
                        {sceneImages[i] ? '↺ Re-gen' : '✦ Gen'}
                      </button>
                    )}
                  </div>

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
                </div>
              );
            })}
          </div>

          {/* ── DETAIL PANEL ───────────────────────────────────────────── */}
          <div
            style={{
              minHeight: 420,
              background: '#FFFFFF',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
            }}>
            {/* Left — scene description */}
            <div
              style={{
                flex: 1,
                padding: '20px 24px',
                borderRight: '1px solid rgba(34,197,94,0.12)',
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
                    color: '#4D8A63',
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
                  <Tag
                    icon="⏱"
                    label={scene.startTime ? `${scene.startTime}s → ${scene.endTime}s` : `${scene.sceneNumber} Scene`}
                  />
                  <Tag icon="🎭" label={scene.emotion} color={purposeCfg.color} />
                </div>
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
                background: '#F0F9FF',
              }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#0369A1',
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                Production Notes
              </p>

              <DetailRow
                icon="🎥"
                label={scene.camera ? 'Camera' : 'Visual Focus'}
                value={scene.camera ? (scene.camera as string) : (scene.visualFocus as string)}
                onChange={(v) => updateScene(scene.camera ? 'camera' : 'visualFocus', v)}
              />
              <DetailRow
                icon="🎬"
                label={scene.motion ? 'Motion' : 'Text overlay'}
                value={scene.motion ? (scene.motion as string) : (scene.textOverlay as string)}
                onChange={(v) => updateScene(scene.motion ? 'motion' : 'textOverlay', v)}
              />
              <DetailRow icon="💭" label="Emotion" value={scene.emotion} onChange={(v) => updateScene('emotion', v)} />

              {scene.soundEffect ?
                <DetailRow
                  icon="🔊"
                  label="Sound"
                  value={scene.soundEffect.name}
                  onChange={(v) => updateScene('soundEffect', v)}
                />
              : <DetailRow
                  icon="🌟"
                  label="Filter"
                  value={(scene.filter as string) || ''}
                  onChange={(v) => updateScene('filter', v)}
                />
              }

              {/* Audio preview — shown only when a URL is available */}
              {scene.soundEffect && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: '#0369A1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      fontWeight: 600,
                    }}>
                    🎧 Preview
                  </span>
                  <audio
                    controls
                    key={scene.soundEffect.url}
                    style={{
                      width: '100%',
                      height: 32,
                      borderRadius: 8,
                      outline: 'none',
                      accentColor: '#0369A1',
                    }}>
                    <source src={scene.soundEffect.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

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
function Spinner({ size = 16, color = '#4D8A63' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
        background: 'rgba(250,204,21,0.12)',
        border: '1px solid rgba(250,204,21,0.35)',
        color: color ?? '#4D8A63',
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
