import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Booster Packs', path: '/boosters' },
  { label: 'Achievements', path: '/achievements' },
  { label: 'Profile', path: '/profile' },
  { label: 'Settings', path: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-white shadow px-4 py-2 flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-blue-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-6">{children}</main>
      <footer className="bg-white border-t py-3 text-center text-sm text-gray-500">
        Apex Collector © {new Date().getFullYear()}
      </footer>
    </div>
  );
}