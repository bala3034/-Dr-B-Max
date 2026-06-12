import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const prompt = `Analyze the attached image. 
First, determine if it clearly contains a food item, meal, or snack. 
If it DOES NOT contain food (e.g., it is a picture of an empty table, a random object, a face, or it is too dark/blurry to tell), you MUST reply EXACTLY with the text: "ERROR: Please upload a proper picture of food." Do not add any other text.

If it DOES contain food, provide a concise but detailed nutritional breakdown. Include:
- Estimated Calories
- Protein (g)
- Fat (g)
- Carbohydrates (g)
- Fiber (g)

Format it nicely using Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg'
          }
        }
      ],
    });

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    return NextResponse.json({ error: "Failed to fetch response from Gemini API" }, { status: 500 });
  }
}
