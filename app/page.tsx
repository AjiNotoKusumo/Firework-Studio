'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Sparkles, BarChart3, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const showcaseImages = [
  {
    src: 'https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2175118971.jpg?c=16x9&q=w_1479,c_fill',
    title: 'Mountain Analytics',
    category: 'Trending',
  },
  {
    src: 'https://static.republika.co.id/uploads/images/xlarge/_260316161441-143.png',
    title: 'Forest Engagement',
    category: 'Growing',
  },
  {
    src: 'https://www.mamp.one/wp-content/uploads/2024/09/image-resources2.jpg',
    title: 'Ocean Metrics',
    category: 'Viral',
  },
  {
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop',
    title: 'Meadow Insights',
    category: 'Trending',
  },
  {
    src: 'https://images.unsplash.com/photo-1563067601-bce458d55850?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Valley Growth',
    category: 'Rising',
  },
  {
    src: 'https://images.pexels.com/photos/220118/pexels-photo-220118.jpeg?_gl=1*h6xfc*_ga*MTcxMDQzNTQxMi4xNzc1MDIwNDE0*_ga_8JE65Q40S6*czE3NzUwMjA0MTMkbzEkZzEkdDE3NzUwMjA0MjYkajQ3JGwwJGgw',
    title: 'Peak Performance',
    category: 'Hot',
  },
];

const features = [
  {
    icon: BarChart3,
    title: 'Live Launch Metrics',
    description: 'Watch your followers, engagement, and impressions ignite across all platforms in real time.',
  },
  {
    icon: TrendingUp,
    title: 'Spark Detection',
    description: 'Catch viral content before it explodes — our AI spots the spark before the burst.',
  },
  {
    icon: Calendar,
    title: 'Launch Scheduler',
    description: 'Time your posts for maximum detonation — plan every shot in your content calendar.',
  },
  {
    icon: Sparkles,
    title: 'Glow-Up Tips',
    description: 'Get personalized ignition tips to amplify your reach and light up your audience.',
  },
];

// Glow color per category badge
const categoryGlow: Record<string, string> = {
  Trending: 'shadow-[0_0_12px_2px_rgba(251,191,36,0.55)]',
  Growing: 'shadow-[0_0_12px_2px_rgba(52,211,153,0.55)]',
  Viral: 'shadow-[0_0_12px_2px_rgba(244,114,182,0.55)]',
  Rising: 'shadow-[0_0_12px_2px_rgba(125,211,252,0.55)]',
  Hot: 'shadow-[0_0_12px_2px_rgba(251,191,36,0.55)]',
};

