import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { getSugerencias } from "../../services/deudores.service";

interface Sugerencia {
  id: string;
  nombre: string;
}

interface Props {
  nombre: string;
  selectedId: string | null;
  onChange: (nombre: string, id: string | null) => void;
  disabled?: boolean;
}

export default function DebtorAutocomplete({
  nombre,
  selectedId,
  onChange,
  disabled = false,
}: Props) {
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset suggestions when disabled
  useEffect(() => {
    if (disabled) {
      setSugerencias([]);
      setShowDropdown(false);
    }
  }, [disabled]);

  const handleInputChange = (value: string) => {
    onChange(value, null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSugerencias([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getSugerencias(value.trim());
        setSugerencias(data as Sugerencia[]);
        setShowDropdown(true);
      } catch {
        setSugerencias([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (s: Sugerencia) => {
    onChange(s.nombre, s.id);
    setSugerencias([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange("", null);
    setSugerencias([]);
    setShowDropdown(false);
  };

  if (selectedId) {
    return (
      <div
        className={`flex items-center gap-2 w-full text-sm border border-blue-300 bg-blue-50 rounded-md px-3 py-2 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <span className="flex-1 text-gray-800 truncate">{nombre}</span>
        {!disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={nombre}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          placeholder="Nombre y apellido"
          className={`w-full text-sm border rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            disabled
              ? "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-200 text-gray-700 bg-white"
          }`}
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
          />
        )}
      </div>

      {showDropdown && sugerencias.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {sugerencias.map((s) => (
            <li
              key={s.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              className="px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
            >
              {s.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
