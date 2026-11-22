import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />}
        </div>
      ))}
    </nav>
  );
}
