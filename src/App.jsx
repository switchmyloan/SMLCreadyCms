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
import Testimonials from './pages/Testimonials/Testimonial';
import SigninUser from "./pages/SigninUser/SigninUser"
import Leads from "./pages/Leads/Leads"
import ArchiveUsers from "./pages/ArchiveUsers/ArchiveUsers"
import OnBoardLender from "./pages/OnBoardLender/OnBoardLender"
import ListOfLender from "./pages/ListOfLenders/ListOfLenders"
import NotFound from './pages/NotFound';

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
            <Route path="blog/create" element={<BlogCreate />} />
            <Route path="blogs/:id" element={<BlogCreate />} />
            <Route path="faq" element={<Faq />} />
            <Route path="press" element={<Press />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="signin-user" element={<SigninUser />} />
            <Route path="leads" element={<Leads />} />
            <Route path="archive-users" element={<ArchiveUsers />} />
            <Route path="on-borde-lender-from" element={<OnBoardLender />} />
            <Route path="list-of-lenders" element={<ListOfLender />} />
          <Route path="*" element={<NotFound />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
