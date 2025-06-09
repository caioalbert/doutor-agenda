"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { createPatient } from "../create-patient";

interface CreatePatientAppointmentInput {
  doctorId: string;
  clinicId: string;
  date: Date;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientSex: "male" | "female";
}

export async function createPatientAppointment(input: CreatePatientAppointmentInput) {
  try {
    // 1. Criar ou obter o paciente
    const patientResult = await createPatient({
      name: input.patientName,
      email: input.patientEmail,
      phoneNumber: input.patientPhone,
      sex: input.patientSex,
      clinicId: input.clinicId,
    });

    if (!patientResult.patient || patientResult.error) {
      return { error: patientResult.error || "Falha ao criar paciente" };
    }

    // 2. Obter o preço da consulta do médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, input.doctorId),
    });

    if (!doctor) {
      return { error: "Médico não encontrado" };
    }

    // 3. Criar o agendamento
    const [appointment] = await db.insert(appointmentsTable).values({
      doctorId: input.doctorId,
      patientId: patientResult.patient.id,
      clinicId: input.clinicId,
      date: input.date,
      appointmentPriceInCents: doctor.appointmentPriceInCents,
      status: "pending", // Status inicial é pendente
    }).returning();

    return { appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { error: "Falha ao criar agendamento" };
  }
}
