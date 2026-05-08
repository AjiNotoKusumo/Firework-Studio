import { genereateConcepts } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const concepts = await genereateConcepts(body);

    return Response.json(concepts, { status: 200 });
  } catch (error) {
    console.log('Error generating concepts:', error);
    return Response.json({ error: 'Failed to generate concepts' }, { status: 500 });
  }
}
