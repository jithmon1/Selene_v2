import Groq from "groq-sdk";
import { API_KEY } from '@env';


type GroqMessage = {
  role: "user" | "assistant";
  content: string;
};

const groq = new Groq({
    apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
});

export const fetchDataFromGrok = async (messages: GroqMessage[]): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content || "No response from AI";
  } catch (error) {
    console.error("Error fetching data from Groq:", error);
    throw error;
  }
};