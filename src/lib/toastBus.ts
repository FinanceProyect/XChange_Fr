export type ToastVariant = "success" | "error";

export interface ToastEvent {
  id: number;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

type Listener = (event: ToastEvent) => void;

const listeners = new Set<Listener>();
let counter = 0;

export const showToast = (event: Omit<ToastEvent, "id">) => {
  const toastEvent: ToastEvent = { id: ++counter, ...event };
  listeners.forEach((listener) => listener(toastEvent));
};

export const subscribeToToasts = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
