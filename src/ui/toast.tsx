import { XIcon } from "@ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/src/utils";

type ToastType = "error" | "success" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "error") => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-2 flex items-center gap-2 rounded border px-3 py-2 text-xs shadow-lg bg-zinc-950 text-foreground",
                {
                  "border-destructive": toast.type === "error",
                  "border-success": toast.type === "success",
                  "border-warning": toast.type === "warning",
                },
              )}
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="flex-1">{toast.message}</p>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 active:scale-[0.97]"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                <XIcon size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
