'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const suggestions: string[] = [
  'Travel',
  'Food',
  'Fitness',
  'Tech',
  'Fashion',
  'Photography',
  'Gaming',
  'Business',
  'Music',
  'Art',
  'Comedy',
  'Education',
  'Health',
  'DIY',
  'Sports',
  'Lifestyle',
  'Anime',
];

type Position = {
  top: string;
  left: string;
};

const positions: Position[] = [
  // LEFT PAGE
  { top: '18%', left: '18%' },
  { top: '32%', left: '12%' },
  { top: '48%', left: '16%' },
  { top: '64%', left: '20%' },
  { top: '78%', left: '15%' },

  // RIGHT PAGE
  { top: '18%', left: '68%' },
  { top: '32%', left: '74%' },
  { top: '48%', left: '70%' },
  { top: '64%', left: '66%' },
  { top: '78%', left: '72%' },

  // CENTER SPINE
  { top: '40%', left: '46%' },
  { top: '55%', left: '50%' },
];

export default function InterestPage() {
  const [input, setInput] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const scribbleColors: string[] = [
    '#FF6B6B', // red
    '#FFD93D', // yellow
    '#6BCB77', // green
    '#4D96FF', // blue
    '#B983FF', // purple
    '#FF9F1C', // orange
  ];

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean || selected.includes(clean)) return;

    setSelected((prev) => [...prev, clean]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    setSelected((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F7] px-6">
      {/* 🔥 Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#A7D7A0]">
          <Image src="/firework.png" alt="FireWork Logo" width={40} height={40} />
        </div>
        <span className="text-3xl font-semibold text-[#2E2E2E]">FireWork</span>
      </div>

      {/* 💬 Title */}
      <h1 className="text-xl font-medium mb-4 text-center">What type of content do you want to create?</h1>

      {/* ✏️ Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input);
          }
        }}
        placeholder="Type your interests and press Enter..."
        className="w-full max-w-xl rounded-xl border border-gray-300 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#A7D7A0]"
      />

      {/* 🏷️ Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-6 max-w-xl">
        {selected.map((tag) => (
          <div key={tag} className="flex items-center gap-2 bg-[#A7D7A0] text-[#2E2E2E] px-3 py-1 rounded-full text-sm">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-xs">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 🧠 Whiteboard */}
      <div className="relative w-full max-w-xl h-72 bg-white border rounded-2xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] p-4">
        <div className="absolute inset-0 opacity-20 text-[10px] leading-3 p-4 pointer-events-none select-none">
          {Array.from({ length: 60 }).map((_, i) => {
            const color = scribbleColors[i % scribbleColors.length];

            return (
              <span key={i} style={{ color }} className="mr-2 inline-block rotate-[-8deg]">
                #viral #trend #ideas #content
              </span>
            );
          })}
        </div>
        {/* 📒 Post-it Notes */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-16 bg-yellow-100 shadow-sm rotate-[-6deg]"
            style={{
              top: `${10 + i * 15}%`,
              left: `${i % 2 === 0 ? 2 : 85}%`,
            }}
          />
        ))}
        {/* 🧠 Grid Floating Tags */}
        <div className="relative z-10 flex flex-wrap gap-3 justify-center items-center h-full">
          {suggestions.map((tag, i) => (
            <motion.button
              key={tag}
              onClick={() => addTag(tag)}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-[#A7D7A0] transition shadow-sm"
              animate={{
                y: [0, -4, 0, 4, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.15,
              }}>
              {tag}
            </motion.button>
          ))}
        </div>
      </div>
      <div>
        <button className="mt-6 bg-[#A7D7A0] text-[#2E2E2E] px-6 py-3 rounded-full font-medium hover:bg-[#8BC98B] transition-colors hover:scale-110">
          Continue
        </button>
      </div>
    </div>
  );
}
