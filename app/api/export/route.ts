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
        }

        th {
          background: #f5f5f5;
        }

        .summary-table td:first-child {
          width: 120px; 
          font-weight: bold;
          background: #f5f5f5;
        }

        .scene-table {
          table-layout: fixed; /* Keep this for the big table only */
        }

        .scene-table th, .scene-table td {
          font-size: 11px; /* Slightly smaller for the wide table */
          word-wrap: break-word;
        }

        .scene-table th:nth-child(1) { width: 30px; }   /* # */
        .scene-table th:nth-child(2) { width: 130px; }  /* Image */
        .scene-table th:nth-child(3) { width: 70px; }   /* Purpose */
        .scene-table th:nth-child(4) { width: auto; }   /* Description */
        .scene-table th:nth-child(5) { width: 60px; }   /* Time */
        .scene-table th:nth-child(6) { width: 80px; }   /* Camera */
        .scene-table th:nth-child(7) { width: 80px; }   /* Motion */
        .scene-table th:nth-child(8) { width: 70px; }   /* Emotion */
        .scene-table th:nth-child(9) { width: 80px; }   /* Sound */

        img {
          width: 100%; /* Image fills its column width */
          max-width: 120px;
          height: auto;
          border-radius: 4px;
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

      <table class="summary-table">
        <tr><th>Title</th><td>${idea.concept.title}</td></tr>
        <tr><th>Hook</th><td>${idea.concept.hook}</td></tr>
        <tr><th>Visual Style</th><td>${idea.globalStyle.visualStyle}</td></tr>
        <tr><th>Color Palette</th><td>${idea.globalStyle.colorPalette}</td></tr>
        <tr><th>Format</th><td>${idea.structure.type}</td></tr>
      </table>

      <!-- PAGE 2 -->
      <div class="page-break"></div>

      <h1>🎬 Scene Breakdown</h1>

      <table class="scene-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Purpose</th>
            <th>Description</th>
            <th>${idea.structure.type === "video" ? "Time" : "Order"}</th>
            <th>${idea.structure.type === "video" ? "Camera" : "Visual Focus"}</th>
            <th>${idea.structure.type === "video" ? "Motion" : "Text Overlay"}</th>
            <th>Emotion</th>
            <th>${idea.structure.type === "video" ? "Sound" : "Filter"}</th>
          </tr>
        </thead>

        <tbody>
          ${idea.scenes
            .map((scene : any) => {
              const img = scene.image;

              return `
                <tr>
                  <td>${scene.sceneNumber}</td>
                  <td><img src="${img || 'https://res.cloudinary.com/djwg7ocsw/image/upload/v1776695426/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector_1_k5ebt4.webp'}" /></td>
                  <td>${scene.purpose}</td>
                  <td>${scene.description}</td>
                  <td>${idea.structure.type === "video" ? `${scene.startTime}s - ${scene.endTime}s` : scene.sceneNumber}</td>
                  <td>${idea.structure.type === "video" ? scene.camera : scene.visualFocus}</td>
                  <td>${idea.structure.type === "video" ? scene.motion : scene.textOverlay}</td>
                  <td>${scene.emotion}</td>
                  <td>${idea.structure.type === "video" ? scene.soundEffect?.name ?? "-" : scene.filter}</td>
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