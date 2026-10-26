import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import GlobalToastHost from "./components/ui/GlobalToastHost";
import ProtectedRoute from "./components/routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-[1320px] mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/debtors" element={<Debtors />} />
                  <Route path="/creditors" element={<Creditors />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
              <GlobalToastHost />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
