'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import { useState } from 'react';

export default function StoryboardPreviewModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = {
    concept: {
      title: 'Stop Ruining Your Morning Hydration',
      hook: 'Stop drinking water like this in the morning.',
    },
    globalStyle: {
      visualStyle: 'Modern, clean, high-contrast fitness aesthetic',
      colorPalette: 'Electric blue, white, dark charcoal',
    },
    structure: {
      type: 'video',
    },
    scenes: [
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
        description: 'Pouring lemon water. MISTAKE #1 text',
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
        description: 'Adding electrolytes. MISTAKE #2',
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
        description: 'Drinks water, looks refreshed',
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
        description: 'READ CAPTION text, smiling',
        startTime: 12,
        endTime: 15,
        camera: 'Medium shot',
        motion: 'Static',
        emotion: 'Empowering',
        soundEffect: { name: 'Champions' },
      },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-none h-[92vh] p-0 overflow-hidden flex flex-col rounded-2xl border bg-background">
        {/* HEADER */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{data.concept.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{data.concept.hook}</p>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* GLOBAL STYLE */}
          <div className="flex gap-3 text-sm">
            <div className="px-2 py-1 rounded-md border bg-muted/40">{data.globalStyle.visualStyle}</div>
            <div className="px-2 py-1 rounded-md border bg-muted/40">{data.globalStyle.colorPalette}</div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.scenes.map((scene, i) => (
              <SceneCard key={scene.id} scene={scene} index={i} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SceneCard({ scene, index }: { scene: any; index: number }) {
  const [open, setOpen] = useState<'details' | null>(null);

  return (
    <div className="group border rounded-xl bg-card overflow-hidden text-sm">
      {/* PREVIEW */}
      <div className="relative aspect-video bg-muted">
        {/* index */}
        <div className="absolute top-1.5 left-1.5 text-xs px-1.5 py-0.5 rounded bg-black/70 text-white">
          {index + 1}
        </div>

        {/* purpose */}
        <div className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded bg-primary text-white capitalize">
          {scene.purpose}
        </div>

        {/* subtle hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-white/5" />
      </div>

      {/* META */}
      <div className="px-2 py-1.5 border-t space-y-0.5">
        <p className="font-medium truncate">{scene.description}</p>

        <p className="text-xs text-muted-foreground">
          {scene.startTime}s → {scene.endTime}s
        </p>
      </div>

      {/* EXPAND SECTION */}
      <div className="border-t">
        {/* header */}
        <div
          onClick={() => setOpen(open === 'details' ? null : 'details')}
          className="flex items-center justify-between px-2 py-1 cursor-pointer">
          <span className="uppercase text-xs font-semibold text-muted-foreground">Details</span>

          <span className={`transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}>▼</span>
        </div>

        {/* animated content */}
        <div
          className="grid transition-all duration-300"
          style={{
            gridTemplateRows: open ? '1fr' : '0fr',
          }}>
          <div className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1 text-xs text-muted-foreground">
              <p>🎥 {scene.camera}</p>
              <p>🎬 {scene.motion}</p>
              <p>💭 {scene.emotion}</p>
              <p>🔊 {scene.soundEffect.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
