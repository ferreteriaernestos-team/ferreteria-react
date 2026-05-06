import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopBar from './components/layout/TopBar'
import Header from './components/layout/Header'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import PromocionesPage from './pages/PromocionesPage'
import CartSidebar from './components/ui/CartSidebar'
import WishlistSidebar from './components/ui/WishlistSidebar'
import AuthModal from './components/ui/AuthModal'
import PromoBanner from './components/ui/PromoBanner'
import ToastContainer from './components/ui/ToastContainer'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <PromoBanner />
      <TopBar />
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/promociones" element={<PromocionesPage />} />
      </Routes>
      <Footer />
      <CartSidebar />
      <WishlistSidebar />
      <AuthModal />
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App