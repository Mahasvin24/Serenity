// This file contains the API integration functions that you can customize
// to connect with your backend LLM service
import Groq from "groq-sdk";

type Message = {
  content: string;
  role: "user" | "assistant";
};

export async function sendMessage(
  messages: Message[],
  model: string = "llama-3.3-70b-versatile"
): Promise<string> {
  try {
    const groq = new Groq({
      apiKey: "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",
      dangerouslyAllowBrowser: true,
    });

    // Custom instruction to guide AI behavior
    const customInstruction = {
      content: `
        Be a compassionate listener and emotional support. Acknowledge my feelings, ask thoughtful questions to help me reflect, and offer occasional advice only when helpful. Keep the tone casual and responses short like a real conversation. Check in on how I’m feeling every now and then, and offer breathing exercises if the conversation dies down or I have nothing to say.
      `,
      role: "system", // "system" role ensures this is treated as context
    };

    // Add the custom instruction to the beginning of the messages array
    const fullMessages = [customInstruction, ...messages];

    const response = await groq.chat.completions.create({
      messages: fullMessages,
      model: model || "llama-3.3-70b-versatile",
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("API error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}
