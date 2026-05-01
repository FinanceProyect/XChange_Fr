import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import Exchanges from "./pages/Exchanges";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import GlobalToastHost from "./components/ui/GlobalToastHost";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-[1320px] mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/debtors" element={<Debtors />} />
                <Route path="/creditors" element={<Creditors />} />
                <Route path="/exchanges" element={<Exchanges />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <GlobalToastHost />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
