"use server";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";

export async function getClinics() {
  try {
    const clinics = await db.query.clinicsTable.findMany({
      orderBy: (clinics, { asc }) => [asc(clinics.name)],
    });
    
    return { clinics };
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return { error: "Falha ao buscar clínicas disponíveis" };
  }
}
