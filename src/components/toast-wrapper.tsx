"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ToastWrapper({ name }: { name: string }) {
  const searchParams = useSearchParams();
  const param = searchParams.get(name);
  const hasShownToast = useRef(false); // Track if the toast has been shown

  useEffect(() => {
    if (param && !hasShownToast.current) {
      toast.error(decodeURIComponent(param)); // Show toast message
      hasShownToast.current = true; // Mark toast as shown
    }
  }, [param]);

  return null;
}
