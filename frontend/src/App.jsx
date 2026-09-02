import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/shared/LandingPage"
import Properties from "./pages/shared/Properties"
import PropertyDetails from "./pages/shared/PropertyDetails"

function App() {

  return (
   <div>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
    </Routes>
   </div>
  )
}

export default App
