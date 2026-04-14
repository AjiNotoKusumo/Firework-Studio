import puppeteer from "puppeteer";

/* ================= TYPES ================= */

type Scene = {
  id: number;
  purpose: string;
  description: string;
  startTime: number;
  endTime: number;
  camera: string;
  motion: string;
  emotion: string;
  soundEffect?: { name: string };
  imageUrl?: string;
};

type RedzoneIdea = {
  id: string;
  imageUrl: string;
  storyboard: {
    concept: {
      title: string;
      hook: string;
    };
    globalStyle: {
      visualStyle: string;
      colorPalette: string;
    };
    structure: {
      type: "video" | "image";
    };
    scenes: Scene[];
  };
};

/* ================= HTML GENERATOR ================= */

const generateHTML = (idea: any): string => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #111;
        }

        h1 {
          margin-bottom: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          font-size: 13px;
          text-align: left;
          vertical-align: top;
          word-break: break-word;
        }

        th {
          background: #f5f5f5;
        }

        img {
          width: 120px;
          height: auto;
          border-radius: 8px;
          display: block;
        }

        .page-break {
          page-break-before: always;
        }

        tr {
          page-break-inside: avoid;
        }
      </style>
    </head>

    <body>

      <!-- PAGE 1 -->
      <h1>🔥 Firework Idea Summary</h1>

      <table>
        <tr><th>Title</th><td>${idea.concept.title}</td></tr>
        <tr><th>Hook</th><td>${idea.concept.hook}</td></tr>
        <tr><th>Visual Style</th><td>${idea.globalStyle.visualStyle}</td></tr>
        <tr><th>Color Palette</th><td>${idea.globalStyle.colorPalette}</td></tr>
        <tr><th>Format</th><td>${idea.structure.type}</td></tr>
      </table>

      <!-- PAGE 2 -->
      <div class="page-break"></div>

      <h1>🎬 Scene Breakdown</h1>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Purpose</th>
            <th>Description</th>
            <th>Time</th>
            <th>Camera</th>
            <th>Motion</th>
            <th>Emotion</th>
            <th>Sound</th>
          </tr>
        </thead>

        <tbody>
          ${idea.scenes
            .map((scene : any) => {
              const img = scene.image;

              return `
                <tr>
                  <td>${scene.sceneNumber}</td>
                  <td><img src="${img || 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg'}" /></td>
                  <td>${scene.purpose}</td>
                  <td>${scene.description}</td>
                  <td>${scene.startTime}s - ${scene.endTime}s</td>
                  <td>${scene.camera}</td>
                  <td>${scene.motion}</td>
                  <td>${scene.emotion}</td>
                  <td>${scene.soundEffect?.name ?? "-"}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>

    </body>
  </html>
  `;
};

/* ================= API ROUTE ================= */

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { idea: RedzoneIdea };

    if (!body?.idea) {
      return new Response(
        JSON.stringify({ error: "Missing idea data" }),
        { status: 400 }
      );
    }

    console.log(body.idea)

    const html = generateHTML(body.idea);

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true, // better for table
      printBackground: true,
    });

    await browser.close();

    return new Response(Buffer.from(pdfBuffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=firework-storyboard.pdf",
        },
    });
  } catch (error) {
    console.error("PDF export error:", error);

    return new Response(
      JSON.stringify({ error: "PDF generation failed" }),
      { status: 500 }
    );
  }
}