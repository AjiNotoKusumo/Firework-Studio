import { ConceptPromptType } from '@/types';
import { GoogleGenAI } from '@google/genai';
import PostModel from './models/PostModel';
import pLimit from 'p-limit';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function genereateConcepts(conceptPrompt: ConceptPromptType) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: `
                You are an expert short-form content strategist and storyboard creator.

                Your task is to generate a structured storyboard plan for social media content based on the given user input.

                ---

                ## INPUT

                You will receive the following JSON:

                {
                    "type": "video | carousel",
                    "duration": number, 
                    "slides": number, 
                    "interest": string[],
                    "tone": string,
                    "topic": string,
                    "platform": "instagram | twitter",
                    "referencePosts": string[] 
                }

                Notes:
                - If type = "video", use duration (in seconds)
                - If type = "carousel", use slides (number of images)
                - "referencePosts" are examples of trending content for inspiration (style, pacing, hooks)

                ---

                ## TASK

                Generate:

                1. A strong creative concept
                2. A consistent global visual style (VERY IMPORTANT)
                3. A time-based or slide-based storyboard
                4. Scene-level descriptions that are visually clear and usable for image generation later

                ---

                ## OUTPUT FORMAT (STRICT JSON, NO EXTRA TEXT)

                Return ONLY valid JSON in this exact structure:

                {
                    "concept": {
                        "title": string,
                        "styleDirection": string,
                        "hook": string,
                        "keyMessage": string
                    },
                    "globalStyle": {
                        "visualStyle": string,
                        "colorPalette": string,
                        "lighting": string,
                        "cameraStyle": string,
                        "characterConsistency": string,
                        "environmentConsistency": string
                    },
                    "structure": {
                        "type": "video | carousel",
                        "totalDuration": number,
                        "totalScenes": number
                    },
                    "scenes": [
                        {
                            "sceneNumber": number,
                            "purpose": "hook | build | payoff | call_to_action",
                            "description": string,
                            "emotion": string,

                            /* VIDEO ONLY */
                            "startTime": number,
                            "endTime": number,
                            "duration": number,
                            "camera": string,
                            "motion": string,
                            "soundEffect": string | null

                            /* CAROUSEL ONLY */
                            "headline": "string | null",
                            "textOverlay": "string | null",
                            "visualFocus": "string | null",
                            "filter": "string | null"
                        }
                    ]
                }

                If type = "carousel", you MUST use "slides" as totalScenes and ignore duration completely.
                ---

                ## RULES

                General (applies to both):
                - Maintain STRICT visual consistency using globalStyle
                - Descriptions must be clear, visual, and concise (1–2 sentences max)
                - Do NOT include camera jargon that is too technical
                - Do NOT generate image prompts yet (only scene descriptions)
                - Hook must be strong and appear in the first scene
                - Last scene should include a call to action if appropriate
                - for character consistency, include VERY specific details about appearance (hair, face, body type), outfit, and gender that should be consistent across scenes. Avoid vague descriptions.
                - for character and environment consistency, if the concept does not include people or specific settings, you can set them to "N/A" but give explanations as to why in the caracterConsistency and environmentConsistency fields in globalStyle

                Video-specific rules (ONLY if type = "video"):
                - Keep each scene between 2–5 seconds (for video)
                - Ensure smooth logical flow between scenes
                - totalDuration must match sum of all scene durations
                - Include: startTime, endTime, duration
                - Include natural camera + motion (not overly technical)
                - sound effect should match the vibe of the scene if you cant find a sound effect to use give null

                Carousel-specific rules (ONLY if type = "carousel"):
                - totalDuration must be null
                - Each scene represents one slide
                - Do NOT include timing fields (set them to null)
                - Each scene MUST include:
                    - headline → short, attention-grabbing text
                    - textOverlay → supporting text (1 short sentence max)
                    - visualFocus → what the image should emphasize
                - Slides must flow logically like a story:
                    - Slide 1 = hook
                    - Middle slides = build/value
                    - Final slide = payoff or call to action
                - Keep text punchy and optimized for social media (Instagram/Twitter)
                ---

                ## IMPORTANT

                - Output MUST be valid JSON
                - Do NOT include markdown
                - Do NOT include explanations
                - Do NOT include comments

                ---
                ## USER INPUT

                Down here is the user input JSON you will use to generate the storyboard. Use it to create a unique and engaging content plan that would perform well on the specified platform and interest area.

                userInput: ${JSON.stringify(conceptPrompt)}
            `,
  });

  const clearResponse: string = response?.text?.replace(/```json/g, '').replace(/```/g, '') || '';

  const parseResponse = JSON.parse(clearResponse);

  if (parseResponse.structure.type === 'video') {
    for (const scene of parseResponse.scenes) {
      const sounds: any[] = await PostModel.findBestSounds(scene);
      const bestSound = await pickSoundEffect(scene, sounds);

      scene.soundEffect = bestSound;
    }
  }

  return parseResponse;
}

