export default function TachometerLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="relative w-32 h-32">
        {/* Cercle de fond */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />

        {/* Aiguille */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
          <div className="w-1 h-12 bg-red-500 origin-bottom rounded" />
        </div>

        {/* Centre du tachymètre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
}
