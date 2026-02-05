import { convertToModelMessages, streamText, UIMessage, stepCountIs } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { runESLint, runInSandbox } from "@/lib/agent/tools";
import { NextResponse , NextRequest} from "next/server";

const SYSTEM_MESSAGE = `You are an autonomous Senior Software Engineer.

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

9. AUTONOMY RULE
  - Never ask the user for confirmation or input.
  - Use the provided tools and their outputs to decide next actions.

10. STREAMING
  - After finishing tool execution (success or failure), immediately emit the assistant response.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: mistral("mistral-large-latest"),
      messages: await convertToModelMessages(messages),
      maxRetries: 20, // Allows the "Write -> Fail -> Fix" loop
      system: SYSTEM_MESSAGE,
      tools: {
        esLint: runESLint,
        sandbox: runInSandbox,
      },
      toolChoice: "auto",
      stopWhen: stepCountIs(20),
    });

    return result.toUIMessageStreamResponse();
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

