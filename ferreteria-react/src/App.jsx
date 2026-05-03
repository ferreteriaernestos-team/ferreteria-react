import TopBar from './components/layout/TopBar'
import Header from './components/layout/Header'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CartSidebar from './components/ui/CartSidebar'
import WishlistSidebar from './components/ui/WishlistSidebar'
import AuthModal from './components/ui/AuthModal'
import PromoBanner from './components/ui/PromoBanner'
import './index.css'

function App() {
  return (
    <div>
      <PromoBanner />
      <TopBar />
      <Header />
      <Navbar />
      <HomePage />
      <Footer />
      <CartSidebar />
      <WishlistSidebar />
      <AuthModal />
    </div>
  )
}

export default App