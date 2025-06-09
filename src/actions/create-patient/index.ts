"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { patientSexEnum } from "@/db/schema";

interface CreatePatientInput {
  name: string;
  email: string;
  phoneNumber: string;
  sex: "male" | "female";
  clinicId: string;
}

export async function createPatient(input: CreatePatientInput) {
  try {
    // Verificar se o paciente já existe
    const existingPatient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.email, input.email),
    });

    if (existingPatient) {
      // Se o paciente já existe, retorna o paciente existente
      return { patient: existingPatient };
    }

    // Criar novo paciente
    const [patient] = await db.insert(patientsTable).values({
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      sex: input.sex as typeof patientSexEnum.enumValues[number],
      clinicId: input.clinicId,
    }).returning();

    return { patient };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { error: "Falha ao criar paciente" };
  }
}
