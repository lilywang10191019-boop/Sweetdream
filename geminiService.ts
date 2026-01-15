
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSeatFortune(name: string, seat: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a mystical concert fortune teller. A person named ${name} just drew seat number ${seat} for an upcoming music concert. 
      Give them a short, fun, and exciting 2-sentence "seat fortune" in Chinese (since they are using WeChat) about their luck at the concert based on this seat number. 
      Keep it high energy and positive!`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text || "祝你在音乐会上玩得开心！你的座位充满了魔力。";
  } catch (error) {
    console.error("Error getting fortune:", error);
    return "祝你在音乐会上玩得开心！这绝对是一个绝佳的位置。";
  }
}
