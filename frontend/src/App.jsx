import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/shared/LandingPage"
import Properties from "./pages/shared/Properties"

function App() {

  return (
   <div>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/properties" element={<Properties />} />
    </Routes>
   </div>
  )
}

export default App
