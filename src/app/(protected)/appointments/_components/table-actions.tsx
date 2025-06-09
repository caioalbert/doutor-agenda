"use client";

import { useState } from "react";
import { CheckIcon, MoreVerticalIcon, TrashIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/delete-appointment";
import { updateAppointmentStatus } from "@/actions/update-appointment-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { appointmentsTable } from "@/db/schema";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

interface AppointmentsTableActionsProps {
  appointment: AppointmentWithRelations;
}

const AppointmentsTableActions = ({
  appointment,
}: AppointmentsTableActionsProps) => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar agendamento.");
    },
  });

  const updateStatusAction = useAction(updateAppointmentStatus, {
    onSuccess: () => {
      toast.success("Status do agendamento atualizado com sucesso.");
      setIsCancelDialogOpen(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar status do agendamento.");
    },
  });

  const handleDeleteAppointmentClick = () => {
    if (!appointment) return;
    deleteAppointmentAction.execute({ id: appointment.id });
  };

  const handleConfirmAppointment = () => {
    if (!appointment) return;
    updateStatusAction.execute({
      appointmentId: appointment.id,
      status: "confirmed"
    });
  };

  const handleCompleteAppointment = () => {
    if (!appointment) return;
    updateStatusAction.execute({
      appointmentId: appointment.id,
      status: "completed"
    });
  };

  const handleCancelAppointment = () => {
    if (!appointment || !cancellationReason.trim()) return;
    updateStatusAction.execute({
      appointmentId: appointment.id,
      status: "canceled",
      cancellationReason: cancellationReason.trim()
    });
  };

  // Determinar quais ações estão disponíveis com base no status atual
  const canConfirm = appointment.status === "pending";
  const canComplete = appointment.status === "confirmed";
  const canCancel = appointment.status === "pending" || appointment.status === "confirmed";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{appointment.patient.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {canConfirm && (
            <DropdownMenuItem onClick={handleConfirmAppointment}>
              <CheckIcon className="mr-2 h-4 w-4" />
              Confirmar agendamento
            </DropdownMenuItem>
          )}
          
          {canComplete && (
            <DropdownMenuItem onClick={handleCompleteAppointment}>
              <CheckIcon className="mr-2 h-4 w-4" />
              Marcar como concluído
            </DropdownMenuItem>
          )}
          
          {canCancel && (
            <DropdownMenuItem onClick={() => setIsCancelDialogOpen(true)}>
              <XIcon className="mr-2 h-4 w-4" />
              Cancelar agendamento
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja deletar esse agendamento?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser revertida. Isso irá deletar o agendamento
                  permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAppointmentClick}>
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo para cancelamento com motivo */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo do cancelamento.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo do cancelamento"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={!cancellationReason.trim()}
            >
              Cancelar agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentsTableActions;
