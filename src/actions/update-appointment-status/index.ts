"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

interface UpdateAppointmentStatusInput {
  appointmentId: string;
  status: "pending" | "confirmed" | "canceled" | "completed";
  cancellationReason?: string;
}

export async function updateAppointmentStatus(input: UpdateAppointmentStatusInput) {
  try {
    // Verificar se o agendamento existe
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, input.appointmentId),
    });

    if (!appointment) {
      return { error: "Agendamento não encontrado" };
    }

    // Atualizar o status do agendamento
    const updateData: any = {
      status: input.status,
    };

    // Se o status for "canceled", adicionar o motivo do cancelamento
    if (input.status === "canceled" && input.cancellationReason) {
      updateData.cancellationReason = input.cancellationReason;
    }

    const [updatedAppointment] = await db
      .update(appointmentsTable)
      .set(updateData)
      .where(eq(appointmentsTable.id, input.appointmentId))
      .returning();

    return { appointment: updatedAppointment };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return { error: "Falha ao atualizar status do agendamento" };
  }
}
