import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import Settings from "./pages/Settings";
import GlobalToastHost from "./components/ui/GlobalToastHost";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-[1320px] mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/debtors" element={<Debtors />} />
          <Route path="/creditors" element={<Creditors />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <GlobalToastHost />
    </div>
  );
}

export default App;
