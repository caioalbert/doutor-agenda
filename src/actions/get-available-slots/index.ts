"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { addMinutes, format, isWithinInterval, setHours, setMinutes } from "date-fns";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";

interface GetAvailableSlotsInput {
  doctorId: string;
  date: Date;
}

export async function getAvailableSlots(input: GetAvailableSlotsInput) {
  try {
    // 1. Obter informações do médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, input.doctorId),
    });

    if (!doctor) {
      return { error: "Médico não encontrado" };
    }

    // 2. Verificar se o dia da semana está dentro da disponibilidade do médico
    const dayOfWeek = input.date.getDay(); // 0 = domingo, 1 = segunda, ...
    if (dayOfWeek < doctor.availableFromWeekDay || dayOfWeek > doctor.availableToWeekDay) {
      return { slots: [] }; // Médico não atende neste dia da semana
    }

    // 3. Obter os horários de início e fim do médico
    const fromTime = doctor.availableFromTime.split(':').map(Number);
    const toTime = doctor.availableToTime.split(':').map(Number);
    
    // 4. Criar slots de 30 minutos entre os horários disponíveis
    const slots: { time: string; available: boolean }[] = [];
    
    let currentTime = setHours(setMinutes(input.date, fromTime[1]), fromTime[0]);
    const endTime = setHours(setMinutes(input.date, toTime[1]), toTime[0]);
    
    // 5. Buscar agendamentos existentes para este médico neste dia
    const startOfDay = new Date(input.date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(input.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, input.doctorId),
        gte(appointmentsTable.date, startOfDay),
        lt(appointmentsTable.date, endOfDay)
      ),
    });
    
    // 6. Criar slots e marcar os que já estão ocupados
    while (currentTime < endTime) {
      const slotTime = format(currentTime, 'HH:mm');
      
      // Verificar se este horário já está agendado
      const isBooked = existingAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.date);
        // Considera que uma consulta dura 30 minutos
        return isWithinInterval(currentTime, {
          start: appointmentTime,
          end: addMinutes(appointmentTime, 30)
        });
      });
      
      slots.push({
        time: slotTime,
        available: !isBooked
      });
      
      // Avança 30 minutos
      currentTime = addMinutes(currentTime, 30);
    }
    
    return { slots };
  } catch (error) {
    console.error("Error getting available slots:", error);
    return { error: "Falha ao buscar horários disponíveis" };
  }
}
