import { createMistral } from "@ai-sdk/mistral";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const providers = {
  mistral: createMistral,
  anthropic: createAnthropic,
  groq: createGroq,
  openai: createOpenAI,
  perplexity: createPerplexity,
  deepseek: createDeepSeek,
  google: createGoogleGenerativeAI,
};


interface GetModelParams {
  apiKey: string;
  model: string;
  provider: string;
}

export function getModel({
  apiKey,
  model,
  provider,
}: GetModelParams) {
  const createModel = providers[provider as keyof typeof providers];

  if (!createModel) {
    throw new Error(`Provider ${provider} is not supported.`);
  }
  return createModel({ apiKey })(model);
}
