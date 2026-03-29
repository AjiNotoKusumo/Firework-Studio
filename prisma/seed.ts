import prisma from "@/lib/prisma";
import {embed} from "@/lib/gemini";
import data from "@/data/sounds.json"

async function main() {
  const batchSize = 20;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    console.log(`Processing batch ${i / batchSize + 1}`);

    const embeddings = await Promise.all(
      batch.map((sound) =>
        embed(
          `${sound.name}. ${sound.description}. ${sound.category}`
        )
      )
    );

    if (!embeddings || embeddings.some(e => !e)) {
      throw new Error("Failed to generate embeddings for one or more sound effects in batch " + (i / batchSize + 1));
    }

    await prisma.$transaction(
      batch.map((sound, index) =>
        {
            const vector = `[${embeddings[index]!.join(",")}]`;

            return prisma.$executeRaw`
            INSERT INTO "SoundEffect" (id, name, url, description, category, embedding)
            VALUES (
                gen_random_uuid(),
                ${sound.name},
                ${sound.url},
                ${sound.description},
                ${sound.category},
                ${vector}::vector
            )
            `;
        }
      )
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());