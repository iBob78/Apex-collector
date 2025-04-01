import "@/styles/globals.css"; // <--- Corrige le chemin
import Menu from "@/components/Menu"; // <--- Corrige le chemin

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-900 text-white">
        <Menu />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
