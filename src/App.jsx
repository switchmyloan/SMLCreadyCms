import './App.css'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './pages/About'
import Blogs from './pages/Blogs/Blogs'
import DefaultLayout from './layouts/DefaultLayout'
import BlogCreate from './pages/Blogs/BlogsCreate'
import Faq from './pages/FAQ/Faq'
import Press from './pages/PressRoom/Press'
import LoginPage from './pages/Auth/LoginPage'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} />   {/* path="/" */}
            <Route path="about" element={<About />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/create" element={<BlogCreate />} />
            <Route path="blog/:id" element={<BlogCreate />} />
            <Route path="faq" element={<Faq />} />
            <Route path="press" element={<Press />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
