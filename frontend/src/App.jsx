import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/shared/LandingPage"

function App() {

  return (
   <div>
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
   </div>
  )
}

export default App
