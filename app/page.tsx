"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { useMemo, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoIosAlert } from "react-icons/io";
import { LuCircleDashed } from "react-icons/lu";
import { TbTerminal2 } from "react-icons/tb";

export default function CodeReviewer() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/review",
    }),
  });

  const marked = useMemo(() => {
    return new Marked(
      markedHighlight({
        emptyLangClass: "hljs",
        langPrefix: "hljs language-",
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : "plaintext";
          return hljs.highlight(code, { language }).value;
        },
      }),
    );
  }, []);

  const [input, setInput] = useState("");

  // console.log(messages);
  // console.log(input);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  p-6 bg-black text-white">
        {/* Left Side: Chat & Input */}
        <div className="min-h-screen flex flex-col border border-gray-500 rounded-xl bg-gray-950 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-scroll p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.role === "user" ? "align-end" : "w-full"} bg-gray-800 p-4 rounded-2xl`}
              >
                <span className="p-2 w-max px-8 rounded-xl bg-gray-900">
                  {message.role === "user" ? "User" : "AI"}
                </span>
                <br />
                <span className="p-4 w-full">
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      message.role === "user" ? (
                        <span key={index}>{part.text}</span>
                      ) : (
                        <span
                          key={index}
                          dangerouslySetInnerHTML={{
                            __html: marked
                              .parse(part.text, { gfm: true, breaks: true })
                              .toString(),
                          }}
                        ></span>
                      )
                    ) : null,
                  )}
                </span>
              </div>
            ))}
          </div>

          <form
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput("");
              }
            }}
            className="p-4 border-t bg-gray-900"
            id="input-form"
          >
            <div className="relative max-w-full">
              <div
                className="max-w-full min-h-34 h-auto overflow-y-auto text-wrap p-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none leading-6"
                contentEditable={true}
                role="textbox"
                aria-multiline={true}
                inputMode="text"
                onInput={(e) => {
                  setInput(e.currentTarget.innerText);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.closest("form")?.requestSubmit();
                    e.currentTarget.innerText = "";
                    setInput("");
                  }
                }}
              />

              {input.trim() === "" && (
                <span className="pointer-events-none absolute inset-0 p-3 opacity-50">
                  Write Something...
                </span>
              )}
            </div>
            <button
              disabled={status !== "ready"}
              type="submit"
              className="p-1 px-6 m-2 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-800 border border-white "
            >
              GO
            </button>
          </form>
        </div>

        {/* Right Side: Agent Process Logs */}
        <div className="min-h-screen border border-gray-500 rounded-xl bg-slate-900 text-slate-200 shadow-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-700 bg-slate-800 flex items-center gap-2">
            <TbTerminal2 size={20} />
            <span className="text-sm font-mono font-bold uppercase tracking-wider">
              Agent Reasoning Logs
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-6 text-white">
            {messages.map(
              (m) =>
                m.role === "assistant" && (
                  <div key={m.id}>
                    {m.parts.map((part, idx) => {
                      const type =
                        typeof part.type === "string" ? part.type : "";
                      // only render tool call parts
                      if (!type.startsWith("tool")) return null;
                      const toolPart = part as unknown as {
                        toolCallId?: string;
                        state?: string;
                        input?: unknown;
                        result?: { success?: boolean } | undefined;
                        output?: { content?: unknown } | undefined;
                      };
                      // console.log(toolPart);

                      const toolCallId = toolPart.toolCallId ?? idx;
                      const isDone = toolPart.state === "output-available";
                      const action = type.includes("-")
                        ? type.split("-")[1]
                        : type || "unknown";

                      const tp = toolPart as unknown as Record<string, unknown>;
                      const resultObj = tp.result as unknown as
                        | Record<string, unknown>
                        | undefined;
                      const outputObj = tp.output as unknown as
                        | Record<string, unknown>
                        | undefined;

                      const success =
                        (resultObj &&
                          (resultObj["success"] as boolean | undefined)) ??
                        (outputObj &&
                          (outputObj["success"] as boolean | undefined)) ??
                        false;

                      const rawOutput =
                        (outputObj && outputObj["content"]) ??
                        (resultObj && resultObj["content"]) ??
                        (outputObj && outputObj["error"]) ??
                        (resultObj && resultObj["error"]) ??
                        (resultObj && resultObj["errors"]) ??
                        outputObj ??
                        undefined;

                      function formatOutput(val: unknown) {
                        if (val === undefined || val === null)
                          return "No output";
                        if (Array.isArray(val)) return val.join("\n");
                        if (typeof val === "object")
                          return JSON.stringify(val, null, 2);
                        return String(val);
                      }
                      return (
                        <div
                          key={toolCallId}
                          className="border-l-2 border-slate-700 pl-4 py-2"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {isDone ? (
                              <FaRegCheckCircle
                                size={14}
                                className="text-emerald-400"
                              />
                            ) : (
                              <LuCircleDashed
                                size={14}
                                className="text-blue-400 animate-spin"
                              />
                            )}
                            <span className="text-blue-400">
                              Executing: {action}
                            </span>
                          </div>

                          {isDone && (
                            <div className="space-y-2">
                              <div className="text-slate-500 italic">
                                Tool Input
                              </div>
                              <pre className="bg-slate-800 p-2 rounded text-xs overflow-x-auto text-slate-300">
                                {JSON.stringify(toolPart.input, null, 2)}
                              </pre>

                              <div className="text-slate-500 italic">
                                Tool Output
                              </div>
                              <div
                                className={`p-2 rounded text-xs ${success ? "bg-emerald-900/30 text-emerald-300" : "bg-red-900/30 text-red-300"}`}
                              >
                                {success ? (
                                  "✅ Code Passed All Checks"
                                ) : (
                                  <div className="flex items-start gap-2">
                                    <IoIosAlert
                                      size={14}
                                      className="mt-0.5 shrink-0"
                                    />
                                    <span>{formatOutput(rawOutput)}</span>
                                  </div>
                                )}
                                {!success &&
                                  typeof rawOutput === "string" &&
                                  rawOutput.length > 0 && (
                                    <pre className="mt-2 bg-slate-800 p-2 rounded text-xs overflow-x-auto text-red-300">
                                      {formatOutput(rawOutput)}
                                    </pre>
                                  )}
                                {success && rawOutput && (
                                  <pre className="mt-2 bg-slate-800 p-2 rounded text-xs overflow-x-auto text-emerald-300">
                                    {formatOutput(rawOutput)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ),
            )}
            {messages.length === 0 && (
              <div className="text-slate-500 text-center mt-10">
                Awaiting agent initialization...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
