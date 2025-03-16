// Used to track delete/upload functionlaity in the editor !!

import { ZodNullable } from 'zod';
import { create } from 'zustand';

interface ProcessState {
  isProcessing: boolean;
  operation: "upload" | "delete" | undefined
  setIsProcessing: (value: boolean) => void;
  setOperation: (operatin: ProcessState['operation']) => void
  reset: () => void;
  // progresses: Record<string, number>;
  // setProgresses: (progresses: Record<string, number>) => void;
}

export const useProcessStore = create<ProcessState>((set) => ({
  isProcessing: false,
  operation: undefined,
  setIsProcessing: (value) => set({ isProcessing: value }),
  setOperation: (operation) => set({ operation }),
  // progresses: {},
  // setProgresses: (progresses) => set({ progresses }),
  reset: () => {
    set({
      isProcessing: false,
      // progresses: {},
      operation: undefined,
    });
  },
}));