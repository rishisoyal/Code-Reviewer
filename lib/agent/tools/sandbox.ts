import Sandbox from "@nyariv/sandboxjs";
import { tool } from "ai";
import { z } from "zod";

export const runInSandbox = tool({
  description: "Executes JS code and returns runtime errors or results.",
  inputSchema: z.object({
    code: z.string().describe("The code to be test and executed"),
  }),
  execute: async ({ code }) => {
    const sandbox = new Sandbox();
    const exec = sandbox.compile(code);
    
    try {
      const result = exec().run();
      return { success: true, content: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
});

/* old method to execute code in sandbox using node:vm */
// export const runInSandbox = tool({
//   description: "Executes JS code and returns runtime errors or results.",
//   inputSchema: z.object({
//     code: z.string().describe("The code to be test and executed"),
//   }),
//   execute: async ({ code }) => {
//     const script = new vm.Script(code);
//     const context = vm.createContext({ console });

//     try {
//       // prevent creating infinite loops
//       const result = await script.runInContext(context, { timeout: 3000 });
//       return { success: true, content: result };
//     } catch (err: unknown) {
//       return { success: false, error: (err as Error).message };
//     }
//   },
// });
