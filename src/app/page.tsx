import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    // Se o usuário já está logado, redireciona para o dashboard apropriado
    if (session.user.plan === "premium") {
      redirect("/dashboard");
    } else {
      redirect("/patient/appointments");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Doutor Agenda" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/patient/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/patient/register">
              <Button>Cadastre-se</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Agende suas consultas médicas online
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Encontre os melhores médicos e agende consultas de forma rápida e
            fácil, sem sair de casa.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/patient/register">
              <Button size="lg" className="px-8">
                Começar agora
              </Button>
            </Link>
            <Link href="/authentication">
              <Button size="lg" variant="outline" className="px-8">
                Área da Clínica
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Por que usar o Doutor Agenda?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Agendamento Fácil</h3>
              <p className="text-gray-600">
                Agende consultas em poucos cliques, escolhendo o médico, data e
                horário que melhor se adequam à sua rotina.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Médicos Qualificados</h3>
              <p className="text-gray-600">
                Acesso a uma rede de médicos qualificados em diversas
                especialidades para cuidar da sua saúde.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Economize Tempo</h3>
              <p className="text-gray-600">
                Sem filas ou esperas ao telefone. Gerencie suas consultas de
                forma prática e rápida, a qualquer hora e lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">
            Pronto para cuidar da sua saúde?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Cadastre-se gratuitamente e comece a agendar suas consultas médicas
            de forma simples e rápida.
          </p>
          <Link href="/patient/register">
            <Button size="lg" variant="secondary" className="px-8">
              Criar conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Doutor Agenda. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
