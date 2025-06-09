"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const session = authClient.useSession();
  
  // Verificamos se estamos em uma página que precisa de header
  // (login e register não precisam)
  const isAuthPage = 
    pathname.includes("/login") || 
    pathname.includes("/register");

  // Se não for página de autenticação e não estiver logado, não renderiza nada
  // A página específica vai redirecionar para login
  if (!isAuthPage && !session.data?.user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && (
        <header className="border-b bg-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Link href="/">
                <img src="/logo.svg" alt="Doutor Agenda" className="h-8" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/patient/appointments">
                <Button variant="ghost" size="sm">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Minhas Consultas
                </Button>
              </Link>
              <Link href="/patient/profile">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Button>
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">{children}</main>
      
      {!isAuthPage && (
        <footer className="border-t bg-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Doutor Agenda. Todos os direitos
              reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
