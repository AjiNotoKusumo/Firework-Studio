'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Sparkles, BarChart3, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const showcaseImages = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    title: 'Mountain Analytics',
    category: 'Trending',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    title: 'Forest Engagement',
    category: 'Growing',
  },
  {
    src: 'https://gdb.voanews.com/01000000-0aff-0242-4528-08dc018b3acd_cx0_cy10_cw0_w1080_h608.jpg',
    title: 'Ocean Metrics',
    category: 'Viral',
  },
  {
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop',
    title: 'Meadow Insights',
    category: 'Trending',
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    title: 'Valley Growth',
    category: 'Rising',
  },
  {
    src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&h=400&fit=crop',
    title: 'Peak Performance',
    category: 'Hot',
  },
];

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Metrics',
    description: 'Track followers, engagement, and impressions across all platforms instantly.',
  },
  {
    icon: TrendingUp,
    title: 'Trending Discovery',
    description: 'Find and save viral content before it peaks with our AI-powered detection.',
  },
  {
    icon: Calendar,
    title: 'Content Planning',
    description: 'Schedule posts and plan your content calendar for maximum impact.',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Get personalized tips to grow your audience and boost engagement.',
  },
];

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<(typeof showcaseImages)[0] | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#A7D7A0]">
              <Image src="/firework.png" alt="FireWork Logo" width={30} height={30} className="object-contain" />
            </div>
            <span className="text-xl font-semibold text-foreground">FireWork</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/metrics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link
              href="/register"
              className="rounded-[16px] bg-[#A7D7A0] px-5 py-2.5 text-sm font-medium text-[#2E2E2E] hover:bg-[#8BC98B] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#CFEFFF]/30 via-background to-background" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
              Grow Your Social Presence <span className="text-[#4CAF50]">Naturally</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Track trends, discover viral content, and plan your posts with a dashboard designed to help your social
              media flourish like nature itself.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/dashboard/metrics"
                className="group inline-flex items-center gap-2 rounded-[16px] bg-[#A7D7A0] px-6 py-3 text-base font-medium text-[#2E2E2E] hover:bg-[#8BC98B] transition-all">
                Start Growing
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard/trending"
                className="inline-flex items-center gap-2 rounded-[16px] border border-border bg-card px-6 py-3 text-base font-medium text-foreground hover:bg-[#E8F5E9] transition-colors">
                Explore Trends
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background via-[#CFEFFF]/20 to-background">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Discover Trending Content</h2>
            <p className="mt-3 text-muted-foreground">See what&apos;s blooming across social media</p>
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
                  className="relative flex-shrink-0 w-80 aspect-[3/2] rounded-[20px] overflow-hidden cursor-pointer snap-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <Image src={image.src} alt={image.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block rounded-full bg-[#FFD54F] px-3 py-1 text-xs font-medium text-[#2E2E2E] mb-2">
                      {image.category}
                    </span>
                    <p className="text-white font-medium">{image.title}</p>
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
                className="relative aspect-square rounded-[20px] overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="inline-block rounded-full bg-[#A7D7A0] px-3 py-1 text-xs font-medium text-[#2E2E2E]">
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
            <h2 className="text-3xl font-bold text-foreground">Everything You Need to Grow</h2>
            <p className="mt-3 text-muted-foreground">Powerful tools designed for natural social growth</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="rounded-[16px] bg-[#E8F5E9] p-3 w-fit">
                  <feature.icon className="h-6 w-6 text-[#4CAF50]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
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
            className="rounded-[24px] bg-gradient-to-r from-[#A7D7A0] via-[#CFEFFF] to-[#A7D7A0] p-12 text-center">
            <h2 className="text-3xl font-bold text-[#2E2E2E]">Ready to Bloom?</h2>
            <p className="mt-4 text-[#2E2E2E]/80 max-w-lg mx-auto">
              Join thousands of creators who are growing their audience naturally with FireWork.
            </p>
            <Link
              href="/dashboard/metrics"
              className="mt-8 inline-flex items-center gap-2 rounded-[16px] bg-[#2E2E2E] px-8 py-4 text-base font-medium text-white hover:bg-[#1E1E1E] transition-colors">
              Get Started Free
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full aspect-video rounded-[24px] overflow-hidden">
            <Image src={selectedImage.src} alt={selectedImage.title} fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <span className="inline-block rounded-full bg-[#FFD54F] px-4 py-1.5 text-sm font-medium text-[#2E2E2E] mb-3">
                {selectedImage.category}
              </span>
              <h3 className="text-2xl font-bold text-white">{selectedImage.title}</h3>
              <p className="mt-2 text-white/80">Click anywhere to close</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