const categoryBg: Record<string, string> = {
  Trending: 'bg-yellow-200 text-yellow-800',
  Growing: 'bg-emerald-200 text-emerald-800',
  Viral: 'bg-pink-200 text-pink-800',
  Rising: 'bg-sky-200 text-sky-800',
  Hot: 'bg-orange-200 text-orange-800',
};

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<(typeof showcaseImages)[0] | null>(null);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Subtle burst pattern background */}
      <style>{`
        @keyframes softPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        .glow-btn {
          box-shadow: 0 0 16px 3px rgba(251,191,36,0.45), 0 2px 8px rgba(0,0,0,0.08);
          transition: box-shadow 0.25s ease, transform 0.2s ease;
        }
        .glow-btn:hover {
          box-shadow: 0 0 28px 6px rgba(251,191,36,0.65), 0 4px 16px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .glow-btn-pink {
          box-shadow: 0 0 16px 3px rgba(244,114,182,0.35), 0 2px 8px rgba(0,0,0,0.06);
          transition: box-shadow 0.25s ease, transform 0.2s ease;
        }
        .glow-btn-pink:hover {
          box-shadow: 0 0 28px 6px rgba(244,114,182,0.55), 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .glow-card:hover {
          box-shadow: 0 0 24px 4px rgba(125,211,252,0.3), 0 8px 24px rgba(0,0,0,0.08);
        }
        .glow-image:hover {
          box-shadow: 0 0 20px 4px rgba(244,114,182,0.3), 0 8px 20px rgba(0,0,0,0.12);
        }
        .burst-dot {
          animation: softPulse 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative blurred color orbs behind everything */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[380px] h-[380px] rounded-full bg-pink-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[340px] h-[340px] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute top-2/3 left-10 w-[260px] h-[260px] rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-100">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-gradient-to-br from-yellow-300 to-pink-300 shadow-[0_0_12px_2px_rgba(251,191,36,0.4)]">
              <Image src="/firework.png" alt="FireWork Logo" width={30} height={30} className="object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-sky-500 bg-clip-text text-transparent">
              FireWork
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/metrics"
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Features
            </Link>
            <Link
              href="/register"
              className="glow-btn rounded-[16px] bg-gradient-to-r from-yellow-400 to-yellow-300 px-5 py-2.5 text-sm font-semibold text-yellow-900 transition-colors">
              Launch Free 🎆
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/60 via-white to-white" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto">
            {/* Eyebrow label */}
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 mb-6 text-sm font-semibold text-pink-600 shadow-[0_0_12px_2px_rgba(244,114,182,0.25)]">
              <span className="burst-dot inline-block w-2 h-2 rounded-full bg-pink-400" />
              Social analytics that actually spark
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance text-slate-800">
              Ignite Your Social{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                Presence
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto text-pretty">
              Track sparks, discover viral explosions, and schedule every launch — a dashboard designed to send your
              social media rocketing like a firework at full altitude.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/dashboard/metrics"
                className="glow-btn group inline-flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-yellow-400 to-yellow-300 px-6 py-3 text-base font-semibold text-yellow-900 transition-all">
                🚀 Light the Fuse
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard/trending"
                className="glow-btn-pink inline-flex items-center gap-2 rounded-[16px] border border-pink-200 bg-white px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-pink-50">
                ✨ See What&apos;s Bursting
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-sky-50/40 to-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">
              Discover What&apos;s{' '}
              <span className="bg-gradient-to-r from-pink-400 to-sky-400 bg-clip-text text-transparent">Exploding</span>{' '}
              Right Now
            </h2>
            <p className="mt-3 text-slate-500">Catch the spark before it becomes a burst</p>
          </motion.div>

          {/* Carousel */}
          <div className="relative mb-12">
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
              {showcaseImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedImage(image)}
                  className="glow-image relative flex-shrink-0 w-80 aspect-[3/2] rounded-[20px] overflow-hidden cursor-pointer snap-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                  <Image src={image.src} alt={image.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold mb-2 ${categoryBg[image.category] ?? 'bg-yellow-200 text-yellow-800'} ${categoryGlow[image.category] ?? ''}`}>
                      {image.category}
                    </span>
                    <p className="text-white font-medium drop-shadow">{image.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {showcaseImages.map((image, index) => (
              <motion.div
                key={`grid-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedImage(image)}
                className="glow-image relative aspect-square rounded-[20px] overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryBg[image.category] ?? 'bg-yellow-200 text-yellow-800'}`}>
                    {image.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Detonate
              </span>
            </h2>
            <p className="mt-3 text-slate-500">A full arsenal built to make your content go boom</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const glowColors = [
                'hover:shadow-[0_0_20px_4px_rgba(251,191,36,0.3),0_8px_24px_rgba(0,0,0,0.08)]',
                'hover:shadow-[0_0_20px_4px_rgba(52,211,153,0.3),0_8px_24px_rgba(0,0,0,0.08)]',
                'hover:shadow-[0_0_20px_4px_rgba(125,211,252,0.3),0_8px_24px_rgba(0,0,0,0.08)]',
                'hover:shadow-[0_0_20px_4px_rgba(244,114,182,0.3),0_8px_24px_rgba(0,0,0,0.08)]',
              ];
              const iconBgs = ['bg-yellow-100', 'bg-emerald-100', 'bg-sky-100', 'bg-pink-100'];
              const iconColors = ['text-yellow-500', 'text-emerald-500', 'text-sky-500', 'text-pink-500'];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`glow-card rounded-[20px] bg-white border border-slate-100 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow duration-300 ${glowColors[index]}`}>
                  <div className={`rounded-[16px] ${iconBgs[index]} p-3 w-fit`}>
                    <feature.icon className={`h-6 w-6 ${iconColors[index]}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-800">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[24px] bg-gradient-to-r from-yellow-200 via-pink-100 to-sky-200 p-12 text-center shadow-[0_0_40px_8px_rgba(251,191,36,0.2),0_0_40px_8px_rgba(244,114,182,0.15)]">
            {/* Decorative sparks */}
            <div aria-hidden className="flex justify-center gap-3 mb-4 text-2xl">
              <span className="burst-dot" style={{ animationDelay: '0s' }}>
                ✦
              </span>
              <span className="burst-dot" style={{ animationDelay: '0.4s' }}>
                🎆
              </span>
              <span className="burst-dot" style={{ animationDelay: '0.8s' }}>
                ✦
              </span>
            </div>

            <h2 className="text-3xl font-bold text-slate-800">Ready to Launch?</h2>
            <p className="mt-4 text-slate-600 max-w-lg mx-auto">
              Join thousands of creators who&apos;ve ignited their audience with FireWork — the dashboard that keeps the
              sky lit.
            </p>
            <Link
              href="/dashboard/metrics"
              className="glow-btn mt-8 inline-flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-yellow-400 to-pink-400 px-8 py-4 text-base font-bold text-white transition-colors">
              🚀 Fire It Up — It&apos;s Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full aspect-video rounded-[24px] overflow-hidden shadow-[0_0_60px_8px_rgba(251,191,36,0.25),0_0_60px_8px_rgba(244,114,182,0.2)]">
            <Image src={selectedImage.src} alt={selectedImage.title} fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <span
                className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold mb-3 ${categoryBg[selectedImage.category] ?? 'bg-yellow-200 text-yellow-800'} ${categoryGlow[selectedImage.category] ?? ''}`}>
                {selectedImage.category}
              </span>
              <h3 className="text-2xl font-bold text-white">{selectedImage.title}</h3>
              <p className="mt-2 text-white/70">Click anywhere to close</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
