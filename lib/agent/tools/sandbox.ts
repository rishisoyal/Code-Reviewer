import vm from "node:vm";
import { tool } from "ai";
import { z } from "zod";

export const runInSandbox = tool({
  description: "Executes JS code and returns runtime errors or results.",
  inputSchema: z.object({
    code: z.string().describe("The code to be text and executed"),
  }),
  execute: async ({ code }) => {
    const script = new vm.Script(code);
    const context = vm.createContext({ console });

    try {
      // prevent creating infinite loops
      const result = await script.runInContext(context, { timeout: 3000 });
      return { success: true, content: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
});
