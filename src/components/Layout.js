
import Menu from '@/components/Menu'; // Chemin correct

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Menu en haut */}
      <Menu />

      {/* Contenu principal */}
      <main className="p-4">{children}</main>
    </div>
  );
}
