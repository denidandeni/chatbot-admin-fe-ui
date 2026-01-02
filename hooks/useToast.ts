import { useState, useCallback, useRef } from "react";
import { ToastMessage } from "@/app/components/ToastContainer";

// Counter to ensure unique IDs even when called in rapid succession
let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
      duration: number = 3000
    ) => {
      // Generate unique ID using timestamp + incrementing counter
      toastCounter++;
      const id = `${Date.now()}-${toastCounter}`;
      
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}
