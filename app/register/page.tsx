'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const sideImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
  'https://gdb.voanews.com/01000000-0aff-0242-4528-08dc018b3acd_cx0_cy10_cw0_w1080_h608.jpg',
  'https://media.licdn.com/dms/image/sync/v2/D4E27AQHKxS5Tx4BdkQ/articleshare-shrink_800/articleshare-shrink_800/0/1725261177469?e=2147483647&v=beta&t=CU3j-cuxXRPf5CiH6yL5pu07AIUh1SraJ24b-ofc4Z0',
  'https://www.lombokjourney.com/wp-content/uploads/2024/11/danau-biru-lombok-tengah.jpeg',
  'https://cdn.wionews.com/sites/default/files/2022/12/20/319667-viral-lionel-messi-posts-pictures-sleeping-with-fifa-world-cup-trophy.jpg',
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-6">
      {/* 🌌 Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#CFEFFF]/30 via-background to-background" />

      {/* 🎆 Firework glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-40 h-40 rounded-full bg-[#A7D7A0]/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-52 h-52 rounded-full bg-[#CFEFFF]/40 blur-3xl"
        />
      </div>

      {/* 🖼️ Floating Image Strip */}
      <div className="hidden lg:flex absolute inset-y-0 left-0 w-1/3 items-center overflow-hidden">
        <motion.div
          animate={{ y: ['0%', '-100%'] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col">
          {[...sideImages, ...sideImages].map((src, i) => (
            <div
              key={i}
              className="relative w-72 h-48 mb-6 last:mb-0 rounded-[20px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
              <Image src={src} alt="preview" fill className="object-cover" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* 🖼️ Right side strip */}
      <div className="hidden lg:flex absolute inset-y-0 right-0 w-1/3 items-center overflow-hidden justify-end">
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col">
          {[...sideImages, ...sideImages].map((src, i) => (
            <div
              key={i}
              className="relative w-72 h-48 mb-6 last:mb-0 rounded-[20px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
              <Image src={src} alt="preview" fill className="object-cover" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* 🌿 Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-[16px] bg-[#A7D7A0]">
            <Image src="/firework.png" alt="FireWork Logo" width={60} height={60} />
          </div>
          <span className="text-5xl font-semibold text-foreground">FireWork</span>
        </div>

        {/* Card */}
        <div className="rounded-[24px] bg-card p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-border backdrop-blur-md">
          <h1 className="text-2xl font-bold text-foreground text-center">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center mt-2">Start growing your social presence</p>

          <form className="mt-6 space-y-4">
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="w-full rounded-[12px] border border-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#A7D7A0] outline-none"
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              onChange={handleChange}
              className="w-full rounded-[12px] border border-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#A7D7A0] outline-none"
            />
            <input
              name="password"
              placeholder="Password"
              type="password"
              onChange={handleChange}
              className="w-full rounded-[12px] border border-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#A7D7A0] outline-none"
            />

            <button className="w-full mt-2 flex items-center justify-center gap-2 rounded-[16px] bg-[#A7D7A0] px-6 py-3 text-sm font-medium text-[#2E2E2E] hover:bg-[#8BC98B] transition-all hover:scale-110">
              Register
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4CAF50] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
