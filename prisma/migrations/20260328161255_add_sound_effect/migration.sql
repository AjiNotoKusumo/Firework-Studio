-- CreateTable
CREATE TABLE "SoundEffect" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT,
    "description" TEXT,
    "category" TEXT,
    "embedding" vector(768),

    CONSTRAINT "SoundEffect_pkey" PRIMARY KEY ("id")
);
