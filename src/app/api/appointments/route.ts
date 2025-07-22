import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/bd";
import {
  appointmentTable,
  doctorsTable,
  patientsTable,
  usersToClinicsTable,
} from "@/bd/schema";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar clínica do usuário
    const userClinic = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, session.user.id),
      with: { clinic: true },
    });
    if (!userClinic) {
      return NextResponse.json({ appointments: [] });
    }

    // Buscar agendamentos da clínica
    const appointments = await db.query.appointmentTable.findMany({
      where: eq(appointmentTable.clinicId, userClinic.clinic.id),
    });

    // Buscar dados relacionados (médico, paciente)
    const doctors = await db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, userClinic.clinic.id),
    });
    const patients = await db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, userClinic.clinic.id),
    });

    // Mapear para frontend
    const formatted = appointments.map((a) => {
      const doctor = doctors.find((d) => d.id === a.doctorId);
      const patient = patients.find((p) => p.id === a.patientId);
      return {
        id: a.id,
        patient: patient?.name || "-",
        date: `${a.date.toLocaleDateString()} ${a.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        doctor: doctor ? `Dr. ${doctor.name}` : "-",
        specialty: doctor?.specialty || "-",
        value:
          a.status === "cancelled"
            ? 0
            : doctor?.appointmentPriceInCents
              ? doctor.appointmentPriceInCents / 100
              : 0,
        status: a.status,
      };
    });

    return NextResponse.json({ appointments: formatted });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await request.json();
    const { doctorId, patientId, date, time, status } = body;
    if (!doctorId || !patientId || !date || !time || !status) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }

    // Verificar se o médico está disponível no horário
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });
    if (!doctor) {
      return NextResponse.json(
        { error: "Médico não encontrado" },
        { status: 400 },
      );
    }

    // Verificar disponibilidade do médico baseado no dia da semana e horário
    const appointmentDate = new Date(date);
    const appointmentTime = new Date(time);
    const weekday = appointmentDate.getDay();
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentWeekday = weekdays[weekday];

    // Verificar se o médico atende no dia da semana
    if (
      currentWeekday < doctor.availabilityFromWeekday ||
      currentWeekday > doctor.availabilityToWeekday
    ) {
      return NextResponse.json(
        { error: "Médico não atende neste dia da semana" },
        { status: 400 },
      );
    }

    // Verificar se o horário está dentro do período de atendimento do médico
    const appointmentTimeOnly =
      appointmentTime.getHours() * 60 + appointmentTime.getMinutes();
    const doctorFromTime =
      doctor.availabilityFromTime.getHours() * 60 +
      doctor.availabilityFromTime.getMinutes();
    const doctorToTime =
      doctor.availabilityToTime.getHours() * 60 +
      doctor.availabilityToTime.getMinutes();

    if (
      appointmentTimeOnly < doctorFromTime ||
      appointmentTimeOnly > doctorToTime
    ) {
      return NextResponse.json(
        { error: "Horário fora do período de atendimento do médico" },
        { status: 400 },
      );
    }
    // Buscar clínica do usuário
    const userClinic = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, session.user.id),
      with: { clinic: true },
    });
    if (!userClinic) {
      return NextResponse.json(
        { error: "Usuário não possui clínica associada" },
        { status: 400 },
      );
    }
    // Criar agendamento
    const [appointment] = await db
      .insert(appointmentTable)
      .values({
        id: crypto.randomUUID(),
        doctorId,
        patientId,
        date: new Date(date),
        time: new Date(time),
        clinicId: userClinic.clinic.id,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
