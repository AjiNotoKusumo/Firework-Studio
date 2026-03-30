export interface Post {
  id: string;
  images: string[];
  media?: any[];
  caption: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  publishedDate?: string;
  platform: 'instagram' | 'twitter' ;
  postType?: 'video' | 'carousel';
  strategy?: string;
  autoPost: boolean;
  hashtags?: string[];
  shareToPlatforms: string[];
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    reach: number;
    engagement: number;
  };
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
}

// Mock data store - in a real app this would be a database
export const mockPosts: Post[] = [
  {
    id: '1',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop'],
    caption:
      'Morning mountain adventures - nothing beats watching the sunrise from the peak. The crisp air, the golden light, and that feeling of accomplishment. #mountains #sunrise #adventure #nature',
    status: 'published',
    publishedDate: '2026-03-20',
    platform: 'instagram',
    strategy: 'engagement',
    autoPost: true,
    shareToPlatforms: ['facebook'],
    metrics: {
      likes: 24500,
      comments: 1820,
      shares: 3200,
      views: 156000,
      reach: 89000,
      engagement: 8.2,
    },
    author: {
      name: 'FireWork',
      handle: '@firework',
      avatar: '',
    },
  },
  {
    id: '2',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop',
    ],
    caption:
      'Forest bathing series - part 1 of my mindfulness journey through nature. Taking time to breathe, to listen, and to simply be present.',
    status: 'draft',
    platform: 'instagram',
    autoPost: false,
    shareToPlatforms: [],
    author: {
      name: 'FireWork',
      handle: '@firework',
      avatar: '',
    },
  },
  {
    id: '3',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop'],
    caption:
      'Coastal therapy: where the waves meet your worries and wash them away. Nothing like the sound of the ocean to reset your mind.',
    status: 'scheduled',
    scheduledAt: '2026-04-02',
    platform: 'instagram',
    strategy: 'growth',
    autoPost: true,
    shareToPlatforms: ['twitter'],
    author: {
      name: 'FireWork',
      handle: '@firework',
      avatar: '',
    },
  },
  {
    id: '4',
    images: ['https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop'],
    caption:
      "Golden hour in the meadows - nature's perfect lighting for content creation. This is why I wake up early.",
    status: 'scheduled',
    scheduledAt: '2026-03-28',
    platform: 'twitter',
    strategy: 'awareness',
    autoPost: true,
    shareToPlatforms: [],
    author: {
      name: 'FireWork',
      handle: '@firework',
      avatar: '',
    },
  },
  {
    id: '5',
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop'],
    caption: 'Valley views that take your breath away - hiking is worth every step when this is your reward.',
    status: 'published',
    publishedDate: '2026-03-15',
    platform: 'instagram',
    strategy: 'engagement',
    autoPost: true,
    shareToPlatforms: ['facebook', 'twitter'],
    metrics: {
      likes: 31200,
      comments: 2340,
      shares: 4500,
      views: 210000,
      reach: 125000,
      engagement: 9.1,
    },
    author: {
      name: 'FireWork',
      handle: '@firework',
      avatar: '',
    },
  },
  {
    id: '6',
    images: ['https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop'],
    caption: 'Peak performance starts with peak views - morning motivation from the top of the world.',
    status: 'draft',
    platform: 'twitter',
    autoPost: false,
    shareToPlatforms: [],
    author: {
      name: 'FireWork',
      handle: '@firework',
      avatar: '',
    },
  },
];

export const sampleImages = [
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop',
];

