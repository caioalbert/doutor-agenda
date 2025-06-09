"use server";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSpecialties(clinicId: string) {
  try {
    // Busca todos os médicos da clínica
    const doctors = await db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, clinicId),
    });
    
    // Extrai as especialidades únicas
    const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];
    
    return { specialties };
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return { error: "Falha ao buscar especialidades disponíveis" };
  }
}
