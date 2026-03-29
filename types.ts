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