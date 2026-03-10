import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Dashboard from './pages/Dashboard'
import Balances from './pages/Balances'
import Trade from './pages/Trade'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-[1320px] mx-auto">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
        <Route path="/balances" element={<Balances />}  />
        <Route path="/trade"    element={<Trade />}     />
        </Routes>
      </main>
    </div>
  )
}

export default App
