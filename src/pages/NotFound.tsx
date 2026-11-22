import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <h1 className="font-display text-7xl font-bold text-brand-600">404</h1>
        <h2 className="font-display text-2xl font-bold text-neutral-900 mt-4">Page Not Found</h2>
        <p className="text-neutral-500 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary text-base px-8 py-3.5">
          <Home className="w-4 h-4" /> Go Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
