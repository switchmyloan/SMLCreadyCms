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
import DefaultLayout from './layouts/DefaultLayout'
import BlogCreate from './pages/Blogs/BlogsCreate'

function App() {
  const [count, setCount] = useState(0)


  // Dynamic routes array
  const routes = [
    { path: '/', element: <Home /> },
    { path: '/about', element: <About /> },
    { path: '/blogs', element: <Blogs /> },
    { path: '/blogs/create', element: <BlogCreate /> },
    { path: '/blog/:id', element: <BlogCreate /> }
  ];

  return (
    <>
      <BrowserRouter>
        <DefaultLayout>
          <Routes>
            {routes.map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
          </Routes>
        </DefaultLayout>
      </BrowserRouter>
    </>
  )
}

export default App
