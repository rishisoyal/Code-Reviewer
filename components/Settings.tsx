"use client";
import { useSettingsStore } from "@/store/settingsStore";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function Settings() {
  const { model, provider, apiKey, setModel, setProvider, setApiKey } =
    useSettingsStore();

  const [showAPI, setShowAPI] = useState(false);

  const providers = [
    {
      name: "openai",
      models: [
        "gpt-4.1-nano",
        "gpt-3.5-turbo",
        "gpt-4.1-mini",
        "gpt-4.1",
        "gpt-5.2-pro",
        "gpt-5.2",
      ],
    },
    {
      name: "mistral",
      models: ["mistral-large-latest", "mistral-small-latest"],
    },
    {
      name: "anthropic",
      models: [
        "claude-sonnet-4-20250514",
        "claude-3-haiku-20240307",
        "claude-sonnet-4-20250514",
        "claude-3-opus-20240229",
        "claude-3-5-sonnet-20241022",
      ],
    },
    // {
    //   name: "groq",
    //   models: [" ", "gpt-3.5-turbo"],
    // },
    {
      name: "google",
      models: ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"],
    },
    {
      name: "deepseek",
      models: ["deepseek-coder", "deepseek-chat"],
    },
    // {
    //   name: "perplexity",
    //   models: [" ", "gpt-3.5-turbo"],
    // },
  ];

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!model || !provider || !apiKey) {
      alert("Please Select Model and Provider, and enter API Key");
      return;
    }
    alert("Your Settings Are Applied");
  }

  return (
    <>
      <main className="w-full h-80vh">
        <div className="w-full grid place-content-center p-2">
          <h1 className="text-white text-2xl">Settings</h1>
        </div>
        <div className="w-full p-4 grid place-content-center">
          <form
            method="post"
            onSubmit={handleSubmit}
            className="w-[80vw] md:w-2xl flex gap-4 p-4 flex-col"
          >
            <div className="relative w-full flex items-center justify-center">
              <input
                type={showAPI ? "text" : "password"}
                name="api-key"
                id="api-key"
                placeholder="Your API Key"
                value={apiKey ?? ""}
                className="box-border w-full p-2 border border-r-0 border-gray-800 rounded-xs rounded-r-0 outline-none focus:ring-2 focus:ring-gray-600 bg-transparent text-white"
                required
                onChange={(e) => {
                  setApiKey(e.currentTarget.value);
                }}
              />
              <span
                className="absolute right-0 bg-[#11111B] grid place-content-center p-2 cursor-pointer border border-l-0 border-gray-800 rounded-r-xs"
                onClick={() => setShowAPI((p) => !p)}
              >
                {showAPI ? <IoMdEyeOff size={24} /> : <IoMdEye size={24} />}
              </span>
            </div>
            <br />
            <FormControl
              sx={{
                m: 1,
                minWidth: 120,
                bgcolor: "black",
                borderColor: "#62748e",
              }}
            >
              <InputLabel sx={{ color: "white" }}>Provider</InputLabel>
              <Select
                value={provider ?? ""}
                label="Provider"
                onChange={(e) => setProvider(e.target.value!)}
                sx={{
                  bgcolor: "#black",
                  color: "white",
                  borderColor: "#62748e",
                }}
              >
                <MenuItem
                  value="None"
                  sx={{
                    bgcolor: "#1e2939",
                    color: "white",
                    borderColor: "#62748e",
                    ":hover": { bgcolor: "#334155" },
                    ":active": { bgcolor: "#475569" },
                    "&.Mui-selected": {
                      bgcolor: "#475569",
                      color: "white",
                    },
                  }}
                >
                  None
                </MenuItem>
                {providers.map((p, i) => (
                  <MenuItem
                    key={i}
                    value={p.name}
                    sx={{
                      bgcolor: "#1e2939",
                      color: "white",
                      borderColor: "#62748e",
                      ":hover": { bgcolor: "#334155" },
                      ":active": { bgcolor: "#475569" },
                      "&.Mui-selected": {
                        bgcolor: "#475569",
                        color: "white",
                      },
                    }}
                  >
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                m: 1,
                minWidth: 120,
                bgcolor: "black",
                borderColor: "#62748e",
              }}
            >
              <InputLabel sx={{ color: "white" }}>Model</InputLabel>
              <Select
                value={model ?? ""}
                label="Model"
                onChange={(e) => setModel(e.target.value!)}
                sx={{
                  bgcolor: "#black",
                  color: "white",
                  borderColor: "#62748e",
                  userSelect: { bgcolor: "gray" },
                  ":active": { bgcolor: "#475569" },
                }}
              >
                <MenuItem
                  value="None"
                  sx={{
                    bgcolor: "#1e2939",
                    color: "white",
                    borderColor: "#62748e",
                    ":hover": { bgcolor: "#334155" },
                    ":active": { bgcolor: "#475569" },
                    "&.Mui-selected": {
                      bgcolor: "#475569",
                      color: "white",
                    },
                  }}
                >
                  None
                </MenuItem>
                {providers
                  .find((p) => p.name === provider)
                  ?.models.map((m, j) => (
                    <MenuItem
                      key={j}
                      value={m}
                      sx={{
                        bgcolor: "#1e2939",
                        color: "white",
                        borderColor: "#62748e",
                        ":hover": { bgcolor: "#334155" },
                        ":active": { bgcolor: "#475569" },
                        "&.Mui-selected": {
                          bgcolor: "#475569",
                          color: "white",
                        },
                      }}
                    >
                      {m}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <br />
            <div className="w-full flex justify-center">
              <button
                type="submit"
                className="p-2 px-4 cursor-pointer border rounded-2xl hover:bg-white hover:text-black transition-colors duration-300 ease-in-out"
              >
                Use These Settings
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
