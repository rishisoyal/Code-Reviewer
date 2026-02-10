import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  model: string | null;
  provider: string | null;
  apiKey: string | null;
};

type Action = {
  setModel: (model: string) => void;
  setProvider: (provider: string) => void;
  setApiKey: (apiKey: string) => void;
};

export const useSettingsStore = create<State & Action>()(
  persist(
    (set) => ({
      model: null,
      provider: null,
      apiKey: null,
      setModel: (model) => set({ model }),
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
    }),
    { name: "settings-store" },
  ),
);
