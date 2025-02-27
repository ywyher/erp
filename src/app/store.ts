import { create } from "zustand";

type ImageStore = {
  trigger: boolean | null;
  setTrigger: (trigger: boolean) => void;
};

export const useImageStore = create<ImageStore>((set) => ({
  trigger: null,
  setTrigger: (trigger: ImageStore["trigger"]) =>
    set((state) => ({ trigger: trigger })),
}));
