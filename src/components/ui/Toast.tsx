import { useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { ToastVariant } from "../../lib/toastBus";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  variant?: ToastVariant;
}

const variantStyles: Record<
  ToastVariant,
  { container: string; iconColor: string }
> = {
  success: {
    container: "bg-gray-900",
    iconColor: "text-green-400",
  },
  error: {
    container: "bg-red-600",
    iconColor: "text-white",
  },
};

export default function Toast({
  message,
  onClose,
  duration = 3000,
  variant = "success",
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = variantStyles[variant];
  const Icon = variant === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${styles.container} text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in`}
    >
      <Icon size={18} className={`${styles.iconColor} shrink-0`} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
