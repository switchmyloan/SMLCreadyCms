import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './pages/About'
import Blogs from './pages/Blogs/Blogs'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-64">

             <div className="fixed top-0 left-64 right-0 z-50">
            <Navbar />
          </div>
             {/* <div className="flex-1 p-4 mt-16 overflow-y-auto"> */}
             <main className="flex-1 p-4 mt-16 overflow-y-auto ">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blogs" element={<Blogs />} />
            </Routes>
            </main>
          {/* </div> */}
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
