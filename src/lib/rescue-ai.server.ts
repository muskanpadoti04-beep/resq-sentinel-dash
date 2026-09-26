import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export type RescueAction = {
  priority: number;
  urgency: "Immediate" | "High" | "Moderate";
  action: string;
  target: string;
  assignee: string;
  reason: string;
};
export type RescuePlan = { summary: string; actions: RescueAction[]; warnings: string[] };

export async function generateRescuePlan(apiKey: string, messages: ModelMessage[]): Promise<RescuePlan> {
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let streamError: unknown;
  const result = streamText({
    onError: ({ error }) => {
      streamError = error;
      console.error("rescue-ai stream error", error);
    },
    model: provider.responses(MODEL),
    messages,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text.catch((e) => { throw streamError ?? e; });
  if (!text && streamError) throw streamError;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The AI did not return a rescue plan. Please try again.");
  const parsed = JSON.parse(match[0]) as RescuePlan;
  return {
    summary: String(parsed.summary ?? ""),
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    actions: (Array.isArray(parsed.actions) ? parsed.actions : [])
      .map((a, i) => ({ ...a, priority: Number(a.priority) || i + 1 }))
      .sort((a, b) => a.priority - b.priority),
  };
}
