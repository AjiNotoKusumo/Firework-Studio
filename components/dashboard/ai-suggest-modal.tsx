'use client';

import { useState } from 'react';
import AIGeneratedModal from '@/components/dashboard/ai-generated-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ReferencePost = {
  summary: string;
  hook: string;
  tone: string;
  style: string;
};

type GeneratePostInput = {
  type: 'video' | 'carousel';
  duration: number | null;
  slides: number | null;
  interest: string[];
  tone: string;
  topic: string;
  platform: 'instagram' | 'twitter';
  referencePosts: ReferencePost[];
};

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

const DEFAULT_REFERENCES: ReferencePost[] = [
  {
    summary: 'fast-paced transformation showing bad vs good habits',
    hook: 'you’re doing this wrong',
    tone: 'energetic, slightly aggressive',
    style: 'bold text + quick cuts',
  },
  {
    summary: 'clean minimal carousel with tips',
    hook: '5 things to fix your morning routine',
    tone: 'calm, informative',
    style: 'soft colors, centered text',
  },
];

const TONE_SUGGESTIONS = ['motivational', 'funny', 'aggressive', 'calm', 'informative', 'emotional'];

export default function GeneratePostModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState<GeneratePostInput>({
    type: 'video',
    duration: 15,
    slides: null,
    interest: [],
    tone: '',
    topic: '',
    platform: 'instagram',
    referencePosts: DEFAULT_REFERENCES,
  });

  const [interestInput, setInterestInput] = useState('');
  const [customDuration, setCustomDuration] = useState<number>(15);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiData, setAiData] = useState<GeneratePostInput | null>(null);

  // ===== handlers =====
  const addInterest = () => {
    if (!interestInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      interest: [...prev.interest, interestInput.trim()],
    }));
    setInterestInput('');
  };

  const removeInterest = (i: number) => {
    setForm((prev) => ({
      ...prev,
      interest: prev.interest.filter((_, idx) => idx !== i),
    }));
  };

  const handleTypeChange = (type: 'video' | 'carousel') => {
    setForm((prev) => ({
      ...prev,
      type,
      duration: type === 'video' ? 15 : null,
      slides: type === 'carousel' ? 5 : null,
    }));
  };

  // ===== UI =====
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Fire Up AI Suggestion 💥</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* TYPE */}
          <div>
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2 mt-1">
              {(['video', 'carousel'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all
                    ${
                      form.type === t ?
                        'bg-primary/10 border-primary text-primary'
                      : 'bg-transparent border-border hover:border-primary/40'
                    }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* DURATION */}
          {form.type === 'video' && (
            <div className="transition-all duration-300">
              <label className="text-sm font-medium">Duration</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {[5, 10, 15].map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm((prev) => ({ ...prev, duration: d }))}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition
                      ${
                        form.duration === d ?
                          'bg-primary/10 border-primary text-primary'
                        : 'border-border hover:border-primary/40'
                      }`}>
                    {d}s
                  </button>
                ))}

                <input
                  type="number"
                  min={0}
                  value={customDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomDuration(val);
                    setForm((prev) => ({ ...prev, duration: val }));
                  }}
                  className="w-20 px-2 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="custom"
                />
              </div>
            </div>
          )}

          {/* SLIDES */}
          {form.type === 'carousel' && (
            <div className="transition-all duration-300">
              <label className="text-sm font-medium">Slides</label>

              <div className="flex gap-2 mt-1 flex-wrap">
                {[5, 10, 15].map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((prev) => ({ ...prev, slides: s }))}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition
            ${
              form.slides === s ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:border-primary/40'
            }`}>
                    {s}
                  </button>
                ))}

                <input
                  type="number"
                  min={0}
                  value={form.slides ?? 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slides: Number(e.target.value),
                    }))
                  }
                  className="w-20 px-2 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="custom"
                />
              </div>
            </div>
          )}

          {/* INTEREST TAGS */}
          <div>
            <label className="text-sm font-medium">Interest</label>

            <div className="flex flex-wrap gap-2 mt-2">
              {form.interest.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeInterest(i)}>×</button>
                </span>
              ))}
            </div>

            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInterest()}
              placeholder="Type and press Enter..."
              className="mt-2 w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* TONE */}
          <div>
            <label className="text-sm font-medium">Tone</label>

            <div className="flex flex-wrap gap-2 mt-2">
              {TONE_SUGGESTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((prev) => ({ ...prev, tone: t }))}
                  className="px-2 py-1 text-xs rounded-full border border-border hover:border-primary/40 transition">
                  {t}
                </button>
              ))}
            </div>

            <input
              value={form.tone}
              onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
              placeholder="Custom tone..."
            />
          </div>

          {/* TOPIC */}
          <div>
            <label className="text-sm font-medium">Topic</label>
            <input
              value={form.topic}
              onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* PLATFORM */}
          <div>
            <label className="text-sm font-medium">Platform</label>
            <div className="flex gap-2 mt-1">
              {(['instagram', 'twitter'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm((prev) => ({ ...prev, platform: p }))}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition
                    ${
                      form.platform === p ?
                        'bg-primary/10 border-primary text-primary'
                      : 'border-border hover:border-primary/40'
                    }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={() => {
              setAiData(form); // pass form into modal
              setAiOpen(true); // open modal
            }}
            className="w-full mt-2 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
            Generate 🔥
          </button>
        </div>
      </DialogContent>
      <AIGeneratedModal open={aiOpen} onOpenChange={setAiOpen} />
    </Dialog>
  );
}
