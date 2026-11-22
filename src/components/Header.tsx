import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Home,
  Cake,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  }

  function handleSignOut() {
    signOut();
    setUserMenuOpen(false);
    navigate('/');
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/catalog', label: 'All Products', icon: Cake },
    { to: '/catalog?category=cakes', label: 'Cakes' },
    { to: '/catalog?category=cupcakes', label: 'Cupcakes' },
    { to: '/catalog?category=brownies', label: 'Brownies' },
    { to: '/catalog?category=gift-hampers', label: 'Gift Hampers' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Top announcement bar */}
      <div className="bg-brand-600 text-white text-xs py-2 text-center font-medium">
        Free delivery on orders above &#8377;999 &nbsp;&bull;&nbsp; Use code WELCOME10 for 10% off your first order
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-md">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold text-brand-700">Shan's</span>
              <span className="font-display text-xl font-bold text-accent-600"> Sweets & Bakery</span>
            </div>
          </Link>

          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for cakes, brownies, pastries..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-cream-100 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-neutral-700" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-cream-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-700" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-cream-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-neutral-900/5 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {profile?.full_name ?? 'Account'}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-50 transition-colors"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-50 transition-colors"
                    >
                      <Package className="w-4 h-4" /> Order History
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-50 transition-colors"
                    >
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-brand-600 hover:bg-cream-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full hover:bg-cream-100 transition-colors md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:block border-t border-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-6 h-12">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm font-medium text-neutral-700 hover:text-brand-600 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-100 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:border-brand-500"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-neutral-700 hover:text-brand-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
