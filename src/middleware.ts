import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Ajoute ici ta logique de vérification si nécessaire
  return NextResponse.next();
}
