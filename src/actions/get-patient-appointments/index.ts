"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";

export async function getPatientAppointments(userEmail: string) {
  try {
    // Primeiro, encontrar o paciente pelo email do usuário
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.email, userEmail),
    });

    if (!patient) {
      return { error: "Paciente não encontrado" };
    }

    // Buscar os agendamentos do paciente
    const appointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.patientId, patient.id),
      with: {
        doctor: true,
        clinic: true,
      },
      orderBy: (appointments, { desc }) => [desc(appointments.date)],
    });

    return { 
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        date: appointment.date,
        doctorName: appointment.doctor.name,
        doctorSpecialty: appointment.doctor.specialty,
        clinicName: appointment.clinic.name,
        appointmentPriceInCents: appointment.appointmentPriceInCents,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason,
      }))
    };
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return { error: "Falha ao buscar agendamentos" };
  }
}
