import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/bd";
import { appUsersTable, doctorsTable, usersToClinicsTable } from "@/bd/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      specialty,
      avatarImage,
      availabilityFromWeekday,
      availabilityToWeekday,
      availabilityFromTime,
      availabilityToTime,
      appointmentPrice,
    } = await request.json();

    // Validações básicas
    if (
      !name ||
      !specialty ||
      !availabilityFromWeekday ||
      !availabilityToWeekday ||
      !availabilityFromTime ||
      !availabilityToTime ||
      !appointmentPrice
    ) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 },
      );
    }

    // Verificar sessão
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Garantir que o usuário existe na appUsersTable
    await db
      .insert(appUsersTable)
      .values({ id: session.user.id })
      .onConflictDoNothing();

    // Buscar clínica do usuário
    const userClinic = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, session.user.id),
      with: {
        clinic: true,
      },
    });

    if (!userClinic) {
      return NextResponse.json(
        { error: "Usuário não possui clínica associada" },
        { status: 400 },
      );
    }

    // Converter horários para timestamp
    const fromTimeDate = new Date(`1970-01-01T${availabilityFromTime}:00.000Z`);
    const toTimeDate = new Date(`1970-01-01T${availabilityToTime}:00.000Z`);

    // Converter preço para centavos
    const priceInCents = Math.round(appointmentPrice * 100);

    // Inserir médico
    const [doctor] = await db
      .insert(doctorsTable)
      .values({
        userId: session.user.id,
        name,
        specialty,
        avatarImage: avatarImage || null,
        availabilityFromWeekday: availabilityFromWeekday.toLowerCase(),
        availabilityToWeekday: availabilityToWeekday.toLowerCase(),
        availabilityFromTime: fromTimeDate,
        availabilityToTime: toTimeDate,
        appointmentPriceInCents: priceInCents,
        clinicId: userClinic.clinic.id,
      })
      .returning();

    return NextResponse.json({ success: true, doctor });
  } catch (error) {
    console.error("Erro ao criar médico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar sessão
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Garantir que o usuário existe na appUsersTable
    await db
      .insert(appUsersTable)
      .values({ id: session.user.id })
      .onConflictDoNothing();

    // Buscar clínica do usuário
    const userClinic = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, session.user.id),
      with: {
        clinic: true,
      },
    });

    if (!userClinic) {
      return NextResponse.json({ doctors: [] });
    }

    // Buscar médicos da clínica
    const doctors = await db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, userClinic.clinic.id),
    });

    // Formatar dados para o frontend
    const formattedDoctors = doctors.map((doctor) => ({
      ...doctor,
      appointmentPrice: doctor.appointmentPriceInCents / 100,
      availabilityFromTime: doctor.availabilityFromTime
        .toISOString()
        .slice(11, 16),
      availabilityToTime: doctor.availabilityToTime.toISOString().slice(11, 16),
    }));

    return NextResponse.json({ doctors: formattedDoctors });
  } catch (error) {
    console.error("Erro ao buscar médicos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
