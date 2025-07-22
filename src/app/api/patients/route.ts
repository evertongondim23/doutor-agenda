import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/bd";
import { patientsTable, usersToClinicsTable } from "@/bd/schema";
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
      return NextResponse.json({ patients: [] });
    }
    // Buscar pacientes da clínica
    const patients = await db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, userClinic.clinic.id),
    });
    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
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
    const { name, email, phone, sex, birthDate, rg, address, city } = body;
    if (!name || !email || !phone || !sex) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
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
    // Criar paciente
    const [patient] = await db
      .insert(patientsTable)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name,
        email,
        phone,
        sex,
        clinicId: userClinic.clinic.id,
        birthDate: birthDate ? new Date(birthDate) : null,
        rg,
        address,
        city,

        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await request.json();
    const { id, name, email, phone, sex, birthDate, rg, address, city } = body;
    if (!id || !name || !email || !phone || !sex) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }
    const [patient] = await db
      .update(patientsTable)
      .set({
        name,
        email,
        phone,
        sex,
        birthDate: birthDate ? new Date(birthDate) : null,
        rg,
        address,
        city,

        updatedAt: new Date(),
      })
      .where(eq(patientsTable.id, id))
      .returning();
    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error("Erro ao editar paciente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "ID do paciente ausente" },
        { status: 400 },
      );
    }
    await db.delete(patientsTable).where(eq(patientsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
