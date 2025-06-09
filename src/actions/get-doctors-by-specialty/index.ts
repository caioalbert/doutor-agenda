"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";

export async function getDoctorsBySpecialty(clinicId: string, specialty: string) {
  try {
    const doctors = await db.query.doctorsTable.findMany({
      where: and(
        eq(doctorsTable.clinicId, clinicId),
        eq(doctorsTable.specialty, specialty)
      ),
      orderBy: (doctors, { asc }) => [asc(doctors.name)],
    });
    
    return { 
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        appointmentPriceInCents: doctor.appointmentPriceInCents,
        availableFromWeekDay: doctor.availableFromWeekDay,
        availableToWeekDay: doctor.availableToWeekDay,
        availableFromTime: doctor.availableFromTime,
        availableToTime: doctor.availableToTime,
      }))
    };
  } catch (error) {
    console.error("Error fetching doctors by specialty:", error);
    return { error: "Falha ao buscar médicos disponíveis" };
  }
}
