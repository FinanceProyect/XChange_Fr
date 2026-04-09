import { useState, useEffect } from "react";
import { Wallet, Globe, PiggyBank, Save, TrendingUp } from "lucide-react";
import { currencyBalances } from "../data/mockData";
import {
  useConfiguracion,
  useSaveConfiguracion,
} from "../queries/configuracion.query";
import Toast from "../components/ui/Toast";

const currencyLabels: Record<string, string> = {
  ARS: "Peso Argentino (ARS)",
  EUR: "Euros (EUR)",
  USD: "Dólares (USD)",
  BRL: "Reales Brasileños (BRL)",
  USDT: "Tether (USDT)",
};

const currencySymbols: Record<string, string> = {
  ARS: "$AR",
  EUR: "€",
  USD: "$",
  BRL: "R$",
  USDT: "₮",
};

export default function Settings() {
  const { data } = useConfiguracion();
  const { mutate: saveConfig, isPending } = useSaveConfiguracion();

  const backendData = data as
    | {
        saldoPesos: number;
        saldoEur: number;
        saldoUsd: number;
        saldoBrl: number;
        saldoUsdt: number;
        carteraDefecto: string;
        monedaDefecto: string;
        idioma: string;
      }
    | undefined;

  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [defaultWallet, setDefaultWallet] = useState("Trading Account");
  const [language, setLanguage] = useState("es");
  const [balances, setBalances] = useState<Record<string, string>>(
    Object.fromEntries(
      currencyBalances.map((b) => [b.currency, b.amount.toString()]),
    ),
  );
  const [cotizacionManual, setCotizacionManual] = useState(false);
  const [cotizacionValor, setCotizacionValor] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state when backend data loads
  useEffect(() => {
    if (!backendData) return;
    setDefaultCurrency(backendData.monedaDefecto);
    setDefaultWallet(backendData.carteraDefecto);
    setLanguage(backendData.idioma);
    setBalances({
      ARS: backendData.saldoPesos?.toString(),
      EUR: backendData.saldoEur.toString(),
      USD: backendData.saldoUsd.toString(),
      BRL: backendData.saldoBrl.toString(),
      USDT: backendData.saldoUsdt.toString(),
    });
  }, [backendData]);

  const handleBalance = (id: string, value: string) =>
    setBalances((prev) => ({ ...prev, [id]: value }));

  const buildPayload = () => ({
    saldoPesos: parseFloat(balances.ARS || "0"),
    saldoEur: parseFloat(balances.EUR || "0"),
    saldoUsd: parseFloat(balances.USD || "0"),
    saldoBrl: parseFloat(balances.BRL || "0"),
    saldoUsdt: parseFloat(balances.USDT || "0"),
    carteraDefecto: defaultWallet,
    monedaDefecto: defaultCurrency,
    idioma: language,
  });

  const handleSave = () => {
    setIsConfirmOpen(true);
  };

  const confirmSave = () => {
    if (isPending) return;
    const payload = buildPayload();
    setIsConfirmOpen(false);
    saveConfig(payload, {
      onSuccess: () => setToastMessage("Configuración guardada con éxito"),
    });
  };

  return (
    <>
      <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
        {/* Header — título izquierda, botones derecha */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Configuración
            </h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              Ajusta las preferencias de tu cuenta
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* Main layout: izquierda saldo | derecha cartera + idioma */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Izquierda — Saldo disponible */}
          <div className="lg:flex-1 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-800">
                Saldo disponible
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ...currencyBalances.filter((b) => b.currency === "ARS"),
                ...currencyBalances.filter((b) => b.currency !== "ARS"),
              ].map(({ currency }) => (
                <div key={currency}>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {currencyLabels[currency]}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                    <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 min-w-[40px] text-center">
                      {currencySymbols[currency]}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={balances[currency] ?? ""}
                      onChange={(e) => handleBalance(currency, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derecha — Cartera + Idioma */}
          <div className="lg:flex-1 flex flex-col gap-4">
            {/* Cartera por defecto */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Cartera por defecto
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Cuenta principal
                  </label>
                  <select
                    value={defaultWallet}
                    onChange={(e) => setDefaultWallet(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option>Trading Account</option>
                    <option>Savings Account</option>
                    <option>Crypto Wallet</option>
                    <option>Investment Account</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Moneda por defecto
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="USD">$ Dólar (USD)</option>
                    <option value="BRL">R$ Real Brasileño (BRL)</option>
                    <option value="USDT">₮ Tether (USDT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Idioma */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-800">Idioma</h2>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* Cotización del balance total */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Cotización del balance total
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Cotización manual
                    </p>
                    <p className="text-xs text-gray-500">
                      {cotizacionManual
                        ? "Ingresa el valor de cotización manualmente"
                        : "La cotización se calcula de forma automática"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCotizacionManual((prev) => !prev);
                      setCotizacionValor("");
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      cotizacionManual ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        cotizacionManual ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Valor de cotización
                  </label>
                  <div
                    className={`flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 ${
                      cotizacionManual
                        ? "border-gray-200"
                        : "border-gray-100 bg-gray-100"
                    }`}
                  >
                    <span
                      className={`px-3 py-2 text-sm border-r border-gray-200 min-w-[40px] text-center ${
                        cotizacionManual ? "text-gray-400 bg-gray-50" : "text-gray-300 bg-gray-100"
                      }`}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      placeholder="0.0000"
                      disabled={!cotizacionManual}
                      value={cotizacionValor}
                      onChange={(e) => setCotizacionValor(e.target.value)}
                      className={`flex-1 px-3 py-2 text-sm focus:outline-none ${
                        cotizacionManual
                          ? "text-gray-700 bg-white"
                          : "text-gray-400 bg-gray-100 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Versión */}
        <p className="text-center text-xs text-gray-400 mt-6">versión 1.0.0</p>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar cambios
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Deseas guardar la nueva configuración?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
