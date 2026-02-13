import { runESLint, runInSandbox } from "@/lib/agent/tools";
import { mistral } from "@ai-sdk/mistral";
import { getModel } from "@/lib/model";

import {
  convertToModelMessages,
  stepCountIs,
  ToolLoopAgent,
  UIMessage,
} from "ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_MESSAGE = `You are an autonomous Senior Software Engineer.

Before Answering the query you must tell the user the AI model being used and by which provider.

You must follow a structured "Chain of Thought" process:
  1. **Thought**: Analyze the user's request and describe your plan.
   What do you know? What is missing? Which tool is best?
  2. **Action**: Choose a tool to call. Use the format: Action: tool_name(argument)
  3. **Observation**: You will receive the result of that action.
  4. **Final Answer**: Once you have enough information, provide the final response.

You MUST act without any user interaction. Execute the following protocol autonomously:

1. ANALYZE
  Briefly analyze the user requirement.

2. DRAFT
  Write the initial solution code.

3. LINT
  Automatically call the \`esLint\` tool to lint the drafted code (do not ask the user).

4. EXECUTE
  Automatically call the \`sandbox\` tool to execute the code and capture output.

5. REFLECT
  - If ANY tool fails, explain the failure in ONE concise technical sentence.
  - If the failure is fatal or cannot be fixed automatically, STOP and report the failure.

6. HEAL
  - If the failure is fixable, rewrite the code to address the issue and repeat steps 3–5 up to two retries per failing step.
  - Do not prompt the user.

7. TERMINATION RULES
  - Always produce a final assistant response summarizing results and including code and tool outputs.
  - If all tools succeed, present the final solution.

8. OUTPUT RULES
  - Display each step explicitly using markdown headers.
  - Show tool outputs clearly under each step.
  - Write code in fenced code blocks with language tags.
  - Keep explanations concise and technical.
  - Use sufficient space and formatting for readability.

9. AUTONOMY RULE
  - Never ask the user for confirmation or input.
  - Use the provided tools and their outputs to decide next actions.

10. STREAMING
  - After finishing tool execution (success or failure), immediately emit the assistant response.
`;

interface ResponseBody {
  id: string;
  messages: UIMessage[];
  apiKey: string;
  provider: string;
  model: string;
}

export async function POST(req: NextRequest) {
  try {
    const { id, messages, apiKey, model, provider }: ResponseBody =
      await req.json();

    // console.log({id, apiKey, provider, model });

    const currentModel =
      !apiKey || !provider || !model
        ? mistral("mistral-large-latest")
        : getModel({ apiKey, model, provider });

    console.log("current model: ", currentModel.modelId);

    const agent = new ToolLoopAgent({
      model: currentModel,
      instructions: SYSTEM_MESSAGE,
      maxRetries: 20, // Allows the "Write -> Fail -> Fix" loop
      tools: {
        esLint: runESLint,
        sandbox: runInSandbox,
      },
      toolChoice: "auto",
      stopWhen: stepCountIs(20),
    });

    const result = await agent.stream({
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error("api error: ", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
