export type ConceptPromptType = {
  type: string,
  duration: number | null,
  slides: number | null,
  interest: string[],
  tone: string,
  topic: string,
  platform: "instagram" | "twitter",
  referencePosts: string[]
}

export interface TrendingPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'trending' | 'growing' | 'stable';
  platform: 'instagram' | 'twitter';
  author: {
    name: string;
    avatar?: string;
  };
  url: string;
}