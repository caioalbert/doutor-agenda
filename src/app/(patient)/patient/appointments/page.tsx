"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, ClockIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { getPatientAppointments } from "@/actions/get-patient-appointments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Tipo para representar um agendamento
type Appointment = {
  id: string;
  date: Date;
  doctorName: string;
  doctorSpecialty: string;
  clinicName: string;
  appointmentPriceInCents: number;
  status: "pending" | "confirmed" | "canceled" | "completed";
  cancellationReason?: string | null;
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!session.data?.user) {
      router.push("/patient/login");
      return;
    }
    
    // Buscar os agendamentos do paciente
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const result = await getPatientAppointments(session.data.user.email);
        
        if (result.appointments) {
          setAppointments(result.appointments);
        } else if (result.error) {
          // Se o erro for "Paciente não encontrado", pode ser que o usuário
          // ainda não tenha feito nenhum agendamento
          if (result.error === "Paciente não encontrado") {
            setAppointments([]);
          } else {
            toast.error(result.error);
          }
        }
      } catch (error) {
        toast.error("Erro ao buscar agendamentos");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, [session.data, router]);

  const handleNewAppointment = () => {
    router.push("/patient/new-appointment");
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "canceled":
        return "Cancelado";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (status) {
      case "pending":
        variant = "outline";
        break;
      case "confirmed":
        variant = "default";
        break;
      case "canceled":
        variant = "destructive";
        break;
      case "completed":
        variant = "secondary";
        break;
    }
    
    return <Badge variant={variant}>{getStatusText(status)}</Badge>;
  };

  // Se estiver carregando a sessão, mostra um indicador de carregamento
  if (session.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Consultas</h1>
          <p className="text-muted-foreground">
            Gerencie suas consultas médicas
          </p>
        </div>
        <Button onClick={handleNewAppointment}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Carregando consultas...</p>
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="mb-4 text-center text-muted-foreground">
              Você ainda não tem consultas agendadas.
            </p>
            <Button onClick={handleNewAppointment}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Agendar Consulta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{appointment.doctorName}</CardTitle>
                  {getStatusBadge(appointment.status)}
                </div>
                <CardDescription>{appointment.doctorSpecialty}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(appointment.date), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(appointment.date), "HH:mm")}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">
                      {appointment.clinicName}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(appointment.appointmentPriceInCents / 100)}
                    </span>
                  </div>
                  
                  {appointment.status === "canceled" && appointment.cancellationReason && (
                    <div className="mt-4 rounded-md bg-red-50 p-3">
                      <p className="text-sm font-medium text-red-800">Motivo do cancelamento:</p>
                      <p className="text-sm text-red-700">{appointment.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