export async function embed(text: string) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2-preview',
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error('Embedding generation failed');
  }

  return result.embeddings[0].values;
}

export async function pickSoundEffect(scene: any, soundOptions: any[]) {
  const prompt = `
        You are selecting the BEST sound effect for a scene.

        Scene:
        - Description: ${scene.description}
        - Emotion: ${scene.emotion}
        - Purpose: ${scene.purpose}

        Sound Options:
        ${soundOptions
          .map(
            (s, i) => `
        ${i + 1}. ${s.name}
        Description: ${s.description}
        Category: ${s.category}
        `,
          )
          .join('\n')}

        Return ONLY the number of the best sound.
    `;

  const result = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: prompt,
  });

  if (!result.text) {
    throw new Error('Failed to generate sound effect choice');
  }

  const text = result.text.trim();
  const index = parseInt(text) - 1;

  return soundOptions[index];
}

export async function generateImage(prompt: string) {
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }], // Your structured prompt from before
      },
    ],
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: '4:3',
      },
    },
  });

  if (!result.candidates?.[0]?.content?.parts) {
    throw new Error('Image generation failed');
  }

  const base64 = result.candidates[0].content.parts.find((part) => part.inlineData)?.inlineData?.data;

  if (!base64) {
    throw new Error('No image data found in response');
  }

  return base64;
}

function videoPrompt(scene: any, globalStyle: any, concept: any) {
  return `
        A storyboard-style sketch representing a cinematic moment from a short-form video.

        This is frame ${scene.sceneNumber} in a continuous sequence.

        The scene shows ${scene.description}. The moment should clearly convey 
        a ${scene.purpose} moment with a strong sense of ${scene.emotion}.

        CONCEPT INTENT:
        The image should visually communicate that ${concept.keyMessage}.
        It should evoke the feeling of: ${concept.hook}, expressed through the situation and composition (not text).

        STYLE & DESIGN:
        Drawn in a ${globalStyle.visualStyle} approach, translated into a loose storyboard sketch 
        with clean, minimal line work, strong contrast, and clear visual hierarchy.

        COLOR & LIGHTING:
        Use a limited color sketch style inspired by ${globalStyle.colorPalette}, 
        with subtle color accents (not fully rendered). 
        Lighting reflects ${globalStyle.lighting}, suggested through simple highlights 
        and high-contrast shading.

        CAMERA & CINEMATIC FEEL:
        Perspective follows ${globalStyle.cameraStyle}. 
        Shot type: ${scene.camera}. 
        The framing should feel dynamic and slightly imperfect, like a handheld camera.

        MOTION:
        Imply motion through ${scene.motion}, using dynamic composition, 
        exaggerated perspective, or motion lines where appropriate.

        CONSISTENCY:
        Maintain consistent visual language across frames:
        - Character: ${globalStyle.characterConsistency}
        - Environment: ${globalStyle.environmentConsistency}
        - Keep proportions, outfit, and setting consistent

        COMPOSITION:
        - Strong focal point on the main subject
        - Tight framing for intensity
        - Clear subject-background separation
        - Clean and uncluttered layout

        SKETCH STYLE:
        Loose, hand-drawn storyboard style with slightly rough, imperfect lines. 
        Minimal detail, no polished rendering. Focus on clarity and storytelling.

        IMPORTANT:
        - No text or typography
        - No watermark
        - No overly complex background
        - No distortion or anatomical errors
        - Keep it visually simple and readable
    `;
}

function carouselPrompt(scene: any, globalStyle: any, concept: any) {
  return `
        A storyboard-style sketch illustrating ${scene.description}, 
        capturing a clear moment in a visual sequence.

        This is frame ${scene.sceneNumber} in a storyboard sequence.

        The scene purpose serve a purpose of being the ${scene.purpose} of the sequence, conveying a ${scene.emotion} tone, 
        focusing on ${scene.visualFocus}. The composition should be visually clear, 
        attention-grabbing, and easy to understand at a glance.

        CONCEPT INTENT:
        The image should visually communicate that ${concept.keyMessage}.
        It should evoke the feeling of: ${concept.hook}, expressed through the situation and composition (not text).

        STYLE & DESIGN:
        Drawn in a ${globalStyle.visualStyle} approach, translated into sketch form 
        with clean line work, minimal details, and strong visual clarity.

        COLOR & LIGHTING:
        Use a limited color sketch style inspired by ${globalStyle.colorPalette}, 
        with subtle color accents or light washes (not fully rendered). 
        Lighting should reflect ${globalStyle.lighting}, suggested through soft shading 
        and simple highlights rather than realism.

        CAMERA & COMPOSITION:
        Perspective follows ${globalStyle.cameraStyle}, with a clear focal point 
        and balanced layout. Maintain a simple, uncluttered composition.

        CONSISTENCY:
        Maintain consistent visual language across frames:
        - Environment: ${globalStyle.environmentConsistency}
        - The character must match this exact description: ${globalStyle.characterConsistency}
        - Do not alter hairstyle, outfit, or physical features.
        - Keep objects, proportions, and layout visually consistent

        SKETCH STYLE:
        Loose, hand-drawn storyboard look with slightly imperfect lines, 
        like a film or animation planning sketch. Minimal shading, no fine detail rendering.

        IMPORTANT:
        - No text or typography in the image
        - No watermark
        - No overly complex background
        - Keep it clean, simple, and visually readable
    `;
}

