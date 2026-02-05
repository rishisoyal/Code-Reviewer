import { Linter } from "eslint";
import { tool } from "ai";
import { z } from "zod";
import tsParser from "@typescript-eslint/parser";

export const runESLint = tool({
  description: "Lint the JS code and returns linter errors",
  inputSchema: z.object({
    code: z.string().describe("The code to lint"),
  }),
  execute: async ({ code }) => {
    const linter = new Linter();

    await Promise.resolve(); // yield to event loop

    try {
      const messages = linter.verify(
        code,
        [
          {
            languageOptions: {
              parser: tsParser,
              ecmaVersion: 2022,
              sourceType: "module",
            },
            rules: {
              "no-undef": "error",
              "no-unused-vars": "warn",
            },
          },
        ],
        { filename: "input.js" },
      );

      // console.log({ messages });

      return messages.length === 0
        ? {
            success: true,
            content: "No lint errors found.",
          }
        : {
            success: false,
            content: messages.map(
              (m) => `${m.line}:${m.column} - ${m.message}`,
            ),
          };
    } catch (err: unknown) {
      console.log({ err });

      return { success: false, errors: [(err as Error).message] };
    }
  },
});
