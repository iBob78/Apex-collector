export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-sm text-gray-400 py-4 mt-8">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        © {new Date().getFullYear()} Apex Collector · Fait avec 💎 par Etienne & ton copilote IA
      </div>
    </footer>
  );
}