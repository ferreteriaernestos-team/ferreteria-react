import TopBar from './components/layout/TopBar'
import Header from './components/layout/Header'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CartSidebar from './components/ui/CartSidebar'
import WishlistSidebar from './components/ui/WishlistSidebar'
import './index.css'

function App() {
  return (
    <div>
      <TopBar />
      <Header />
      <Navbar />
      <HomePage />
      <Footer />
      <CartSidebar />
      <WishlistSidebar />
    </div>
  )
}

export default App