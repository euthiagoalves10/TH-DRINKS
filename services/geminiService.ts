import { GoogleGenAI } from "@google/genai";

// NOTE: In a real production app, you should proxy this through a backend.
// For this demo, we assume the key is available or simulated.
// Since the prompt instructs NOT to ask for a key, I will wrap this safely.
// If API_KEY is missing, it will return a mock response to ensure app functionality.

const apiKey = process.env.API_KEY || 'YOUR_API_KEY_HERE'; 

export const generateDrinkDescription = async (name: string, ingredients: string[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key missing. Returning mock description.");
      return `Uma mistura deliciosa de ${ingredients.join(', ')} com notas sensoriais únicas de ${name}. (Descrição gerada localmente - configure a API Key para IA)`;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Crie uma descrição sensorial curta, sedutora e criativa (máximo 25 palavras) em Português para um drink chamado "${name}" que contém: ${ingredients.join(', ')}. O tom deve ser sofisticado e convidativo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Descrição indisponível no momento.";
  }
};
