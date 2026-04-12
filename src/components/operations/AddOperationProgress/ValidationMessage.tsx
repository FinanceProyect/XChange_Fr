interface ValidationMessageProps {
  message: string
}

export default function ValidationMessage({ message }: ValidationMessageProps) {
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}
