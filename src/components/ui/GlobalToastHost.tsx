import { useEffect, useState } from "react";
import Toast from "./Toast";
import { subscribeToToasts, type ToastEvent } from "../../lib/toastBus";

export default function GlobalToastHost() {
  const [toast, setToast] = useState<ToastEvent | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((event) => {
      setToast(event);
    });

    return unsubscribe;
  }, []);

  if (!toast) return null;

  return (
    <Toast
      key={toast.id}
      message={toast.message}
      variant={toast.variant}
      duration={toast.duration}
      onClose={() => setToast(null)}
    />
  );
}
