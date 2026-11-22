import { Link } from 'react-router-dom';
import { Cake, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white">Shan's</span>

                <span className="font-display text-xl font-bold text-accent-400"> Sweets & Bakery</span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Fresh-baked cakes, brownies, pastries and gifts made with love. Delivered to your door across the city.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-600 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-600 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-600 transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog?category=cakes" className="hover:text-accent-400 transition-colors">Cakes</Link></li>
              <li><Link to="/catalog?category=cupcakes" className="hover:text-accent-400 transition-colors">Cupcakes</Link></li>
              <li><Link to="/catalog?category=brownies" className="hover:text-accent-400 transition-colors">Brownies</Link></li>
              <li><Link to="/catalog?category=pastries" className="hover:text-accent-400 transition-colors">Pastries</Link></li>
              <li><Link to="/catalog?category=gift-hampers" className="hover:text-accent-400 transition-colors">Gift Hampers</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-accent-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-accent-400 transition-colors">Contact</Link></li>
              <li><Link to="/orders" className="hover:text-accent-400 transition-colors">Track Order</Link></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent-400 mt-0.5 shrink-0" />
                <span>123 Bakery Lane, Food District,Thanjavur 613 001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                <span>hello@shansbakery.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-10 pt-6 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Shan's Sweets & Bakery. All rights reserved. Baked with love.
        </div>
      </div>
    </footer>
  );
}
