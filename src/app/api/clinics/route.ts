import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/bd";
import { appUsersTable, clinicsTable, usersToClinicsTable } from "@/bd/schema";
import { authClient } from "@/lib/auth-client";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nome da clínica é obrigatório" },
        { status: 400 },
      );
    }

    // Verificar sessão
    const session = await authClient.getSession();
    if (!session.data?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Garantir que o usuário existe na appUsersTable
    await db
      .insert(appUsersTable)
      .values({ id: session.data.user.id })
      .onConflictDoNothing();

    // Inserir clínica
    const [clinic] = await db
      .insert(clinicsTable)
      .values({
        name,
        userId: session.data.user.id,
      })
      .returning();

    // Associar usuário à clínica
    await db.insert(usersToClinicsTable).values({
      userId: session.data.user.id,
      clinicId: clinic.id,
    });

    return NextResponse.json({ success: true, clinic });
  } catch (error) {
    console.error("Erro ao criar clínica:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Verificar sessão
    const session = await authClient.getSession();
    if (!session.data?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Garantir que o usuário existe na appUsersTable
    await db
      .insert(appUsersTable)
      .values({ id: session.data.user.id })
      .onConflictDoNothing();

    // Buscar clínicas do usuário
    const clinics = await db.query.usersToClinicsTable.findMany({
      where: eq(usersToClinicsTable.userId, session.data.user.id),
      with: {
        clinic: true,
      },
    });

    return NextResponse.json({ clinics });
  } catch (error) {
    console.error("Erro ao buscar clínicas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