export async function generateSingleImage(scene: any, globalStyle: any, structure: string, concept: any) {
  let prompt = '';

  if (structure === 'video') {
    prompt = videoPrompt(scene, globalStyle, concept);
  } else {
    prompt = carouselPrompt(scene, globalStyle, concept);
  }

  const image = await generateImage(prompt);

  return {
    ...scene,
    image,
  };
}

export async function generateAllImages(script: any) {
  const limit = pLimit(3);
  const { scenes, globalStyle, structure, concept } = script;

  const results = await Promise.all(
    scenes.map((scene: any) => limit(() => generateSingleImage(scene, globalStyle, structure, concept))),
  );

  return results;
}

export async function getTopicUrls(interests: string[] = []): Promise<string[]> {
  try {
    if (!interests.length) {
      return [
        'https://www.instagram.com/explore/topics/10155868806390727/sports/',
        'https://www.instagram.com/explore/topics/10155994924430727/music-audio/',
        'https://www.instagram.com/explore/topics/10156104410190727/fashion-beauty/',
        'https://www.instagram.com/explore/topics/10155994923880727/tv-movies/',
        'https://www.instagram.com/explore/topics/10156104417160727/games/',
        'https://www.instagram.com/explore/topics/514454113372737/pop-culture/',
      ];
    }

    const prompt = `
    You are a precise classification engine that maps user interests to predefined Instagram topic URLs.

    Your goal is to select the MOST relevant topics based on semantic meaning.

    ---

    AVAILABLE TOPICS:

    1. Sports
    https://www.instagram.com/explore/topics/10155868806390727/sports/
    Includes: fitness, gym, running, football, basketball, workouts, athletics

    2. Music
    https://www.instagram.com/explore/topics/10155994924430727/music-audio/
    Includes: songs, singing, DJ, beats, audio, concerts, instruments

    3. Fashion & Beauty
    https://www.instagram.com/explore/topics/10156104410190727/fashion-beauty/
    Includes: outfits, clothing, style, makeup, skincare, modeling

    4. TV & Movies
    https://www.instagram.com/explore/topics/10155994923880727/tv-movies/
    Includes: films, cinema, Netflix, series, actors, shows

    5. Games
    https://www.instagram.com/explore/topics/10156104417160727/games/
    Includes: gaming, esports, streamers, video games, consoles

    6. Pop Culture
    https://www.instagram.com/explore/topics/514454113372737/pop-culture/
    Includes: trends, memes, internet culture, influencers, technology, startups, AI, general lifestyle

    ---

    INPUT:
    ${JSON.stringify(interests)}

    ---

    STRICT DECISION RULES:

    1. Always choose the MINIMUM number of topics needed
    * Prefer 1 topic if possible
    * Use 2 ONLY if interests clearly belong to different categories
    * Use 3 ONLY in rare cases

    2. If multiple interests strongly match ONE category → return ONLY that category

    3. If interests are vague, modern, or tech-related (AI, startups, apps, social media) → choose Pop Culture

    4. Do NOT guess niche mappings
    * Example: "AI" is NOT "Games" → use Pop Culture

    5. Avoid over-classification
    * Do NOT include loosely related topics

    6. If no strong match → default to Pop Culture

    ---

    OUTPUT FORMAT (STRICT JSON ONLY, NO TEXT):

    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/XXXX/"
    ]
    }

    ---

    EXAMPLES:

    Input:
    ["ai", "technology", "startups"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/514454113372737/pop-culture/"
    ]
    }

    Input:
    ["gym", "fitness", "workout"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/10155868806390727/sports/"
    ]
    }

    Input:
    ["gaming", "streaming"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/10156104417160727/games/"
    ]
    }

    Input:
    ["movies", "netflix", "cinema"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/10155994923880727/tv-movies/"
    ]
    }

    Input:
    ["music", "dj", "concert"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/10155994924430727/music-audio/"
    ]
    }

    Input:
    ["fashion", "outfit", "skincare"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/10156104410190727/fashion-beauty/"
    ]
    }

    Input:
    ["gaming", "movies"]

    Output:
    {
    "directUrls": [
    "https://www.instagram.com/explore/topics/10156104417160727/games/",
    "https://www.instagram.com/explore/topics/10155994923880727/tv-movies/"
    ]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
    });

    const text = response.text?.trim() || '';

    const parsed = JSON.parse(text);
    return parsed.directUrls || [];
  } catch {
    return ['https://www.instagram.com/explore/topics/514454113372737/pop-culture/'];
  }
}
