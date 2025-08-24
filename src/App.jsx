import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* ml-64 to offset the sidebar width */}
        <Navbar />
        <Home />
      </div>
    </div>
    </>
  )
}

export default App
