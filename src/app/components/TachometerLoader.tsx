"use client";

export default function TachometerLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="relative w-32 h-32">
        {/* Cercle de fond */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />

        {/* Glow lumineux derrière l’aiguille */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="w-2 h-20 bg-red-500 opacity-40 blur-xl rounded-full" />
        </div>

        {/* Aiguille animée */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
          <div className="w-1 h-12 bg-red-500 shadow-[0_0_8px_2px_rgba(255,0,0,0.7)] origin-bottom rounded" />
        </div>

        {/* Centre lumineux */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full shadow-md" />
        </div>
      </div>
    </div>
  );
}
