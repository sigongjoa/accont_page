
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://huggingface.co/api/models?full=true&sort=downloads&direction=-1&limit=20'); // Fetch top 20 models by downloads
    if (!response.ok) {
      throw new Error(`Failed to fetch models from Hugging Face: ${response.statusText}`);
    }
    const data = await response.json();

    // Map Hugging Face API response to our Model interface
    const models = data.map((model: any) => ({
      id: model.modelId,
      name: model.modelId.split('/').pop(), // Extract name from modelId
      author: model.author || model.modelId.split('/')[0],
      tags: model.tags || [],
      parameters: model.cardData?.parameters || 'N/A',
      inference_speed: 'N/A', // Hugging Face API doesn't directly provide this
      license: model.cardData?.license || 'N/A',
      stars: model.likes || 0,
      description: model.cardData?.description || 'No description available.',
      // Add more fields as needed
    }));

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
